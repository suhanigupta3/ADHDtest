import React from 'react';

interface GameOverProps {
  score: number;
  onPlayAgain: () => void;
  onCancel: () => void;
}

const GameOver: React.FC<GameOverProps> = ({
  score,
  onPlayAgain,
  onCancel
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white min-h-[600px]">
      <h1 className="text-3xl font-bold mb-6 text-red-400">Game Over!</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-green-400">Final Score</h2>
        <div className="text-4xl font-bold text-green-400 mb-2">{score}</div>
        <p className="text-gray-300">Assessment incomplete</p>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={onPlayAgain}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
        >
          Play Again
        </button>
        
        <button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
        >
          Cancel
        </button>
      </div>
      
      <div className="mt-6 text-center text-gray-400 text-sm">
        <p>Don't worry! You can restart the assessment to complete all levels.</p>
        <p>Your progress will be reset for a fresh start.</p>
      </div>
    </div>
  );
};

export default GameOver;
