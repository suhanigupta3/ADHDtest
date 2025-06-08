import React, { useCallback, useEffect, useState } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';

interface UnityGameProps {
  gameId: string;
  gameName: string;
  buildPath: string; // Path to Unity build files
  onGameComplete?: () => void;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  width?: string;
  height?: string;
}

const UnityGame: React.FC<UnityGameProps> = ({
  gameId,
  gameName,
  buildPath,
  onGameComplete,
  onProgress,
  onError,
  width = "100%",
  height = "600px"
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    unityProvider,
    isLoaded: unityIsLoaded,
    loadingProgression,
    requestFullscreen,
    sendMessage,
    addEventListener,
    removeEventListener,
  } = useUnityContext({
    loaderUrl: `${buildPath}/Build/BerryBlitzWebBuild.loader.js`,
    dataUrl: `${buildPath}/Build/BerryBlitzWebBuild.data.unityweb`,
    frameworkUrl: `${buildPath}/Build/BerryBlitzWebBuild.framework.js.unityweb`,
    codeUrl: `${buildPath}/Build/BerryBlitzWebBuild.wasm.unityweb`,
  });

  // Handle Unity loading events
  useEffect(() => {
    setLoadingProgress(Math.round(loadingProgression * 100));
    if (onProgress) {
      onProgress(Math.round(loadingProgression * 100));
    }
  }, [loadingProgression, onProgress]);

  useEffect(() => {
    if (unityIsLoaded) {
      setIsLoaded(true);
      console.log(`${gameName} Unity game loaded successfully`);
    }
  }, [unityIsLoaded, gameName]);

  // Unity message handlers
  const handleGameComplete = useCallback(() => {
    console.log(`${gameName} game completed!`);
    if (onGameComplete) {
      onGameComplete();
    }
  }, [gameName, onGameComplete]);

  const handleGameError = useCallback((...parameters: any[]) => {
    const error = parameters[0] as string || "Unknown game error";
    console.error(`${gameName} game error:`, error);
    setErrorMessage(error);
    if (onError) {
      onError(error);
    }
  }, [gameName, onError]);

  // Set up Unity event listeners
  useEffect(() => {
    addEventListener("GameComplete", handleGameComplete);
    addEventListener("GameError", handleGameError);
    
    return () => {
      removeEventListener("GameComplete", handleGameComplete);
      removeEventListener("GameError", handleGameError);
    };
  }, [addEventListener, removeEventListener, handleGameComplete, handleGameError]);

  // Function to send messages to Unity
  const sendMessageToUnity = useCallback((functionName: string, parameter?: string | number) => {
    if (isLoaded) {
      sendMessage("GameManager", functionName, parameter);
    }
  }, [isLoaded, sendMessage]);

  const handleFullscreen = () => {
    requestFullscreen(true);
  };

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.064 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Game Error</h3>
        <p className="text-red-600 text-center max-w-md">{errorMessage}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Reload Game
        </button>
      </div>
    );
  }

  return (
    <div className="unity-game-container">
      {/* Loading Screen */}
      {!isLoaded && (
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-gray-200" style={{ width, height }}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading {gameName}</h3>
            <div className="w-64 bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">{loadingProgress}% loaded</p>
          </div>
        </div>
      )}

      {/* Unity Game */}
      {isLoaded && (
        <div className="relative">
          <Unity 
            unityProvider={unityProvider} 
            style={{ 
              width,
              height,
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          
          {/* Game Controls */}
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              onClick={handleFullscreen}
              className="px-3 py-1 bg-black bg-opacity-50 text-white text-xs rounded hover:bg-opacity-70 transition-opacity"
              title="Fullscreen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnityGame; 