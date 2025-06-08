# Unity Integration Guide for ADHD Assessment Platform

## Overview
This guide shows you how to integrate your Unity WebGL builds (including BerryBlitz) into your React ADHD assessment platform.

## Prerequisites
- Unity WebGL build files (`.js`, `.wasm`, `.data` files)
- React project running (already set up)
- `react-unity-webgl` package installed ✅

## Directory Structure
```
public/
├── unity-builds/
│   ├── berry-blitz/           # Your BerryBlitz build files go here
│   │   ├── Build.loader.js
│   │   ├── Build.framework.js
│   │   ├── Build.wasm
│   │   └── Build.data
│   ├── kitchen-quest/
│   └── astrodrift/
```

## Step 1: Export Unity Project to WebGL

### In Unity Editor:
1. Open your BerryBlitz Unity project
2. Go to **File > Build Settings**
3. Select **WebGL** platform
4. Click **Switch Platform** if not already selected
5. Click **Player Settings** and configure:
   - **Company Name**: Your company name
   - **Product Name**: "BerryBlitz"
   - **WebGL Settings**:
     - **Template**: Default (or Minimal)
     - **Compression Format**: Gzip (recommended)
     - **Memory Size**: 256MB (or as needed)

### Build Settings:
```
Development Build: ☐ (uncheck for production)
Autoconnect Profiler: ☐ (uncheck)
Script Debugging: ☐ (uncheck for production)
```

6. Click **Build** and choose a folder (e.g., `unity-export/berry-blitz`)

## Step 2: Copy Build Files to React Project

After Unity build completes, you'll have a folder with:
```
Build/
├── berry-blitz.loader.js
├── berry-blitz.framework.js
├── berry-blitz.wasm
├── berry-blitz.data
└── berry-blitz.json
```

**Copy these files to your React project:**
```bash
# From your Unity build folder, copy to React public folder
cp Build/berry-blitz.loader.js public/unity-builds/berry-blitz/Build.loader.js
cp Build/berry-blitz.framework.js public/unity-builds/berry-blitz/Build.framework.js
cp Build/berry-blitz.wasm public/unity-builds/berry-blitz/Build.wasm
cp Build/berry-blitz.data public/unity-builds/berry-blitz/Build.data
```

**Important**: Rename the files to the standard naming convention:
- `[gamename].loader.js` → `Build.loader.js`
- `[gamename].framework.js` → `Build.framework.js`
- `[gamename].wasm` → `Build.wasm`
- `[gamename].data` → `Build.data`

## Step 3: Unity C# Script Integration (Optional)

To enable communication between Unity and React, add this script to your Unity project:

```csharp
// GameManager.cs - Place this on a GameObject in your scene
using UnityEngine;
using System.Runtime.InteropServices;

public class GameManager : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void SendMessageToReact(string message);
    
    // Call this when game is completed
    public void CompleteGame()
    {
        Debug.Log("Game completed!");
        #if UNITY_WEBGL && !UNITY_EDITOR
        SendMessageToReact("GameComplete");
        #endif
    }
    
    // Call this when an error occurs
    public void ReportError(string errorMessage)
    {
        Debug.LogError("Game error: " + errorMessage);
        #if UNITY_WEBGL && !UNITY_EDITOR
        SendMessageToReact("GameError:" + errorMessage);
        #endif
    }
    
    // React can call this function
    public void StartGame()
    {
        Debug.Log("Game started from React!");
        // Your game start logic here
    }
    
    public void PauseGame()
    {
        Debug.Log("Game paused from React!");
        // Your game pause logic here
    }
}
```

And create a JavaScript plugin file:

```javascript
// Create: Assets/Plugins/WebGL/ReactBridge.jslib
mergeInto(LibraryManager.library, {
    SendMessageToReact: function(message) {
        var messageString = UTF8ToString(message);
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage({
                type: 'unity-message', 
                data: messageString
            }, '*');
        }
    }
});
```

## Step 4: Test the Integration

1. **Start your React development server:**
   ```bash
   npm start
   ```

2. **Navigate to** `localhost:3000/assessment`

3. **Click on "Berry Blitz"** - it should load your Unity game!

## Troubleshooting

### Common Issues:

1. **"Failed to load Unity build"**
   - Check file paths are correct
   - Ensure all 4 build files are present
   - Check browser console for specific errors

2. **"WebGL not supported"**
   - Make sure you're using a modern browser
   - Enable hardware acceleration if disabled

3. **"Memory allocation failed"**
   - Reduce Memory Size in Unity WebGL settings
   - Close other browser tabs to free memory

4. **Game loads but is unresponsive**
   - Check Unity console for JavaScript errors
   - Ensure your Unity version supports WebGL properly

### File Size Optimization:

```
Unity WebGL Settings:
- Compression Format: Gzip
- Strip Engine Code: Yes
- Managed Stripping Level: High
- IL2CPP Code Generation: Faster (smaller) builds
```

## Alternative Integration Methods

### Method 1: Direct HTML (if React integration has issues)
Create `public/unity-builds/berry-blitz/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>BerryBlitz</title>
    <style>
        body { margin: 0; padding: 0; background: #000; }
        #unity-container { width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <div id="unity-container"></div>
    <script src="Build.loader.js"></script>
    <script>
        createUnityInstance(document.querySelector("#unity-container"), {
            dataUrl: "Build.data",
            frameworkUrl: "Build.framework.js",
            codeUrl: "Build.wasm",
        });
    </script>
</body>
</html>
```

Then use an iframe in React:
```jsx
<iframe 
    src="/unity-builds/berry-blitz/index.html" 
    width="100%" 
    height="500px"
    frameBorder="0"
/>
```

### Method 2: Separate Hosting
Host Unity builds on a CDN or separate server and reference them.

## Next Steps

1. **Build and copy your BerryBlitz files** following steps above
2. **Test the integration** in your React app
3. **Add the other games** (kitchen-quest, astrodrift) following the same process
4. **Customize the Unity C# scripts** to send assessment data back to React

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all file paths and naming conventions
3. Test with a simple Unity WebGL build first
4. Check Unity version compatibility with WebGL

The integration is now ready! Your Unity games will load seamlessly within your React ADHD assessment platform. 