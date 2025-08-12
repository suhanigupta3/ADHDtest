import React from 'react';

interface LevelCompleteProps {
  level: number;
  score: number;
  onNextLevel: () => void;
  onCancel: () => void;
}

const LevelComplete: React.FC<LevelCompleteProps> = ({
  level,
  score,
  onNextLevel,
  onCancel
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white min-h-[600px] text-center">
      <h1 className="text-3xl font-bold mb-6 text-green-400">Level {level} Complete!</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-6 text-center">
        <h2 className="text-xl font-semibold mb-4 text-green-400">Level Results</h2>
        <div className="text-4xl font-bold text-green-400 mb-2">{score}</div>
        <p className="text-gray-300">Level Score</p>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={onNextLevel}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
        >
          Play Level {level + 1}
        </button>
        
        <button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
        >
          Cancel
        </button>
      </div>
      
      <div className="mt-6 text-center text-gray-400 text-sm">
        <p>Great job! You're making progress through the assessment.</p>
        {level < 3 && <p>Get ready for the next challenge!</p>}
      </div>
    </div>
  );
};

export default LevelComplete;
