import React from 'react';
import { motion } from 'framer-motion';

interface LevelTransitionProps {
  type: 'level-complete' | 'game-over';
  level?: number;
  score: number;
  time: number;
  debrisAvoided: number;
  totalDebris: number;
  livesLost: number;
  onContinue: () => void;
}

const LevelTransition: React.FC<LevelTransitionProps> = ({
  type,
  level,
  score,
  time,
  debrisAvoided,
  totalDebris,
  livesLost,
  onContinue
}) => {
  const formatTime = (milliseconds: number) => {
    return (milliseconds / 1000).toFixed(1);
  };

  const getTitle = () => {
    if (type === 'level-complete') {
      return `Level ${level} Completed!`;
    } else {
      return 'Game Ended';
    }
  };

  const getButtonText = () => {
    if (type === 'level-complete') {
      if (level === 3) {
        return 'Complete Questionnaire';
      } else {
        return `Start Level ${(level || 0) + 1}`;
      }
    } else {
      return 'Complete Questionnaire';
    }
  };

  const getSubtitle = () => {
    if (type === 'level-complete') {
      return 'Great job! Ready for the next challenge?';
    } else {
      return 'Don\'t worry, let\'s continue with the assessment.';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            {type === 'level-complete' ? '🎉' : '🏁'}
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {getTitle()}
          </h2>
          <p className="text-gray-600">
            {getSubtitle()}
          </p>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 rounded-lg p-4 mb-6"
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{score}</div>
              <div className="text-gray-500">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatTime(time)}s</div>
              <div className="text-gray-500">Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{debrisAvoided}/{totalDebris}</div>
              <div className="text-gray-500">Debris Avoided</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{livesLost}</div>
              <div className="text-gray-500">Lives Lost</div>
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onContinue}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          {getButtonText()}
        </motion.button>
        
        {/* Additional info for level 3 */}
        {type === 'level-complete' && level === 3 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-500 text-center mt-3"
          >
            You've completed all levels! Click to continue with the assessment.
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LevelTransition;
