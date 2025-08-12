import React from 'react';
import UnityGameIframe from './UnityGameIframe';
import PatternMatchGame from './PatternMatchGame';
import { BounceBackGame } from './BounceBack';
import { FlutterFocusGame } from './FlutterFocus';

interface GameWrapperProps {
  gameId: string;
  gameName: string;
  buildPath: string;
  userId?: string;
  onGameComplete?: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
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
  onCancel,
  width = "960px",
  height = "540px"
}) => {
  // Check if this is a React-based game
  const isReactGame = gameId === 'pattern-match';
  const isBounceBack = gameId === 'bounce-back';
  const isFlutterFocus = gameId === 'flutter-focus';

  if (isFlutterFocus) {
    return (
      <FlutterFocusGame 
        userId={userId}
        onGameComplete={(gameData) => {
          console.log('Flutter Focus Game completed with data:', gameData);
          if (onGameComplete) {
            onGameComplete();
          }
        }}
        width={width}
        height={height}
      />
    );
  }

  if (isBounceBack) {
    return (
      <BounceBackGame 
        userId={userId}
        onGameComplete={(gameData) => {
          console.log('Bounce Back Game completed with data:', gameData);
          if (onGameComplete) {
            onGameComplete();
          }
        }}
        onCancel={onCancel}
        onError={onError}
        width={width}
        height={height}
      />
    );
  }

  if (isReactGame) {
    return (
      <PatternMatchGame
        onGameComplete={(roundMetrics) => {
          console.log(`Signal Snap completed with ${roundMetrics.length} rounds`);
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