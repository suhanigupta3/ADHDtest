import React from 'react';
import FlutterFocusGame from './FlutterFocusGame';

const FlutterFocusDebugPage: React.FC = () => {
  const handleGameComplete = (gameData: any) => {
    console.log('Game completed with data:', gameData);
  };

  const handleGameError = (error: string) => {
    console.error('Game error:', error);
  };

  const handleGameCancel = () => {
    console.log('Game cancelled');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">FlutterFocus Game Debug Page</h1>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-400 mb-4">Debug Information</h2>
          <div className="text-gray-300 space-y-2">
            <p>• This page is for debugging the FlutterFocus game</p>
            <p>• Check the browser console for detailed debug logs</p>
            <p>• The game should spawn obstacles every 2 seconds</p>
            <p>• Click or press SPACEBAR to make the alien jump</p>
            <p>• Watch the debug overlay at the bottom-left for real-time info</p>
          </div>
        </div>
        
        <div className="mt-6">
          <FlutterFocusGame
            userId="debug-user"
            onGameComplete={handleGameComplete}
            onError={handleGameError}
            onCancel={handleGameCancel}
            width="100%"
            height="600px"
          />
        </div>
      </div>
    </div>
  );
};

export default FlutterFocusDebugPage;
