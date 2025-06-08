// Unity Build Auto-Detection Utility
// This automatically detects Unity WebGL build files regardless of naming conventions

export interface UnityBuildConfig {
  loaderUrl: string;
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  buildPath: string;
  isValid: boolean;
}

export async function detectUnityBuild(gameId: string): Promise<UnityBuildConfig> {
  const buildPath = `/unity-builds/${gameId}`;
  
  try {
    // First, try to parse the Unity-generated index.html to get the exact file names
    const response = await fetch(`${buildPath}/index.html`);
    const htmlContent = await response.text();
    
    // Extract file URLs from the Unity config in index.html
    const config = parseUnityConfig(htmlContent, buildPath);
    
    if (config.isValid) {
      return config;
    }
    
    // Fallback: Try common Unity naming patterns
    return await detectBuildFiles(buildPath);
    
  } catch (error) {
    console.error(`Error detecting Unity build for ${gameId}:`, error);
    return {
      loaderUrl: '',
      dataUrl: '',
      frameworkUrl: '',
      codeUrl: '',
      buildPath,
      isValid: false
    };
  }
}

function parseUnityConfig(htmlContent: string, buildPath: string): UnityBuildConfig {
  try {
    // Extract the config object from the HTML
    const configMatch = htmlContent.match(/var config = \{[\s\S]*?\};/);
    if (!configMatch) throw new Error('Config not found');
    
    // Extract individual file URLs
    const dataUrlMatch = htmlContent.match(/dataUrl:\s*buildUrl\s*\+\s*["']([^"']+)["']/);
    const frameworkUrlMatch = htmlContent.match(/frameworkUrl:\s*buildUrl\s*\+\s*["']([^"']+)["']/);
    const codeUrlMatch = htmlContent.match(/codeUrl:\s*buildUrl\s*\+\s*["']([^"']+)["']/);
    const loaderUrlMatch = htmlContent.match(/var loaderUrl = buildUrl \+ ["']([^"']+)["']/);
    
    if (dataUrlMatch && frameworkUrlMatch && codeUrlMatch && loaderUrlMatch) {
      return {
        loaderUrl: `${buildPath}/Build${loaderUrlMatch[1]}`,
        dataUrl: `${buildPath}/Build${dataUrlMatch[1]}`,
        frameworkUrl: `${buildPath}/Build${frameworkUrlMatch[1]}`,
        codeUrl: `${buildPath}/Build${codeUrlMatch[1]}`,
        buildPath,
        isValid: true
      };
    }
    
    throw new Error('Could not parse all file URLs');
    
  } catch (error) {
    console.warn('Failed to parse Unity config from HTML:', error);
    return {
      loaderUrl: '',
      dataUrl: '',
      frameworkUrl: '',
      codeUrl: '',
      buildPath,
      isValid: false
    };
  }
}

async function detectBuildFiles(buildPath: string): Promise<UnityBuildConfig> {
  // Common Unity WebGL file patterns
  const patterns = [
    // Pattern 1: {GameName}WebBuild.*
    (name: string) => ({
      loader: `${name}WebBuild.loader.js`,
      data: `${name}WebBuild.data.unityweb`,
      framework: `${name}WebBuild.framework.js.unityweb`,
      wasm: `${name}WebBuild.wasm.unityweb`
    }),
    // Pattern 2: Standard Unity names
    () => ({
      loader: 'Build.loader.js',
      data: 'Build.data.unityweb',
      framework: 'Build.framework.js.unityweb',
      wasm: 'Build.wasm.unityweb'
    }),
    // Pattern 3: Without .unityweb extension
    (name: string) => ({
      loader: `${name}.loader.js`,
      data: `${name}.data`,
      framework: `${name}.framework.js`,
      wasm: `${name}.wasm`
    })
  ];
  
  const gameNames = ['BerryBlitz', 'KitchenQuest', 'Astrodrift', 'Berry', 'Build'];
  
  for (const pattern of patterns) {
    for (const gameName of gameNames) {
      const files = pattern(gameName);
      
      try {
        // Check if all required files exist
        const checks = await Promise.all([
          checkFileExists(`${buildPath}/Build/${files.loader}`),
          checkFileExists(`${buildPath}/Build/${files.data}`),
          checkFileExists(`${buildPath}/Build/${files.framework}`),
          checkFileExists(`${buildPath}/Build/${files.wasm}`)
        ]);
        
        if (checks.every(exists => exists)) {
          return {
            loaderUrl: `${buildPath}/Build/${files.loader}`,
            dataUrl: `${buildPath}/Build/${files.data}`,
            frameworkUrl: `${buildPath}/Build/${files.framework}`,
            codeUrl: `${buildPath}/Build/${files.wasm}`,
            buildPath,
            isValid: true
          };
        }
      } catch (error) {
        // Continue to next pattern
        continue;
      }
    }
  }
  
  return {
    loaderUrl: '',
    dataUrl: '',
    frameworkUrl: '',
    codeUrl: '',
    buildPath,
    isValid: false
  };
}

async function checkFileExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Utility to get Unity config from any game
export async function getUnityConfig(gameId: string): Promise<UnityBuildConfig> {
  const config = await detectUnityBuild(gameId);
  
  if (!config.isValid) {
    console.error(`Unity build not detected for ${gameId}. Please check build files.`);
  }
  
  return config;
} 