import React, { useRef, useEffect } from 'react';
import { FlutterFocusGameProps } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import { QUESTIONS } from './constants';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  BEAT_CIRCLE_RADIUS,
  BEAT_CIRCLE_SPACING,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  ACCENT_COLOR,
  SUCCESS_COLOR,
  BG_COLOR
} from './constants';

const FlutterFocusGame: React.FC<FlutterFocusGameProps> = ({ onGameComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    // Game state
    gameState,
    gameData,
    
    // Question modal state
    showQuestions,
    currentQuestionIndex,
    questionsCompleted,
    
    // Actions
    handleClick,
    handleQuestionResponse,
    handleQuestionsComplete,
    resetGame,
  } = useGameLogic();

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState.isPlaying) {
        e.preventDefault();
        handleClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, handleClick]);

  // Render game on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw title
    ctx.fillStyle = PRIMARY_COLOR;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Flutter Focus', CANVAS_WIDTH / 2, 30);

    // Draw current pattern info
    ctx.fillStyle = SECONDARY_COLOR;
    ctx.font = '16px Arial';
    ctx.fillText(gameState.currentPattern.name, CANVAS_WIDTH / 2, 55);
    ctx.font = '14px Arial';
    ctx.fillText(`Tempo: ${gameState.currentPattern.tempo} BPM`, CANVAS_WIDTH / 2, 75);

    // Draw beat circles
    const patternLength = gameState.currentPattern.pattern.length;
    const totalWidth = patternLength * BEAT_CIRCLE_SPACING;
    const startX = (CANVAS_WIDTH - totalWidth) / 2;
    
    for (let i = 0; i < patternLength; i++) {
      const x = startX + i * BEAT_CIRCLE_SPACING;
      const y = CANVAS_HEIGHT / 2;
      
      // Determine circle color based on current beat
      let color = PRIMARY_COLOR;
      if (i === gameState.currentBeat && gameState.isPlaying) {
        color = ACCENT_COLOR;
      } else if (i < gameState.currentBeat) {
        color = SUCCESS_COLOR;
      }
      
      // Draw circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, BEAT_CIRCLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw beat number
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((i + 1).toString(), x, y + 6);
    }

    // Draw score and lives
    ctx.fillStyle = PRIMARY_COLOR;
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 20, CANVAS_HEIGHT - 60);
    ctx.fillText(`Lives: ${gameState.lives}`, 20, CANVAS_HEIGHT - 40);
    
    // Draw accuracy
    ctx.fillText(`Accuracy: ${gameData.accuracy.toFixed(1)}%`, 20, CANVAS_HEIGHT - 20);

    // Draw instructions
    if (!gameState.isPlaying && !gameState.gameOver) {
      ctx.fillStyle = SECONDARY_COLOR;
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Press SPACE to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);
      ctx.fillText('Click SPACE on the beat!', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
    }

    // Draw game over message
    if (gameState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
      ctx.fillText(`Final Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    }
  }, [gameState, gameData.accuracy]);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Questions Modal */}
      {showQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-blue-700 mb-2">
                Flutter Focus Assessment Questions
              </h3>
              <p className="text-gray-600 text-sm">
                Question {currentQuestionIndex + 1} of {QUESTIONS.length}
              </p>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-800 font-medium mb-4">
                {currentQuestion.text}
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="1"
                    onChange={() => handleQuestionResponse(1)}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">1 - Not at all</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="2"
                    onChange={() => handleQuestionResponse(2)}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">2 - Slightly</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="3"
                    onChange={() => handleQuestionResponse(3)}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">3 - Moderately</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="4"
                    onChange={() => handleQuestionResponse(4)}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">4 - Very</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="5"
                    onChange={() => handleQuestionResponse(5)}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">5 - Extremely</span>
                </label>
              </div>
            </div>
            
            {questionsCompleted && (
              <div className="text-center">
                <p className="text-blue-600 font-medium mb-4">
                  Thank you for your responses!
                </p>
                <button
                  onClick={handleQuestionsComplete}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Complete Assessment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-4 text-center">
        <div className="text-blue-700 font-semibold mb-2">
          Score: {gameState.score} | Lives: {gameState.lives} | Accuracy: {gameData.accuracy.toFixed(1)}%
        </div>
        <div className="text-blue-600 text-sm mb-2">
          {gameState.currentPattern.description}
        </div>
        {!gameState.isPlaying && !gameState.gameOver && !showQuestions && (
          <div className="text-blue-600 text-sm">
            Press SPACE to start the rhythm game
          </div>
        )}
        {gameState.gameOver && !showQuestions && (
          <div className="text-red-600 font-bold mb-2">
            Game Over! Final Score: {gameState.score}
          </div>
        )}
        {(gameState.gameOver || (gameState.gameWon && !showQuestions)) && (
          <button
            onClick={resetGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Play Again
          </button>
        )}
      </div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          width: '100%',
          maxWidth: CANVAS_WIDTH,
          height: 'auto',
          borderRadius: 12,
          boxShadow: '0 2px 16px #dbeafe',
          background: BG_COLOR,
          display: 'block',
          margin: '0 auto',
          cursor: gameState.isPlaying ? 'pointer' : 'default',
        }}
        onClick={gameState.isPlaying ? handleClick : undefined}
        tabIndex={0}
      />
      
      <div className="mt-6 text-blue-700 font-semibold text-center max-w-2xl mx-auto">
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-3 text-blue-800">How to Play:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">SPACEBAR</span>
              <span>Press SPACE to start the rhythm game</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">CLICK</span>
              <span>Click SPACE or click the circles on the beat</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">RHYTHM</span>
              <span>Follow the rhythm pattern to score points</span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-3 text-blue-800">Game Features:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">TIMING</span>
              <span>Precise timing is crucial for high scores</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">ACCURACY</span>
              <span>Your accuracy affects your final score</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">FOCUS</span>
              <span>Maintain focus throughout the rhythm pattern</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-blue-600">
          <p>• The game tests your rhythm and timing abilities</p>
          <p>• Questions help assess your focus and coordination</p>
          <p>• Complete the assessment to unlock the next game</p>
        </div>
      </div>
    </div>
  );
};

export default FlutterFocusGame; 