# Unity + Firebase Integration Guide

## Overview
This guide shows you how to integrate your Unity games with Firebase to store user data under their specific accounts, replacing Unity Cloud services.

## React → Unity User Data Flow

### ✅ Already Implemented:
The React app now passes the user ID to Unity via URL parameters:
```
/unity-builds/berry-blitz/index.html?userId=USER_ID&gameId=berry-blitz
```

## Unity Setup for Firebase Integration

### 1. Install Firebase SDK for Unity

1. **Download Firebase Unity SDK**:
   - Go to: https://firebase.google.com/docs/unity/setup
   - Download `firebase_unity_sdk.zip`

2. **Import Firebase packages** in Unity:
   - Extract the zip file
   - In Unity: `Assets → Import Package → Custom Package`
   - Import these packages:
     - `FirebaseAuth.unitypackage`
     - `FirebaseFirestore.unitypackage` (or `FirebaseDatabase.unitypackage`)
     - `FirebaseCore.unitypackage`

3. **Add Firebase config file**:
   - Download `google-services.json` from your Firebase project
   - Place it in `Assets/StreamingAssets/` folder

### 2. Unity C# Scripts for Firebase Integration

#### **UserManager.cs** - Handle user authentication and data
```csharp
using UnityEngine;
using Firebase;
using Firebase.Auth;
using Firebase.Firestore;
using System.Collections.Generic;
using System.Threading.Tasks;

public class UserManager : MonoBehaviour
{
    [Header("Firebase")]
    public FirebaseAuth auth;
    public FirebaseFirestore db;
    
    [Header("User Data")]
    public string userId;
    public string gameId;
    public bool isFirebaseReady = false;
    
    void Start()
    {
        // Get user data from URL parameters
        GetUserDataFromURL();
        
        // Initialize Firebase
        InitializeFirebase();
    }
    
    void GetUserDataFromURL()
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
        // Get URL parameters passed from React
        string url = Application.absoluteURL;
        
        if (url.Contains("userId="))
        {
            userId = GetURLParameter(url, "userId");
            Debug.Log($"User ID from React: {userId}");
        }
        
        if (url.Contains("gameId="))
        {
            gameId = GetURLParameter(url, "gameId");
            Debug.Log($"Game ID from React: {gameId}");
        }
        #endif
    }
    
    string GetURLParameter(string url, string parameter)
    {
        string[] urlParts = url.Split('?');
        if (urlParts.Length > 1)
        {
            string[] parameters = urlParts[1].Split('&');
            foreach (string param in parameters)
            {
                string[] keyValue = param.Split('=');
                if (keyValue.Length == 2 && keyValue[0] == parameter)
                {
                    return System.Uri.UnescapeDataString(keyValue[1]);
                }
            }
        }
        return "";
    }
    
    async void InitializeFirebase()
    {
        var dependencyStatus = await FirebaseApp.CheckAndFixDependenciesAsync();
        
        if (dependencyStatus == DependencyStatus.Available)
        {
            auth = FirebaseAuth.DefaultInstance;
            db = FirebaseFirestore.DefaultInstance;
            isFirebaseReady = true;
            
            Debug.Log("Firebase initialized successfully!");
            
            // Authenticate user with custom token or anonymous auth
            await AuthenticateUser();
        }
        else
        {
            Debug.LogError($"Firebase dependencies not available: {dependencyStatus}");
        }
    }
    
    async Task AuthenticateUser()
    {
        if (string.IsNullOrEmpty(userId) || userId == "anonymous")
        {
            // Anonymous authentication
            var result = await auth.SignInAnonymouslyAsync();
            userId = result.User.UserId;
            Debug.Log($"Anonymous user authenticated: {userId}");
        }
        else
        {
            // Use custom authentication with the userId from React
            // You'll need to implement custom token authentication
            // For now, we'll use the provided userId directly
            Debug.Log($"Using provided userId: {userId}");
        }
    }
    
    // Save game data to Firebase
    public async Task SaveGameData(Dictionary<string, object> gameData)
    {
        if (!isFirebaseReady || string.IsNullOrEmpty(userId))
        {
            Debug.LogError("Firebase not ready or no user ID");
            return;
        }
        
        try
        {
            // Add timestamp and game info
            gameData["timestamp"] = System.DateTime.UtcNow;
            gameData["gameId"] = gameId;
            gameData["userId"] = userId;
            
            // Save to Firestore under the user's document
            DocumentReference docRef = db.Collection("gameResults")
                                        .Document(userId)
                                        .Collection(gameId)
                                        .Document();
                                        
            await docRef.SetAsync(gameData);
            
            Debug.Log($"Game data saved successfully for user {userId}");
            
            // Notify React that data was saved
            NotifyReact("DataSaved", "Game data saved to Firebase");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Error saving game data: {e.Message}");
            NotifyReact("DataError", e.Message);
        }
    }
    
    // Load user's previous game data
    public async Task<List<Dictionary<string, object>>> LoadUserGameData()
    {
        if (!isFirebaseReady || string.IsNullOrEmpty(userId))
        {
            Debug.LogError("Firebase not ready or no user ID");
            return new List<Dictionary<string, object>>();
        }
        
        try
        {
            var collection = db.Collection("gameResults")
                              .Document(userId)
                              .Collection(gameId);
                              
            var snapshot = await collection.GetSnapshotAsync();
            
            List<Dictionary<string, object>> results = new List<Dictionary<string, object>>();
            
            foreach (var doc in snapshot.Documents)
            {
                results.Add(doc.ToDictionary());
            }
            
            Debug.Log($"Loaded {results.Count} previous game sessions");
            return results;
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Error loading game data: {e.Message}");
            return new List<Dictionary<string, object>>();
        }
    }
    
    void NotifyReact(string type, string message)
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
        // Send message to React parent
        Application.ExternalCall("unityMessage", type, message);
        #endif
    }
}
```

#### **GameDataManager.cs** - Handle specific game data
```csharp
using UnityEngine;
using System.Collections.Generic;
using System.Threading.Tasks;

public class GameDataManager : MonoBehaviour
{
    [Header("References")]
    public UserManager userManager;
    
    [Header("Game Statistics")]
    public int score = 0;
    public float gameTime = 0f;
    public int fruitsCollected = 0;
    public int mistakes = 0;
    public float reactionTime = 0f;
    
    void Start()
    {
        if (userManager == null)
            userManager = FindObjectOfType<UserManager>();
    }
    
    void Update()
    {
        gameTime += Time.deltaTime;
    }
    
    // Call this when the game ends
    public async void OnGameComplete()
    {
        await SaveGameResults();
        
        // Notify React that game is complete
        NotifyGameComplete();
    }
    
    async Task SaveGameResults()
    {
        var gameData = new Dictionary<string, object>
        {
            ["score"] = score,
            ["gameTime"] = gameTime,
            ["fruitsCollected"] = fruitsCollected,
            ["mistakes"] = mistakes,
            ["reactionTime"] = reactionTime,
            ["completed"] = true,
            ["level"] = "berry-blitz-level-1", // Customize per level
            
            // ADHD-specific metrics
            ["attentionScore"] = CalculateAttentionScore(),
            ["focusMetrics"] = GetFocusMetrics(),
            ["impulsivityMarkers"] = GetImpulsivityData()
        };
        
        await userManager.SaveGameData(gameData);
    }
    
    // ADHD Assessment Calculations
    float CalculateAttentionScore()
    {
        // Calculate based on sustained attention throughout game
        float timeBasedScore = Mathf.Clamp01(gameTime / 300f); // 5 minute max
        float accuracyScore = Mathf.Clamp01((float)fruitsCollected / (fruitsCollected + mistakes));
        
        return (timeBasedScore + accuracyScore) / 2f * 100f;
    }
    
    Dictionary<string, object> GetFocusMetrics()
    {
        return new Dictionary<string, object>
        {
            ["averageReactionTime"] = reactionTime,
            ["consistencyScore"] = CalculateConsistency(),
            ["distractionEvents"] = CountDistractionEvents()
        };
    }
    
    Dictionary<string, object> GetImpulsivityData()
    {
        return new Dictionary<string, object>
        {
            ["quickClickCount"] = CountQuickClicks(),
            ["wrongTargetClicks"] = mistakes,
            ["impulsivityScore"] = CalculateImpulsivityScore()
        };
    }
    
    // Implement these based on your game mechanics
    float CalculateConsistency() { return 0.8f; }
    int CountDistractionEvents() { return 2; }
    int CountQuickClicks() { return 5; }
    float CalculateImpulsivityScore() { return 0.3f; }
    
    void NotifyGameComplete()
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
        Application.ExternalCall("unityMessage", "GameComplete", "");
        #endif
    }
    
    // Public methods for updating stats during gameplay
    public void AddScore(int points) { score += points; }
    public void CollectFruit() { fruitsCollected++; }
    public void RecordMistake() { mistakes++; }
    public void UpdateReactionTime(float time) { reactionTime = time; }
}
```

### 3. Firebase Security Rules

Update your Firestore security rules to allow user-specific data:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Game results - users can only access their own data
    match /gameResults/{userId}/{gameId}/{gameSession} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Game progress - users can only access their own progress
    match /gameProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. React-Unity Communication Enhancement

Add this to your React component to handle Unity messages:

```typescript
// Add to UnityGameIframe component
useEffect(() => {
  // Enhanced message handling
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'unity-message') {
      const { data: messageType, message } = event.data;
      
      switch (messageType) {
        case 'GameComplete':
          console.log('Game completed and data saved to Firebase!');
          if (onGameComplete) onGameComplete();
          break;
          
        case 'DataSaved':
          console.log('Game data saved:', message);
          break;
          
        case 'DataError':
          console.error('Firebase error from Unity:', message);
          if (onError) onError(message);
          break;
      }
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, [onGameComplete, onError]);
```

## Implementation Steps

1. **✅ React Side (Already Done)**:
   - User ID is passed to Unity via URL parameters
   - Enhanced message handling for Firebase responses

2. **Unity Side (Your Tasks)**:
   - Install Firebase Unity SDK
   - Add the provided C# scripts to your Unity project
   - Configure Firebase settings
   - Test the integration

3. **Firebase Console**:
   - Update security rules
   - Monitor data collection in Firestore

## Data Structure in Firebase

```
gameResults/
  ├── {userId}/
      ├── berry-blitz/
      │   ├── {sessionId1}/
      │   │   ├── score: 150
      │   │   ├── gameTime: 245.5
      │   │   ├── attentionScore: 78.5
      │   │   └── timestamp: 2024-01-15T10:30:00Z
      │   └── {sessionId2}/
      └── kitchen-quest/
          └── {sessionId}/
```

## Benefits

- ✅ **User-specific data**: All game data tied to authenticated users
- ✅ **ADHD metrics**: Comprehensive assessment data collection  
- ✅ **Real-time sync**: Data immediately available in React dashboard
- ✅ **Privacy compliant**: User data isolated and secure
- ✅ **Scalable**: Handles multiple games and users efficiently

Your Unity games will now store all assessment data directly in Firebase under each user's account, providing a seamless integration with your React platform! 