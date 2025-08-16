import React, { RefObject } from 'react';
import GameInstructions from './GameInstructions';
import LevelTransition from './LevelTransition';
import GameComplete from './GameComplete';
import GameOver from './GameOver';
import GameCanvas from './GameCanvas';

interface GameStateManagerProps {
  gameState: 'instructions' | 'playing' | 'gameOver' | 'levelComplete' | 'gameComplete';
  level: number;
  score: number;
  lives: number;
  questions: any[];
  width: string;
  height: string;
  canvasRef: RefObject<HTMLCanvasElement>;
  onStartGame: () => void;
  onCancel: () => void;
  onNextLevel: () => void;
  onPlayAgain: () => void;
  onJump: () => void;
  userId?: string;
  debugData?: {
    level: number;
    debrisHit: number;
    debrisAvoided: number;
    reactionTime: number;
    reactionCount: number;
    spawnTimesCount: number;
  };
  // Add transition data for LevelTransition
  transitionData?: {
    type: 'level-complete' | 'game-over';
    level?: number;
    score: number;
    time: number;
    debrisAvoided: number;
    totalDebris: number;
    livesLost: number;
  } | null;
}

const GameStateManager: React.FC<GameStateManagerProps> = ({
  gameState,
  level,
  score,
  lives,
  questions,
  width,
  height,
  canvasRef,
  onStartGame,
  onCancel,
  onNextLevel,
  onPlayAgain,
  onJump,
  userId,
  debugData,
  transitionData
}) => {
  // Render instructions
  if (gameState === 'instructions') {
    return (
      <GameInstructions
        onStartGame={onStartGame}
        onCancel={onCancel}
      />
    );
  }

  // Render level transition (replaces level complete)
  if (gameState === 'levelComplete' && transitionData) {
    return (
      <LevelTransition
        type={transitionData.type}
        level={transitionData.level}
        score={transitionData.score}
        time={transitionData.time}
        debrisAvoided={transitionData.debrisAvoided}
        totalDebris={transitionData.totalDebris}
        livesLost={transitionData.livesLost}
        onContinue={onNextLevel}
      />
    );
  }

  // Render game complete
  if (gameState === 'gameComplete') {
    return (
      <GameComplete
        score={score}
        onCancel={onCancel}
      />
    );
  }

  // Render game over
  if (gameState === 'gameOver') {
    return (
      <GameOver
        score={score}
        onPlayAgain={onPlayAgain}
        onCancel={onCancel}
      />
    );
  }

  // Render game canvas (playing state)
  if (gameState === 'playing') {
    return (
      <GameCanvas
        width={width}
        height={height}
        score={score}
        lives={lives}
        onJump={onJump}
        canvasRef={canvasRef}
        debugData={debugData}
      />
    );
  }

  // Fallback - should not reach here
  return (
    <div className="flex items-center justify-center p-8 bg-gray-900 text-white min-h-[600px]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
        <p className="text-gray-300">Unknown game state: {gameState}</p>
        <button
          onClick={onCancel}
          className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GameStateManager;
