import React from 'react';
import UnityGameIframe from './UnityGameIframe';
import PatternMatchGame from './PatternMatchGame';

interface GameWrapperProps {
  gameId: string;
  gameName: string;
  buildPath: string;
  userId?: string;
  onGameComplete?: () => void;
  onError?: (error: string) => void;
  width?: string;
  height?: string;
}

const GameWrapper: React.FC<GameWrapperProps> = ({
  gameId,
  gameName,
  buildPath,
  userId,
  onGameComplete,
  onError,
  width = "960px",
  height = "540px"
}) => {
  // Check if this is a React-based game
  const isReactGame = gameId === 'pattern-match';

  if (isReactGame) {
    return (
      <PatternMatchGame
        onGameComplete={(roundMetrics) => {
          console.log(`Pattern Match completed with ${roundMetrics.length} rounds`);
          console.log('Round metrics:', roundMetrics);
          if (onGameComplete) {
            onGameComplete();
          }
        }}
        onError={onError}
        width={width}
        height={height}
        isStandalone={false}
        userId={userId}
      />
    );
  }

  // Default to Unity game
  return (
    <UnityGameIframe
      gameId={gameId}
      gameName={gameName}
      buildPath={buildPath}
      userId={userId}
      onGameComplete={onGameComplete}
      onError={onError}
      width={width}
      height={height}
    />
  );
};

export default GameWrapper; 