import { useState, useCallback, useRef, useEffect } from 'react';
import { Ball, Brick, GameData } from '../types';
import { LEVELS, CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_WIDTH, PADDLE_Y_OFFSET, BALL_RADIUS } from '../constants';
import { createInitialBricks, createInitialBall, updateBallPosition, calculateAccuracy, calculateAverageReactionTime } from '../utils';

export const useGameLogic = () => {
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const outOfBoundsProcessedRef = useRef<boolean>(false);
  
  // Game state
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
  
  // Game data collection
  const [gameData, setGameData] = useState<GameData>(() => ({
    startTime: Date.now(),
    totalPlayTime: 0,
    bricksDestroyed: 0,
    totalBricks: LEVELS[0].brickRows * 8,
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
  }));

  // Ball state
  const [ball, setBall] = useState<Ball>(() => createInitialBall(LEVELS[0].ballSpeed));

  // Bricks state
  const [bricks, setBricks] = useState<Brick[]>(() => createInitialBricks(LEVELS[0].brickRows));

  // Current level data
  const currentLevelData = LEVELS[currentLevel - 1];

  // Get paddle width for current level (reduces with each level)
  const getPaddleWidth = (level: number) => {
    const baseWidth = PADDLE_WIDTH;
    const reduction = (level - 1) * 20; // Reduce by 20px each level
    return Math.max(baseWidth - reduction, 80); // Minimum 80px
  };

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

  // Advance to next level
  const advanceLevel = useCallback(() => {
    const levelScore = score;
    const levelTime = Date.now() - levelStartTime;
    
    setGameData(prev => ({
      ...prev,
      levelScores: [...prev.levelScores, levelScore],
      levelCompletionTimes: [...prev.levelCompletionTimes, levelTime],
    }));
    
    if (currentLevel < 3) {
      // Move to next level without showing questions
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      setLevelStartTime(Date.now());
      
      // Reset for next level
      const nextLevelData = LEVELS[nextLevel - 1];
      setBall(createInitialBall(nextLevelData.ballSpeed));
      setBricks(createInitialBricks(nextLevelData.brickRows));
      setGameStarted(false);
      setLives(3); // Reset lives to 3 for new level
      
      // Update game data for new level
      setGameData(prev => ({
        ...prev,
        currentLevel: nextLevel,
        totalBricks: nextLevelData.brickRows * 8,
        ballSpeed: nextLevelData.ballSpeed,
      }));
    } else {
      // All levels completed, show questions
      setAllLevelsCompleted(true);
      setShowQuestions(true);
      setGameData(prev => ({ 
        ...prev, 
        endTime: Date.now(),
        finalScore: score + (lives * 50),
        gameCompleted: true
      }));
    }
  }, [currentLevel, score, levelStartTime]);

  // Reset game
  const resetGame = useCallback(() => {
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
    setBall(createInitialBall(firstLevel.ballSpeed));
    setBricks(createInitialBricks(firstLevel.brickRows));
    
    setGameData({
      startTime: Date.now(),
      totalPlayTime: 0,
      bricksDestroyed: 0,
      totalBricks: firstLevel.brickRows * 8,
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
  }, []);

  // Check for level completion
  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon && !showQuestions) {
      const remainingBricks = bricks.filter(brick => brick.status === 1).length;
      if (remainingBricks === 0) {
        advanceLevel();
      }
    }
  }, [bricks, gameStarted, gameOver, gameWon, showQuestions, advanceLevel, currentLevel]);

  // Game loop
  useEffect(() => {
    if (gameOver || gameWon || showQuestions) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      return;
    }

    const gameLoop = (currentTime: number) => {
      lastTimeRef.current = currentTime;

      const currentPaddleWidth = getPaddleWidth(currentLevel);

      // Move paddle
      setPaddleX(prev => {
        let next = prev;
        if (rightPressed) next = Math.min(prev + currentLevelData.paddleSpeed, CANVAS_WIDTH - currentPaddleWidth);
        if (leftPressed) next = Math.max(prev - currentLevelData.paddleSpeed, 0);
        return next;
      });

      // Update ball position
      if (gameStarted) {
        setBall(prevBall => {
          const result = updateBallPosition(prevBall, paddleX, bricks, gameStarted, currentPaddleWidth);
          
          // Handle brick destruction - only destroy the specific brick that was hit
          if (result.bricksDestroyed > 0 && result.hitBrickIndex !== null) {
            setBricks(prev => {
              const newBricks = [...prev];
              newBricks[result.hitBrickIndex!].status = 0;
              return newBricks;
            });
            
            setScore(prev => prev + 10);
            setGameData(prev => ({ 
              ...prev, 
              bricksDestroyed: prev.bricksDestroyed 
            }));
          }

          // Handle paddle hit
          if (result.paddleHit) {
            setGameData(prev => ({ 
              ...prev, 
              paddleHits: prev.paddleHits + 1,
              reactionTimes: [...prev.reactionTimes, Date.now() - prev.startTime]
            }));
          }

          // Handle wall hit
          if (result.wallHit) {
            setGameData(prev => ({ ...prev, wallHits: prev.wallHits + 1 }));
          }

          // Handle ball out of bounds
          if (result.outOfBounds && !outOfBoundsProcessedRef.current) {
            outOfBoundsProcessedRef.current = true;
            setLives(prev => {
              const newLives = Math.max(0, prev - 1);
              setGameData(prevData => ({ 
                ...prevData, 
                livesLost: prevData.livesLost + 1 
              }));
              
              if (newLives <= 0) {
                // Instead of game over, show questions for assessment
                setAllLevelsCompleted(true);
                setShowQuestions(true);
                setGameData(prev => ({ 
                  ...prev, 
                  endTime: Date.now(),
                  finalScore: score,
                  gameCompleted: true
                }));
              } else {
                // Reset ball position
                setGameStarted(false);
              }
              return newLives;
            });
          }

          return result.newBall;
        });
      } else {
        // Ball follows paddle when game hasn't started
        outOfBoundsProcessedRef.current = false; // Reset flag when ball is reset
        setBall(prev => ({
          ...prev,
          x: paddleX + currentPaddleWidth / 2,
          y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS,
        }));
      }

      // Update game data
      if (gameStarted) {
        setGameData(prev => ({
          ...prev,
          totalPlayTime: Date.now() - prev.startTime,
          accuracy: calculateAccuracy(prev.bricksDestroyed, prev.totalBricks),
          averageReactionTime: calculateAverageReactionTime(prev.reactionTimes),
          ballSpeed: Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy)
        }));
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [gameOver, gameWon, showQuestions, gameStarted, paddleX, rightPressed, leftPressed, ball, bricks, score, lives, currentLevelData, gameData.startTime, currentLevel]);

  return {
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
    setAllLevelsCompleted,
    
    // Game data
    gameData,
    setGameData,
    
    // Actions
    resetGame,
    advanceLevel,
    getPaddleWidth,
  };
}; 