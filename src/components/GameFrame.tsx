import React from 'react';

interface GameFrameProps {
  gameTitle: string;
  gameIcon?: React.ReactNode;
  onClose: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
  showFooter?: boolean;
  footerText?: string;
  width?: string;
  height?: string;
}

const GameFrame: React.FC<GameFrameProps> = ({
  gameTitle,
  gameIcon,
  onClose,
  onCancel,
  children,
  showFooter = true,
  footerText = "Complete the game to continue",
  width = "992px",
  height = "720px"
}) => {
  return (
    <div 
      className="card-dark overflow-hidden"
      style={{ width, height }}
    >
      {/* Header */}
      <div className="p-4 border-b border-sage-700 flex items-center justify-between bg-sage-800">
        <div className="flex items-center space-x-4">
          {gameIcon && (
            <div className="text-2xl">
              {gameIcon}
            </div>
          )}
          <h2 className="text-2xl font-bold text-forest-200">{gameTitle}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-sage-400 hover:text-white transition-colors focus-helper"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Game Content Area */}
      <div className="flex-1 p-2 flex items-center justify-center bg-sage-900">
        {children}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="p-6 border-t border-sage-700 bg-sage-900/50">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-sage-400 text-sm">
              {footerText}
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="btn-secondary-dark px-6 py-2"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameFrame;
