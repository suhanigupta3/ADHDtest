import React, { useEffect, useRef, useState } from 'react';

interface UnityGameIframeProps {
  gameId: string;
  gameName: string;
  buildPath: string;
  userId?: string;
  onGameComplete?: () => void;
  onError?: (error: string) => void;
  width?: string;
  height?: string;
}

const UnityGameIframe: React.FC<UnityGameIframeProps> = ({
  gameId,
  gameName,
  userId,
  onGameComplete,
  onError,
  width = "960px",
  height = "580px"
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Listen for messages from the Unity iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'unity-message') {
        const message = event.data.data;
        
        if (message === 'GameComplete') {
          console.log(`${gameName} completed via iframe!`);
          if (onGameComplete) {
            onGameComplete();
          }
        } else if (message.startsWith('GameError:')) {
          const errorMsg = message.replace('GameError:', '');
          console.error(`${gameName} error:`, errorMsg);
          setHasError(true);
          if (onError) {
            onError(errorMsg);
          }
        }
      } else if (event.data.type === 'close-game') {
        // Handle close game message
        console.log('Close game message received');
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [gameName, onGameComplete, onError]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log(`${gameName} iframe loaded`);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    if (onError) {
      onError('Failed to load game iframe');
    }
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.064 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Game Load Error</h3>
        <p className="text-red-600 text-center max-w-md">
          Unable to load {gameName}. Please check that the game files are properly uploaded.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="unity-game-iframe-container relative flex justify-center">
      {/* Loading Screen */}
      {isLoading && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-gray-200 z-10"
          style={{ width, height }}
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading {gameName}</h3>
            <p className="text-sm text-gray-600">Initializing game...</p>
          </div>
        </div>
      )}

      {/* Unity Game Iframe */}
      <iframe
        ref={iframeRef}
        src={`/unity-builds/${gameId}/index.html?userId=${encodeURIComponent(userId || 'anonymous')}&gameId=${gameId}`}
        width={width}
        height={height}
        frameBorder="0"
        allowFullScreen
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        className="rounded-lg shadow-lg"
        title={`${gameName} Game`}
        sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-orientation-lock"
      />
    </div>
  );
};

export default UnityGameIframe; 