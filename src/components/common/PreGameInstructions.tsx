import React from 'react';
import { motion } from 'framer-motion';

interface PreGameInstructionsProps {
  gameTitle: string;
  gameIcon?: React.ReactNode;
  description: string;
  instructions: string[];
  onStart: () => void;
  onCancel: () => void;
  width?: string;
  height?: string;
}

const PreGameInstructions: React.FC<PreGameInstructionsProps> = ({
  gameTitle,
  gameIcon,
  description,
  instructions,
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

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto">
          <p className="text-sage-200 mb-6 text-adhd-friendly-large">{description}</p>
          
          <div className="mb-6">
            <ol className="text-sage-200 space-y-3">
              {instructions.map((instruction, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start text-adhd-friendly"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-sleek-500 mr-3 mt-1 font-semibold flex-shrink-0">{index + 1}.</span>
                  {instruction}
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-6 border-t border-sage-700 bg-sage-900/50">
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
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PreGameInstructions;
