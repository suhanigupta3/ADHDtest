import React from 'react';

interface GameCompleteProps {
  score: number;
  onCancel: () => void;
}

const GameComplete: React.FC<GameCompleteProps> = ({
  score,
  onCancel
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white min-h-[600px] text-center">
      <h1 className="text-3xl font-bold mb-6 text-green-400">🎉 Assessment Complete! 🎉</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-6 text-center">
        <h2 className="text-xl font-semibold mb-4 text-green-400">Assessment Results</h2>
        <div className="text-4xl font-bold text-green-400 mb-2">{score}</div>
        <p className="text-gray-300">Final Performance Score</p>
        <p className="text-gray-300">All 3 assessment levels completed!</p>
        <p className="text-gray-300 mt-2">ADHD evaluation finished!</p>
      </div>
      
      <div className="text-center text-gray-400 text-sm mb-6">
        <p>Thank you for completing the ADHD assessment.</p>
        <p>Your results have been recorded and analyzed.</p>
        <p className="mt-2 text-blue-400">Assessment Complete - No Further Action Required</p>
        <p className="mt-1 text-xs">This concludes your evaluation session.</p>
      </div>
      
      <button
        onClick={onCancel}
        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
      >
        Close
      </button>
    </div>
  );
};

export default GameComplete;
