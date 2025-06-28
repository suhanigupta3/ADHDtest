# Firebase Security Rules for ADHD Test App

## Firestore Security Rules

You need to update your Firestore security rules to allow authenticated users to read their own data. Here are the recommended rules:

### Basic Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read and write their own results
    match /users/{userId}/results/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow access to results field within user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### More Restrictive Rules (If you want to separate results)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Game results - separate collection
    match /results/{resultId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Or if results are stored as subcollections
    match /users/{userId}/results/{resultId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## How to Update Firebase Security Rules

### Option 1: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`adhd-test-54cd8`)
3. Go to **Firestore Database** → **Rules**
4. Replace the existing rules with the ones above
5. Click **Publish**

### Option 2: Firebase CLI
1. Install Firebase CLI if you haven't:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```

4. Create a `firestore.rules` file with the rules above

5. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Data Structure Recommendations

### Option 1: Results as a field in user document (Current approach)
```javascript
// Document: /users/{userId}
{
  email: "user@example.com",
  displayName: "John Doe",
  results: {
    berryBlitz: {
      rounds: [...],
      selfReport: {...},
      scores: {...}
    },
    astrodrift: {
      // ... game data
    }
  }
}
```

### Option 2: Results as separate documents
```javascript
// Document: /users/{userId}/results/{gameName}
{
  userId: "user123",
  gameName: "berryBlitz",
  rounds: [...],
  selfReport: {...},
  scores: {...},
  timestamp: Timestamp
}
```

## Testing the Rules

You can test your security rules in the Firebase Console:

1. Go to **Firestore Database** → **Rules**
2. Click **Rules Playground**
3. Test different scenarios:
   - Authenticated user reading their own data
   - Authenticated user reading other user's data (should fail)
   - Unauthenticated user reading data (should fail)

## Common Issues and Solutions

### Issue: "Missing or insufficient permissions"
**Solution**: Make sure the user is authenticated and the rules allow access to the specific path.

### Issue: "Permission denied"
**Solution**: Check that the user ID in the request matches the document path or resource data.

### Issue: "Document does not exist"
**Solution**: The document might not exist yet. Consider creating it when the user first completes an assessment.

## Current Implementation Notes

The GameResultsPage component is currently:
1. Trying to access `/users/{userId}` document
2. Looking for a `results` field within that document
3. Using mock data as a fallback when Firebase access fails

## Next Steps

1. **Update Firebase Rules**: Use the rules provided above
2. **Test with Real Data**: Once rules are updated, test with actual user data
3. **Remove Mock Data**: When everything works, remove the mock data fallback
4. **Add Data Creation**: Ensure results are properly saved when users complete assessments

## Debugging Tips

1. **Check Console Logs**: The component now logs user data to help debug
2. **Verify Authentication**: Make sure users are properly authenticated
3. **Check Document Structure**: Ensure the data structure matches what the component expects
4. **Test Rules**: Use the Firebase Rules Playground to test your rules

## Security Best Practices

1. **Always authenticate users** before allowing data access
2. **Use user-specific paths** to prevent cross-user data access
3. **Validate data** on both client and server side
4. **Limit write access** to only necessary operations
5. **Regularly review** and update security rules 