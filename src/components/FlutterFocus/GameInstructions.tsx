import React from 'react';

interface GameInstructionsProps {
  onStartGame: () => void;
  onCancel: () => void;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({
  onStartGame,
  onCancel
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white min-h-[600px] text-center">
      <h1 className="text-4xl font-bold mb-8 text-green-400">Flutter Focus</h1>
      
      <div className="bg-gray-800 p-8 rounded-lg mb-8 max-w-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-green-400">Game Instructions</h2>
        
        <div className="text-left space-y-4 text-gray-300">
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">Objective:</h3>
            <p>Navigate your spaceship through space debris and obstacles. Avoid collisions to complete all 3 levels.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">Levels:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Level 1:</strong> Basic navigation through calm space</li>
              <li><strong>Level 2:</strong> Asteroid belt with decoy obstacles</li>
              <li><strong>Level 3:</strong> Complex maze with memory challenges</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={onStartGame}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default GameInstructions;
