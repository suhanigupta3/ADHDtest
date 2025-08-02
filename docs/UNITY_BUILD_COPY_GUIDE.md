# Unity Build Copy Guide

## 🚀 **Quick Copy Instructions**

After building your Unity project for WebGL, follow these simple steps:

### 1. **Build in Unity**
- Set platform to **WebGL**
- Click **Build** 
- Choose output folder (e.g., `unity-export/berry-blitz`)

### 2. **Copy Everything to React Project**
Copy the **entire build folder contents** to your React project:

```bash
# Copy all files from Unity build to React
cp -r unity-export/berry-blitz/* public/unity-builds/berry-blitz/
```

**Or manually:**
- Copy the `Build/` folder
- Copy `index.html`
- Copy `TemplateData/` folder (if exists)
- Copy `StreamingAssets/` folder (if exists)
- Keep your existing `Player.png` and `BerryBlitz.png` icons

### 3. **That's It!** 
The system now **automatically detects** your Unity build files regardless of naming:
- ✅ Works with `BerryBlitzWebBuild.*` files
- ✅ Works with `Build.*` files  
- ✅ Works with any Unity naming convention
- ✅ Automatically parses `index.html` for file paths

## 🔧 **Auto-Detection Features**

The system automatically:
1. **Reads your Unity `index.html`** to get exact file names
2. **Detects common Unity naming patterns**:
   - `{GameName}WebBuild.loader.js`
   - `Build.loader.js`
   - Custom naming conventions
3. **Handles different Unity versions** and export settings
4. **Shows helpful error messages** if files are missing

## 📁 **Expected File Structure**

After copying, your folder should look like:
```
public/unity-builds/berry-blitz/
├── Build/
│   ├── [GameName].loader.js
│   ├── [GameName].data.unityweb
│   ├── [GameName].framework.js.unityweb
│   └── [GameName].wasm.unityweb
├── index.html
├── TemplateData/ (optional)
├── StreamingAssets/ (optional)
├── Player.png (your icon)
└── BerryBlitz.png (your logo)
```

## ⚠️ **Troubleshooting**

### "Unity build files not found"
- **Check**: All 4 required files are in the `Build/` folder
- **Check**: File extensions match (`.unityweb` vs without)
- **Check**: File names are correct (case sensitive)

### "Game not loading"
- **Check**: The `index.html` file was copied
- **Check**: No extra folders in the path
- **Check**: Browser console for specific errors

### "Missing user ID"
Your new Unity build already includes user ID handling! The system will automatically:
- Pass the logged-in user's ID to Unity
- Enable Firebase integration when you add the C# scripts

## 🎯 **Benefits**

- ✅ **Copy any Unity build** - no manual configuration needed
- ✅ **Future-proof** - works with Unity updates and different naming
- ✅ **Automatic detection** - no code changes required
- ✅ **Error-friendly** - clear messages if something goes wrong
- ✅ **Fast deployment** - just copy and refresh!

## 🔄 **Updating Builds**

When you have a new Unity build:
1. Simply **copy the new files** over the old ones
2. **Refresh the browser**
3. **No code changes needed!**

The auto-detection system will handle any naming changes automatically. 