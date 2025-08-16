import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreGameCountdownProps {
  gameTitle: string;
  gameIcon?: React.ReactNode;
  onComplete: () => void;
  onCancel: () => void;
  countdownSeconds?: number;
  width?: string;
  height?: string;
}

const PreGameCountdown: React.FC<PreGameCountdownProps> = ({
  gameTitle,
  gameIcon,
  onComplete,
  onCancel,
  countdownSeconds = 3,
  width = "max-w-2xl",
  height = "max-h-[60vh]"
}) => {
  const [count, setCount] = useState(countdownSeconds);
  const [isCounting, setIsCounting] = useState(false);

  useEffect(() => {
    if (isCounting) {
      const timer = setInterval(() => {
        setCount((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimeout(() => onComplete(), 500); // Small delay for the "Go!" animation
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isCounting, onComplete]);

  const startCountdown = () => {
    setIsCounting(true);
  };

  return (
    <motion.div
      className={`card-dark ${width} ${height} overflow-hidden`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Countdown Header */}
      <div className="p-6 border-b border-sage-700 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {gameIcon && (
            <div className="text-2xl">
              {gameIcon}
            </div>
          )}
          <h2 className="text-2xl font-bold text-forest-200">{gameTitle}</h2>
        </div>
        <button
          onClick={onCancel}
          className="text-sage-400 hover:text-white transition-colors focus-helper"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Countdown Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {!isCounting ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-2xl font-bold text-sage-100 mb-6">Ready to start?</h3>
            <p className="text-sage-200 mb-8 text-lg">
              The game will begin in {countdownSeconds} seconds after you click start.
            </p>
            <button
              onClick={startCountdown}
              className="btn-primary-dark px-8 py-4 text-xl"
            >
              Start Countdown
            </button>
          </motion.div>
        ) : (
          <div className="text-center">
            <AnimatePresence mode="wait">
              {count > 0 ? (
                <motion.div
                  key={count}
                  className="text-9xl font-bold text-sleek-600"
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.5, y: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {count}
                </motion.div>
              ) : (
                <motion.div
                  key="go"
                  className="text-8xl font-bold text-emerald-500"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Go!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Countdown Footer */}
      <div className="p-6 border-t border-sage-700 bg-sage-900/50">
        <div className="flex justify-center">
          {!isCounting && (
            <button
              onClick={onCancel}
              className="btn-secondary-dark px-6 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PreGameCountdown;
