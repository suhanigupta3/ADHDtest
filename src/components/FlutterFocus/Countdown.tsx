import React, { useEffect, useState } from 'react';

interface CountdownProps {
  onCancel: () => void;
}

const Countdown: React.FC<CountdownProps> = ({
  onCancel
}) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    // Countdown completion is handled internally by startGame function
  }, [countdown]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white min-h-[600px] text-center">
      <div className="bg-gray-800 p-12 rounded-lg mb-8">
        <h1 className="text-6xl font-bold text-green-400 mb-4">
          {countdown > 0 ? countdown : 'GO!'}
        </h1>
        <p className="text-xl text-gray-300">
          {countdown > 0 ? 'Get ready...' : 'Level starting!'}
        </p>
      </div>
      
      <button
        onClick={onCancel}
        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
      >
        Cancel
      </button>
    </div>
  );
};

export default Countdown;
