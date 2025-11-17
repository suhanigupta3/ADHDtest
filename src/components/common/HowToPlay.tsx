import React from 'react';
import { motion } from 'framer-motion';

interface HowToPlayProps {
  gameTitle: string;
  gameIcon?: React.ReactNode;
  description?: string;
  controls: string[];
  gameplayRules: string[];
  onStart: () => void;
  onCancel: () => void;
  width?: string;
  height?: string;
}

const HowToPlay: React.FC<HowToPlayProps> = ({
  gameTitle,
  gameIcon,
  description,
  controls,
  gameplayRules,
  onStart,
  onCancel,
  width = "max-w-4xl",
  height = "max-h-[90vh]"
}) => {
  return (
    <motion.div
      className="card-dark overflow-hidden flex flex-col"
      style={{ width, height }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-sage-700 flex items-center justify-between bg-sage-800/50">
        <div className="flex items-center space-x-4">
          {gameIcon && (
            <motion.div
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {gameIcon}
            </motion.div>
          )}
          <h2 className="text-2xl font-bold text-forest-200">{gameTitle} - How to Play</h2>
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

      {/* How to Play Content */}
      <div className="flex-1 p-6 overflow-y-auto min-h-0">
        <div className="w-full max-w-3xl mx-auto">
          {/* Description at the top (for Signal Snap) */}
          {description && (
            <motion.p 
              className="text-sage-200 mb-6 text-adhd-friendly-large text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {description}
            </motion.p>
          )}
          
          {/* Controls Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-sleek-400 mb-3">Controls:</h4>
            <ul className="text-sage-200 space-y-2">
              {controls.map((control, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start text-adhd-friendly"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-sleek-500 mr-3 mt-1 font-semibold flex-shrink-0">•</span>
                  {control}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Gameplay Rules Section */}
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-sleek-400 mb-3">Gameplay Rules:</h4>
            <ul className="text-sage-200 space-y-2">
              {gameplayRules.map((rule, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start text-adhd-friendly"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + controls.length) * 0.1 }}
                >
                  <span className="text-sleek-500 mr-3 mt-1 font-semibold flex-shrink-0">•</span>
                  {rule}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* How to Play Footer */}
      <div className="p-6 border-t border-sage-700 bg-sage-900/50">
        <div className="flex justify-between items-center">
          <button
            onClick={onCancel}
            className="btn-secondary-dark px-6 py-2"
          >
            Cancel
          </button>
          <button
            onClick={onStart}
            className="btn-primary-dark px-8 py-3 text-lg"
          >
            Start Game
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default HowToPlay;
