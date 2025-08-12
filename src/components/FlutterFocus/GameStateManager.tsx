import React, { RefObject } from 'react';
import GameInstructions from './GameInstructions';
import Countdown from './Countdown';
import LevelComplete from './LevelComplete';
import GameComplete from './GameComplete';
import GameOver from './GameOver';
import SelfReportQuestions from './SelfReportQuestions';
import GameCanvas from './GameCanvas';
import { Question } from './types';

interface GameStateManagerProps {
  gameState: 'instructions' | 'countdown' | 'playing' | 'gameOver' | 'levelComplete' | 'gameComplete' | 'selfReport';
  showQuestions: boolean;
  currentQuestionIndex: number;
  questionResponses: { [key: string]: number };
  level: number;
  score: number;
  lives: number;
  questions: Question[];
  width: string;
  height: string;
  canvasRef: RefObject<HTMLCanvasElement>;
  onStartGame: () => void;
  onCancel: () => void;
  onNextLevel: () => void;
  onPlayAgain: () => void;
  onJump: () => void;
  onQuestionResponse: (response: number) => void;
  onQuestionsComplete: () => void;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  userId?: string;
}

const GameStateManager: React.FC<GameStateManagerProps> = ({
  gameState,
  showQuestions,
  currentQuestionIndex,
  questionResponses,
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
  onQuestionResponse,
  onQuestionsComplete,
  onPreviousQuestion,
  onNextQuestion,
  userId
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

  // Render countdown
  if (gameState === 'countdown') {
    return (
      <Countdown
        onCancel={onCancel}
      />
    );
  }

  // Render level complete
  if (gameState === 'levelComplete') {
    return (
      <LevelComplete
        level={level}
        score={score}
        onNextLevel={onNextLevel}
        onCancel={onCancel}
      />
    );
  }

  // Render self-reporting questions
  if (gameState === 'selfReport' && showQuestions) {
    return (
      <SelfReportQuestions
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        questionResponses={questionResponses}
        onQuestionResponse={onQuestionResponse}
        onQuestionsComplete={onQuestionsComplete}
        onPreviousQuestion={onPreviousQuestion}
        onNextQuestion={onNextQuestion}
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
