import React from 'react';
import { PatternMatchGameProps } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import GameUI from './GameUI';




const PatternMatchGame: React.FC<PatternMatchGameProps> = ({
  onGameComplete,
  onError,
  width = "960px",
  height = "540px",
  userId
}) => {
  const {
    gameState,
    elapsedTime,
    stimulusRotation,
    roundMetrics,
    startGame,
    startRound,
    handleScreenClick,
    handleStimulusClick,
    setShowRoundInstructions
  } = useGameLogic({ userId, onGameComplete, onError });



  return (
    <div 
      className={`${gameState.isFlickering ? 'animate-pulse' : ''}`}
      style={{ width, height }}
      onClick={handleScreenClick}
    >
      <GameUI
        gameState={gameState}
        elapsedTime={elapsedTime}
        stimulusRotation={stimulusRotation}
        roundMetrics={roundMetrics}
        onStartGame={startGame}
        onStartRound={startRound}
        onStimulusClick={handleStimulusClick}
        onScreenClick={handleScreenClick}

        width={width}
        height={height}
      />
    </div>
  );
};

export default PatternMatchGame; 