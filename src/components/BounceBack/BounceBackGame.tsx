import React, { useRef, useEffect, useCallback, useState } from 'react';
import { BounceBackGameProps } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import { QUESTIONS } from './constants';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PADDLE_WIDTH, 
  PADDLE_HEIGHT, 
  PADDLE_Y_OFFSET, 
  BALL_RADIUS,
  BRICK_WIDTH,
  BRICK_HEIGHT,
  PADDLE_COLOR,
  BG_COLOR,
  BALL_COLOR
} from './constants';

// Particle Background Component
const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.floor(window.innerWidth / 20);
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: `rgba(78, 202, 120, ${Math.random() * 0.5 + 0.1})`,
        });
      }
    };
    createParticles();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          const force = (100 - distance) / 1500;
          particle.speedX -= Math.cos(angle) * force;
          particle.speedY -= Math.sin(angle) * force;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
};

// Countdown Component
const Countdown: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [count, setCount] = useState(3);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (count === 0) {
      onCompleteRef.current();
      return;
    }
    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [count]);

  if (count === 0) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div className="text-9xl font-bold text-[#4eca78]">
        {count}
      </div>
    </div>
  );
};

// Start Screen Component
const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [showCountdown, setShowCountdown] = useState(false);

  const handleStartClick = () => {
    setShowCountdown(true);
  };

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    onStart();
  }, [onStart]);

  return (
    <div className="absolute inset-0 bg-[#2a2e29]/80 backdrop-blur-sm flex flex-col items-center justify-center z-40">
      <ParticleBackground />
      {showCountdown ? (
        <Countdown onComplete={handleCountdownComplete} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl font-bold text-[#4eca78] mb-8">
            Bounce Back
          </h1>
          <button
            onClick={handleStartClick}
            className="bg-[#4eca78] text-[#2a2e29] px-8 py-4 rounded-lg text-xl font-bold shadow-lg hover:bg-[#3da965] transition-colors animate-pulse mb-8"
            style={{
              animation: 'pulse 2s infinite',
            }}
          >
            START GAME
          </button>
          <p className="text-[#4eca78]/80 mb-8 max-w-md text-center">
            Break all the bricks to complete each level. Answer questions after completing all 3 levels.
          </p>
          
          {/* How to Play and Game Structure */}
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
            {/* How to Play */}
            <div className="text-center md:text-left md:w-1/2">
              <h2 className="text-[#4eca78] text-xl mb-4">How to Play:</h2>
              <div className="flex flex-col md:items-start items-center space-y-2">
                <div className="flex items-center">
                  <div className="bg-[#e8f0e9] text-[#2a2e29] px-3 py-1 rounded mr-3 font-medium text-sm">
                    SPACEBAR
                  </div>
                  <span className="text-[#4eca78]">
                    Press to launch the ball
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="bg-[#e8f0e9] text-[#2a2e29] px-3 py-1 rounded mr-3 font-medium text-sm flex items-center">
                    <span>←</span>
                    <span className="mx-1">→</span>
                  </div>
                  <span className="text-[#4eca78]">Move the paddle</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-[#e8f0e9] text-[#2a2e29] px-3 py-1 rounded mr-3 font-medium text-sm">
                    BREAK BRICKS
                  </div>
                  <span className="text-[#4eca78]">Advance levels</span>
                </div>
              </div>
            </div>
            {/* Game Structure */}
            <div className="text-center md:text-left md:w-1/2">
              <h2 className="text-[#4eca78] text-xl mb-4">Game Structure:</h2>
              <div className="flex flex-col md:items-start items-center space-y-2">
                <div className="flex items-center">
                  <div className="bg-[#e8f0e9] text-[#2a2e29] px-3 py-1 rounded mr-3 font-medium text-sm">
                    3 LEVELS
                  </div>
                  <span className="text-[#4eca78]">Complete all levels</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-[#e8f0e9] text-[#2a2e29] px-3 py-1 rounded mr-3 font-medium text-sm">
                    QUESTIONS
                  </div>
                  <span className="text-[#4eca78]">5 questions after all levels</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-[#e8f0e9] text-[#2a2e29] px-3 py-1 rounded mr-3 font-medium text-sm">
                    3 LIVES
                  </div>
                  <span className="text-[#4eca78]">
                    Don't let the ball fall!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(78, 202, 120, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(78, 202, 120, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(78, 202, 120, 0);
          }
        }
      `}</style>
    </div>
  );
};

const BounceBackGame: React.FC<BounceBackGameProps> = ({ userId, onGameComplete, onCancel, onError, width = "960px", height = "540px" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  const {
    // Game state
    paddleX,
    ball,
    bricks,
    score,
    lives,
    gameStarted,
    setGameStarted,
    gameOver,
    gameWon,
    currentLevel,
    currentLevelData,
    
    // Question modal state
    showQuestions,
    setShowQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    questionResponses,
    setQuestionResponses,
    questionsCompleted,
    setQuestionsCompleted,
    allLevelsCompleted,
    
    // Game data
    gameData,
    setGameData,
    
    // Actions
    resetGame,
    getPaddleWidth,
    saveGameDataToFirebase,
  } = useGameLogic({ userId, onGameComplete, onError });

  // Handle question responses
  const handleQuestionResponse = useCallback((response: number) => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    setQuestionResponses(prev => {
      const newResponses = {
        ...prev,
        [currentQuestion.id]: response
      };
      return newResponses;
    });

    // Don't automatically advance to next question
    // User must click "Next" button to proceed
  }, [currentQuestionIndex, setQuestionResponses]);

  // Handle questions completion
  const handleQuestionsComplete = useCallback(async () => {
    
    if (allLevelsCompleted) {
      // All levels completed - finish the game
      const finalGameData = {
        ...gameData,
        selfReportResponses: { ...gameData.selfReportResponses, ...questionResponses },
        endTime: Date.now(),
        finalScore: score + (lives * 50),
        gameCompleted: true
      };
      
      // Save to Firebase
      try {
        await saveGameDataToFirebase(finalGameData);
        console.log('[BounceBack] Game data saved to Firebase successfully');
      } catch (error) {
        console.error('[BounceBack] Failed to save game data to Firebase:', error);
        if (onError) {
          onError(`Failed to save game data: ${error}`);
        }
      }
      
      // Close questions modal
      setShowQuestions(false);
      setCurrentQuestionIndex(0);
      setQuestionResponses({});
      setQuestionsCompleted(false);
      
      // Call the completion callback
      if (onGameComplete) {
        setGameCompleted(true); // Hide the game component
        onGameComplete(finalGameData);
      } else {
        // Fallback: force completion by hiding the component
        setGameCompleted(true);
      }
    } else {
      // Continue to next level (this shouldn't happen since questions only show after all levels)
      setShowQuestions(false);
      setCurrentQuestionIndex(0);
      setQuestionResponses({});
      setQuestionsCompleted(false);
    }
  }, [allLevelsCompleted, gameData, questionResponses, score, lives, onGameComplete, onError, saveGameDataToFirebase, setShowQuestions, setCurrentQuestionIndex, setQuestionResponses, setQuestionsCompleted]);

  // Get current paddle width
  const currentPaddleWidth = getPaddleWidth(currentLevel);

  // Render game on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bricks
    bricks.forEach(brick => {
      if (brick.status === 1) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });

    // Draw paddle with dynamic width
    ctx.fillStyle = PADDLE_COLOR;
    ctx.fillRect(paddleX, CANVAS_HEIGHT - PADDLE_Y_OFFSET, currentPaddleWidth, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = BALL_COLOR;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Add subtle shadow/border to make ball more visible
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [paddleX, ball, bricks, currentLevelData.name, currentPaddleWidth]);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  // Hide the game component if it's completed
  if (gameCompleted) {
    return null;
  }

  return (
    <div className="flex w-full justify-center items-start bg-[#2a2e29] p-4 pt-2">
      <div className="w-full max-w-6xl relative">
        <div className="bg-[#2a2e29] rounded-lg shadow-lg overflow-hidden">


          {/* Game Status */}
          <div className="text-center mb-4">
            <div className="text-[#4eca78] text-lg">
              Score: {score} | Lives: {Math.max(0, lives)} | Level: {currentLevel}/3
            </div>
            <p className="text-[#4eca78]/80 text-sm mt-2">
              Take your time and get familiar with the controls
            </p>
          </div>

          {/* Game Board */}
          <div className="mx-auto w-full flex items-center justify-center mb-2 relative">
            <div className="bg-[#e8f0e9] rounded-lg p-4 shadow-md relative" style={{
              width: width,
              height: height,
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 250px)',
              display: 'block',
              margin: '0 auto'
            }}>
              
              {/* Game Canvas */}
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{
                  width: '100%',
                  height: 'calc(100% - 60px)',
                  borderRadius: 12,
                  boxShadow: '0 2px 16px #a7f3d0',
                  background: BG_COLOR,
                  display: 'block',
                  margin: '0 auto',
                }}
                tabIndex={0}
              />
              
              {/* Start Screen Overlay */}
              {showInstructions && <StartScreen onStart={() => {
                setShowInstructions(false);
                setGameStarted(true);
              }} />}
            </div>
          </div>


        </div>
      </div>

      {/* Questions Modal */}
      {showQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-emerald-700 mb-2">
                {allLevelsCompleted ? 'Final Assessment Questions' : `Level ${currentLevel} Complete!`}
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
                    name={`question-${currentQuestion.id}-${currentQuestionIndex}`}
                    value="1"
                    checked={questionResponses[currentQuestion.id] === 1}
                    onChange={() => handleQuestionResponse(1)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">1 - Not at all</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}-${currentQuestionIndex}`}
                    value="2"
                    checked={questionResponses[currentQuestion.id] === 2}
                    onChange={() => handleQuestionResponse(2)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">2 - Slightly</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}-${currentQuestionIndex}`}
                    value="3"
                    checked={questionResponses[currentQuestion.id] === 3}
                    onChange={() => handleQuestionResponse(3)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">3 - Moderately</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}-${currentQuestionIndex}`}
                    value="4"
                    checked={questionResponses[currentQuestion.id] === 4}
                    onChange={() => handleQuestionResponse(4)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">4 - Very</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}-${currentQuestionIndex}`}
                    value="5"
                    checked={questionResponses[currentQuestion.id] === 5}
                    onChange={() => handleQuestionResponse(5)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">5 - Extremely</span>
                </label>
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                Previous
              </button>
              
              <button
                onClick={() => {
                  const nextIndex = currentQuestionIndex + 1;
                  if (nextIndex >= QUESTIONS.length) {
                    // Reached the last question, complete the assessment directly
                    handleQuestionsComplete();
                  } else {
                    // Go to next question
                    setCurrentQuestionIndex(nextIndex);
                  }
                }}
                disabled={(() => {
                  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
                  const isAnswered = questionResponses[currentQuestion.id];
                  const shouldBeDisabled = isLastQuestion && !isAnswered;
                  return shouldBeDisabled;
                })()}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  (currentQuestionIndex === QUESTIONS.length - 1 && !questionResponses[currentQuestion.id])
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {currentQuestionIndex === QUESTIONS.length - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
            
            {questionsCompleted && (
              <div className="text-center">
                <p className="text-emerald-600 font-medium mb-4">
                  Thank you for your responses!
                </p>
                <button
                  onClick={handleQuestionsComplete}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  {allLevelsCompleted ? 'Complete Assessment' : 'Continue to Next Level'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Over/Win Messages */}
      {gameWon && !showQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <h3 className="text-xl font-bold text-emerald-600 mb-4">Congratulations!</h3>
            <p className="text-gray-700 mb-4">You completed all levels! Final Score: {score + (lives * 50)}</p>
            <button
              onClick={resetGame}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BounceBackGame; 