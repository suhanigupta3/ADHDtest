import React, { useRef, useEffect, useState } from 'react';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 320;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const PADDLE_Y_OFFSET = 30;
const BALL_RADIUS = 6;
const BRICK_ROWS = 4;
const BRICK_COLS = 8;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 18;
const BRICK_PADDING = 8;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 40;

const PADDLE_COLOR = '#34d399'; // emerald-400
const BG_COLOR = '#e0e9e0'; // forest-100
const BALL_COLOR = '#059669'; // emerald-600
const BRICK_COLORS = [
  '#10b981', // emerald-500
  '#059669', // emerald-600
  '#047857', // emerald-700
  '#065f46', // emerald-800
];

interface Brick {
  x: number;
  y: number;
  status: number;
  color: string;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface Level {
  id: number;
  name: string;
  ballSpeed: number;
  paddleSpeed: number;
  brickRows: number;
  description: string;
}

interface Question {
  id: string;
  text: string;
  category: 'attention' | 'impulsivity' | 'frustration' | 'focus' | 'persistence';
}

const QUESTIONS: Question[] = [
  {
    id: 'attention_1',
    text: 'How difficult was it to maintain focus on the ball throughout the game?',
    category: 'attention'
  },
  {
    id: 'impulsivity_1',
    text: 'How often did you find yourself moving the paddle without thinking?',
    category: 'impulsivity'
  },
  {
    id: 'frustration_1',
    text: 'How frustrated did you feel when you lost a life?',
    category: 'frustration'
  },
  {
    id: 'focus_1',
    text: 'How well were you able to plan your paddle movements in advance?',
    category: 'focus'
  },
  {
    id: 'persistence_1',
    text: 'How motivated were you to continue playing after losing a life?',
    category: 'persistence'
  }
];

const LEVELS: Level[] = [
  {
    id: 1,
    name: "Level 1: Getting Started",
    ballSpeed: 1.8, // Reduced from 2.5 - much more manageable
    paddleSpeed: 6,
    brickRows: 2,
    description: "Take your time and get familiar with the controls"
  },
  {
    id: 2,
    name: "Level 2: Building Skills",
    ballSpeed: 2.2, // Reduced from 3.5 - moderate challenge
    paddleSpeed: 7,
    brickRows: 3,
    description: "A bit more challenging with more bricks"
  },
  {
    id: 3,
    name: "Level 3: Full Challenge",
    ballSpeed: 2.8, // Reduced from 4.5 - challenging but doable
    paddleSpeed: 8,
    brickRows: 4,
    description: "The complete challenge with all bricks"
  }
];

interface GameData {
  startTime: number;
  endTime?: number;
  totalPlayTime: number;
  bricksDestroyed: number;
  totalBricks: number;
  accuracy: number;
  averageReactionTime: number;
  paddleHits: number;
  wallHits: number;
  livesLost: number;
  finalScore: number;
  gameCompleted: boolean;
  reactionTimes: number[];
  paddleMovements: number;
  ballSpeed: number;
  currentLevel: number;
  levelScores: number[];
  levelCompletionTimes: number[];
  selfReportResponses: { [key: string]: number };
}

interface BounceBackGameProps {
  onGameComplete?: (gameData: GameData) => void;
}

const BounceBackGame: React.FC<BounceBackGameProps> = ({ onGameComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paddleX, setPaddleX] = useState((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
  const [rightPressed, setRightPressed] = useState(false);
  const [leftPressed, setLeftPressed] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelStartTime, setLevelStartTime] = useState(Date.now());
  
  // Question modal states
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionResponses, setQuestionResponses] = useState<{ [key: string]: number }>({});
  const [questionsCompleted, setQuestionsCompleted] = useState(false);
  const [allLevelsCompleted, setAllLevelsCompleted] = useState(false);
  
  // Data collection for ADHD assessment
  const [gameData, setGameData] = useState<GameData>({
    startTime: Date.now(),
    totalPlayTime: 0,
    bricksDestroyed: 0,
    totalBricks: LEVELS[0].brickRows * BRICK_COLS,
    accuracy: 0,
    averageReactionTime: 0,
    paddleHits: 0,
    wallHits: 0,
    livesLost: 0,
    finalScore: 0,
    gameCompleted: false,
    reactionTimes: [],
    paddleMovements: 0,
    ballSpeed: LEVELS[0].ballSpeed,
    currentLevel: 1,
    levelScores: [],
    levelCompletionTimes: [],
    selfReportResponses: {},
  });

  // Initialize ball with level-appropriate speed
  const [ball, setBall] = useState<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS - 15,
    dx: LEVELS[0].ballSpeed,
    dy: -LEVELS[0].ballSpeed,
  });

  // Initialize bricks for current level
  const [bricks, setBricks] = useState<Brick[]>(() => {
    const currentLevelData = LEVELS[currentLevel - 1];
    const bricksArray: Brick[] = [];
    for (let c = 0; c < BRICK_COLS; c++) {
      for (let r = 0; r < currentLevelData.brickRows; r++) {
        bricksArray.push({
          x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          status: 1,
          color: BRICK_COLORS[r],
        });
      }
    }
    return bricksArray;
  });

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        setRightPressed(true);
        setGameData(prev => ({ ...prev, paddleMovements: prev.paddleMovements + 1 }));
      }
      if (e.key === 'Left' || e.key === 'ArrowLeft') {
        setLeftPressed(true);
        setGameData(prev => ({ ...prev, paddleMovements: prev.paddleMovements + 1 }));
      }
      if (e.key === ' ' && !gameStarted && !gameOver && !gameWon && !showQuestions) {
        setGameStarted(true);
        setGameData(prev => ({ ...prev, startTime: Date.now() }));
        setLevelStartTime(Date.now());
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') setRightPressed(false);
      if (e.key === 'Left' || e.key === 'ArrowLeft') setLeftPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, gameWon, showQuestions]);

  // Function to handle question responses
  const handleQuestionResponse = (response: number) => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    setQuestionResponses(prev => ({
      ...prev,
      [currentQuestion.id]: response
    }));

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions completed
      setQuestionsCompleted(true);
      setGameData(prev => ({
        ...prev,
        selfReportResponses: { ...prev.selfReportResponses, ...questionResponses, [currentQuestion.id]: response }
      }));
    }
  };

  // Function to close questions modal and continue
  const handleQuestionsComplete = () => {
    setShowQuestions(false);
    setCurrentQuestionIndex(0);
    setQuestionResponses({});
    setQuestionsCompleted(false);
    
    if (allLevelsCompleted) {
      // Game is completely finished - call completion callback
      const finalGameData = {
        ...gameData,
        selfReportResponses: { ...gameData.selfReportResponses, ...questionResponses },
        endTime: Date.now(),
        finalScore: score + (lives * 50),
        gameCompleted: true
      };
      
      console.log('Bounce Back Game Completed with Data:', finalGameData);
      
      if (onGameComplete) {
        onGameComplete(finalGameData);
      }
    } else {
      // Continue to next level
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      setLevelStartTime(Date.now());
      
      // Reset lives for new level
      setLives(3);
      
      // Reset for next level
      const nextLevelData = LEVELS[nextLevel - 1];
      setBall({
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS - 15,
        dx: nextLevelData.ballSpeed,
        dy: -nextLevelData.ballSpeed,
      });
      
      // Create new bricks for next level
      const newBricks: Brick[] = [];
      for (let c = 0; c < BRICK_COLS; c++) {
        for (let r = 0; r < nextLevelData.brickRows; r++) {
          newBricks.push({
            x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
            y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
            status: 1,
            color: BRICK_COLORS[r],
          });
        }
      }
      setBricks(newBricks);
      setGameStarted(false);
    }
  };

  // Function to advance to next level
  const advanceLevel = () => {
    const currentLevelData = LEVELS[currentLevel - 1];
    const levelScore = score;
    const levelTime = Date.now() - levelStartTime;
    
    setGameData(prev => ({
      ...prev,
      levelScores: [...prev.levelScores, levelScore],
      levelCompletionTimes: [...prev.levelCompletionTimes, levelTime],
      currentLevel: currentLevel + 1,
    }));
    
    if (currentLevel < 3) {
      // Show questions after completing a level
      setShowQuestions(true);
    } else {
      // All levels completed - show final questions
      setAllLevelsCompleted(true);
      setShowQuestions(true);
      setGameData(prev => ({ 
        ...prev, 
        endTime: Date.now(),
        finalScore: score + (lives * 50),
        gameCompleted: true
      }));
    }
  };

  // Game loop with improved physics and data collection
  useEffect(() => {
    if (gameOver || gameWon || showQuestions) return;

    let animationFrameId: number;
    let lastTime = Date.now();
    
    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw level indicator
      const currentLevelData = LEVELS[currentLevel - 1];
      ctx.fillStyle = '#059669';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(currentLevelData.name, CANVAS_WIDTH / 2, 20);

      // Draw bricks
      bricks.forEach(brick => {
        if (brick.status === 1) {
          ctx.fillStyle = brick.color;
          ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
          ctx.strokeStyle = '#047857';
          ctx.lineWidth = 1;
          ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        }
      });

      // Draw paddle
      ctx.fillStyle = PADDLE_COLOR;
      ctx.fillRect(paddleX, CANVAS_HEIGHT - PADDLE_Y_OFFSET, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillStyle = BALL_COLOR;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Move paddle with level-appropriate speed
      const currentPaddleSpeed = currentLevelData.paddleSpeed;
      setPaddleX(prev => {
        let next = prev;
        if (rightPressed) next = Math.min(prev + currentPaddleSpeed, CANVAS_WIDTH - PADDLE_WIDTH);
        if (leftPressed) next = Math.max(prev - currentPaddleSpeed, 0);
        return next;
      });

      // Move ball if game started
      if (gameStarted) {
        setBall(prevBall => {
          let newX = prevBall.x + prevBall.dx;
          let newY = prevBall.y + prevBall.dy;
          let newDx = prevBall.dx;
          let newDy = prevBall.dy;

          // Wall collision - ball bounces off walls
          if (newX + BALL_RADIUS > CANVAS_WIDTH) {
            newDx = -Math.abs(newDx); // Bounce off right wall
            setGameData(prev => ({ ...prev, wallHits: prev.wallHits + 1 }));
          }
          if (newX - BALL_RADIUS < 0) {
            newDx = Math.abs(newDx); // Bounce off left wall
            setGameData(prev => ({ ...prev, wallHits: prev.wallHits + 1 }));
          }
          if (newY - BALL_RADIUS < 0) {
            newDy = Math.abs(newDy); // Bounce off top wall
            setGameData(prev => ({ ...prev, wallHits: prev.wallHits + 1 }));
          }

          // Paddle collision - ball bounces off paddle
          if (newY + BALL_RADIUS > CANVAS_HEIGHT - PADDLE_Y_OFFSET &&
              newY + BALL_RADIUS < CANVAS_HEIGHT - PADDLE_Y_OFFSET + PADDLE_HEIGHT &&
              newX > paddleX && newX < paddleX + PADDLE_WIDTH) {
            
            // Bounce the ball upward
            newDy = -Math.abs(newDy);
            setGameData(prev => ({ ...prev, paddleHits: prev.paddleHits + 1 }));
            
            // Calculate reaction time for this paddle hit
            const reactionTime = Date.now() - gameData.startTime;
            setGameData(prev => ({
              ...prev,
              reactionTimes: [...prev.reactionTimes, reactionTime]
            }));
            
            // Add angle based on where ball hits paddle (more realistic)
            const hitPos = (newX - paddleX) / PADDLE_WIDTH;
            const angle = (hitPos - 0.5) * Math.PI / 3; // -30 to +30 degrees
            const speed = Math.sqrt(newDx * newDx + newDy * newDy);
            newDx = speed * Math.sin(angle);
            newDy = -speed * Math.cos(angle);
          }

          // Brick collision - ball bounces off bricks
          bricks.forEach((brick, index) => {
            if (brick.status === 1) {
              if (newX + BALL_RADIUS > brick.x &&
                  newX - BALL_RADIUS < brick.x + BRICK_WIDTH &&
                  newY + BALL_RADIUS > brick.y &&
                  newY - BALL_RADIUS < brick.y + BRICK_HEIGHT) {
                
                // Determine collision side and bounce accordingly
                const ballCenterX = newX;
                const ballCenterY = newY;
                const brickCenterX = brick.x + BRICK_WIDTH / 2;
                const brickCenterY = brick.y + BRICK_HEIGHT / 2;
                
                const dx = ballCenterX - brickCenterX;
                const dy = ballCenterY - brickCenterY;
                
                if (Math.abs(dx) > Math.abs(dy)) {
                  // Horizontal collision - bounce horizontally
                  newDx = -newDx;
                } else {
                  // Vertical collision - bounce vertically
                  newDy = -newDy;
                }
                
                setBricks(prev => {
                  const newBricks = [...prev];
                  newBricks[index].status = 0;
                  return newBricks;
                });
                
                setScore(prev => prev + 10);
                setGameData(prev => ({ 
                  ...prev, 
                  bricksDestroyed: prev.bricksDestroyed + 1 
                }));
              }
            }
          });

          // Ball out of bounds - lose a life
          if (newY + BALL_RADIUS > CANVAS_HEIGHT) {
            setLives(prev => {
              const newLives = Math.max(0, prev - 1); // Prevent negative lives
              setGameData(prevData => ({ 
                ...prevData, 
                livesLost: prevData.livesLost + 1 
              }));
              
              if (newLives <= 0) {
                setGameOver(true);
                setGameData(prev => ({ 
                  ...prev, 
                  endTime: Date.now(),
                  finalScore: score,
                  gameCompleted: false
                }));
              } else {
                // Reset ball position for current level
                const currentLevelData = LEVELS[currentLevel - 1];
                newX = CANVAS_WIDTH / 2;
                newY = CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS - 15;
                newDx = currentLevelData.ballSpeed;
                newDy = -currentLevelData.ballSpeed;
                setGameStarted(false);
              }
              return newLives;
            });
          }

          // Check if all bricks are destroyed for current level
          const remainingBricks = bricks.filter(brick => brick.status === 1).length;
          if (remainingBricks === 0) {
            advanceLevel();
          }

          return { x: newX, y: newY, dx: newDx, dy: newDy };
        });
      } else {
        // Ball follows paddle when game hasn't started
        setBall(prev => ({
          ...prev,
          x: paddleX + PADDLE_WIDTH / 2,
          y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS - 15,
        }));
      }

      // Update game data
      if (gameStarted) {
        setGameData(prev => ({
          ...prev,
          totalPlayTime: Date.now() - prev.startTime,
          accuracy: prev.bricksDestroyed / prev.totalBricks * 100,
          averageReactionTime: prev.reactionTimes.length > 0 
            ? prev.reactionTimes.reduce((a, b) => a + b, 0) / prev.reactionTimes.length 
            : 0,
          ballSpeed: Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy)
        }));
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [paddleX, rightPressed, leftPressed, gameStarted, ball, bricks, gameOver, gameWon, lives, score, gameData.startTime, currentLevel, showQuestions]);

  // Responsive canvas
  const style = {
    width: '100%',
    maxWidth: CANVAS_WIDTH,
    height: 'auto',
    borderRadius: 12,
    boxShadow: '0 2px 16px #a7f3d0',
    background: BG_COLOR,
    display: 'block',
    margin: '0 auto',
  } as React.CSSProperties;

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(false);
    setCurrentLevel(1);
    setLevelStartTime(Date.now());
    setShowQuestions(false);
    setCurrentQuestionIndex(0);
    setQuestionResponses({});
    setQuestionsCompleted(false);
    setAllLevelsCompleted(false);
    
    const firstLevel = LEVELS[0];
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS - 15,
      dx: firstLevel.ballSpeed,
      dy: -firstLevel.ballSpeed,
    });
    
    setBricks(() => {
      const bricksArray: Brick[] = [];
      for (let c = 0; c < BRICK_COLS; c++) {
        for (let r = 0; r < firstLevel.brickRows; r++) {
          bricksArray.push({
            x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
            y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
            status: 1,
            color: BRICK_COLORS[r],
          });
        }
      }
      return bricksArray;
    });
    
    setGameData({
      startTime: Date.now(),
      totalPlayTime: 0,
      bricksDestroyed: 0,
      totalBricks: firstLevel.brickRows * BRICK_COLS,
      accuracy: 0,
      averageReactionTime: 0,
      paddleHits: 0,
      wallHits: 0,
      livesLost: 0,
      finalScore: 0,
      gameCompleted: false,
      reactionTimes: [],
      paddleMovements: 0,
      ballSpeed: firstLevel.ballSpeed,
      currentLevel: 1,
      levelScores: [],
      levelCompletionTimes: [],
      selfReportResponses: {},
    });
  };

  const currentLevelData = LEVELS[currentLevel - 1];
  const currentQuestion = QUESTIONS[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center py-8">
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
                    name={`question-${currentQuestion.id}`}
                    value="1"
                    onChange={() => handleQuestionResponse(1)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">1 - Not at all</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="2"
                    onChange={() => handleQuestionResponse(2)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">2 - Slightly</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="3"
                    onChange={() => handleQuestionResponse(3)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">3 - Moderately</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value="4"
                      onChange={() => handleQuestionResponse(4)}
                      className="text-emerald-600"
                    />
                    <span className="text-gray-700">4 - Very</span>
                  </label>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="5"
                    onChange={() => handleQuestionResponse(5)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">5 - Extremely</span>
                </label>
              </div>
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

      <div className="mb-4 text-center">
        <div className="text-emerald-700 font-semibold mb-2">
          Score: {score} | Lives: {Math.max(0, lives)} | Level: {currentLevel}/3
        </div>
        <div className="text-emerald-600 text-sm mb-2">
          {currentLevelData.description}
        </div>
        {!gameStarted && !gameOver && !gameWon && !showQuestions && (
          <div className="text-emerald-600 text-sm">
            Press SPACE to start the ball
          </div>
        )}
        {gameOver && (
          <div className="text-red-600 font-bold mb-2">
            Game Over! Final Score: {score}
          </div>
        )}
        {gameWon && !showQuestions && (
          <div className="text-emerald-600 font-bold mb-2">
            Congratulations! You completed all levels! Final Score: {score + (lives * 50)}
          </div>
        )}
        {(gameOver || (gameWon && !showQuestions)) && (
          <button
            onClick={resetGame}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Play Again
          </button>
        )}
      </div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={style}
        tabIndex={0}
      />
      
      <div className="mt-6 text-emerald-700 font-semibold text-center max-w-2xl mx-auto">
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-3 text-emerald-800">How to Play:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-emerald-100 px-2 py-1 rounded text-emerald-800 font-medium">SPACEBAR</span>
              <span>Press to launch the ball and start the game</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-emerald-100 px-2 py-1 rounded text-emerald-800 font-medium">← →</span>
              <span>Use LEFT and RIGHT arrow keys to move the paddle</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-emerald-100 px-2 py-1 rounded text-emerald-800 font-medium">BREAK BRICKS</span>
              <span>Hit all bricks to advance to the next level</span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-3 text-emerald-800">Game Structure:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-emerald-100 px-2 py-1 rounded text-emerald-800 font-medium">3 LEVELS</span>
              <span>Complete all 3 levels to finish the assessment</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-emerald-100 px-2 py-1 rounded text-emerald-800 font-medium">QUESTIONS</span>
              <span>Answer 5 questions after each level completion</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-emerald-100 px-2 py-1 rounded text-emerald-800 font-medium">3 LIVES</span>
              <span>You have 3 lives per level - don't let the ball fall!</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-emerald-600">
          <p>• Each level gets progressively more challenging</p>
          <p>• Questions help assess your ADHD-related experiences</p>
          <p>• Complete all levels and questions to unlock the next game</p>
        </div>
      </div>
    </div>
  );
};

export default BounceBackGame; 