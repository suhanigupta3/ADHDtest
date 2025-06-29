import React from 'react';
import { PatternMatchGameProps } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import GameUI from './GameUI';

const PatternMatchGame: React.FC<PatternMatchGameProps> = ({
  onGameComplete,
  onError,
  width = "960px",
  height = "540px",
  isStandalone = false,
  userId
}) => {
  const {
    gameState,
    elapsedTime,
    stimulusRotation,
    startGame,
    startRound,
    handleScreenClick,
    handleStimulusClick,
    setShowRoundInstructions
  } = useGameLogic({ userId, onGameComplete, onError });

  return (
    <div 
      className={`rounded-lg border border-gray-200 shadow-lg bg-white flex flex-col justify-between game-area ${gameState.isFlickering ? 'animate-pulse' : ''}`}
      style={{ width, height }}
      onClick={handleScreenClick}
    >
      <GameUI
        gameState={gameState}
        elapsedTime={elapsedTime}
        stimulusRotation={stimulusRotation}
        onStartGame={startGame}
        onStartRound={startRound}
        onStimulusClick={handleStimulusClick}
        onScreenClick={handleScreenClick}
      />
    </div>
  );
};

export default PatternMatchGame; 