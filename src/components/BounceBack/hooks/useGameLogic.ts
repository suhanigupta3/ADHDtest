import { useState, useCallback, useRef, useEffect } from 'react';
import { Ball, Brick, GameData } from '../types';
import { LEVELS, CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_WIDTH, PADDLE_Y_OFFSET, BALL_RADIUS } from '../constants';
import { createInitialBricks, createInitialBall, updateBallPosition, calculateAccuracy, calculateAverageReactionTime, calculateAverageRecoveryTime, calculatePaddlePositionAccuracy, calculateBallSpeedConsistency, testADHDScores } from '../utils';
import { db } from '../../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

interface UseGameLogicProps {
  userId?: string;
  onGameComplete?: (gameData: GameData) => void;
  onError?: (error: string) => void;
}

export const useGameLogic = ({ userId, onGameComplete, onError }: UseGameLogicProps) => {
  // Test the ADHD score calculations
  useEffect(() => {
    testADHDScores();
  }, []);
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
  const [levelStartLives, setLevelStartLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelStartTime, setLevelStartTime] = useState(Date.now());
  const [levelStartScore, setLevelStartScore] = useState(0);
  
  // Question modal states
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionResponses, setQuestionResponses] = useState<{ [key: string]: number }>({});
  const [questionsCompleted, setQuestionsCompleted] = useState(false);
  const [allLevelsCompleted, setAllLevelsCompleted] = useState(false);
  const [showLevelTransition, setShowLevelTransition] = useState(false);
  const [transitionData, setTransitionData] = useState<{
    type: 'level-complete' | 'game-over';
    level?: number;
    score: number;
    time: number;
    bricksDestroyed: number;
    totalBricks: number;
    livesLost: number;
  } | null>(null);
  const [levelCompleted, setLevelCompleted] = useState(false);
  
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
    // New metrics for better ADHD assessment
    consecutiveErrors: 0,
    maxConsecutiveErrors: 0,
    recoveryTimeAfterMistake: 0,
    averageRecoveryTime: 0,
    paddlePositionAccuracy: 0,
    ballSpeedConsistency: 0,
    movementPatterns: [],
    errorPatterns: [],
    timeBetweenMistakes: [],
    lastMistakeTime: 0,
    totalMistakes: 0,
    successfulRecoveries: 0,
    failedRecoveries: 0,
    ballSpeedHistory: [],
  }));

  // Ball state
  const [ball, setBall] = useState<Ball>(() => createInitialBall(LEVELS[0].ballSpeed));

  // Bricks state
  const [bricks, setBricks] = useState<Brick[]>(() => createInitialBricks(LEVELS[0].brickRows, LEVELS[0]));
  
  // Power-ups state
  const [activePowerUps, setActivePowerUps] = useState<{ [key: string]: { type: string; endTime: number } }>({});
  const [paddleWidthMultiplier, setPaddleWidthMultiplier] = useState(1);
  const [ballSpeedMultiplier, setBallSpeedMultiplier] = useState(1);
  


  // Current level data
  const currentLevelData = LEVELS[currentLevel - 1];

  // Get paddle width for current level (reduces with each level)
  const getPaddleWidth = (level: number) => {
    const baseWidth = PADDLE_WIDTH;
    const reduction = (level - 1) * 20; // Reduce by 20px each level
    const powerUpWidth = paddleWidthMultiplier > 1 ? baseWidth * paddleWidthMultiplier : baseWidth;
    return Math.max(powerUpWidth - reduction, 80); // Minimum 80px
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        setRightPressed(true);
        setGameData(prev => ({ 
          ...prev, 
          paddleMovements: prev.paddleMovements + 1,
          movementPatterns: [...prev.movementPatterns, Date.now() - prev.startTime]
        }));
      }
      if (e.key === 'Left' || e.key === 'ArrowLeft') {
        setLeftPressed(true);
        setGameData(prev => ({ 
          ...prev, 
          paddleMovements: prev.paddleMovements + 1,
          movementPatterns: [...prev.movementPatterns, Date.now() - prev.startTime]
        }));
      }
      if (e.key === ' ' && !gameOver && !gameWon && !showQuestions) {
        e.preventDefault();
        
        // Only launch if ball has no velocity
        if (ball.dx === 0 && ball.dy === 0) {
          const ballSpeed = currentLevelData.ballSpeed * ballSpeedMultiplier;
          console.log('[BounceBack] Launching ball with speed:', ballSpeed, 'gameStarted:', gameStarted);
          setBall(prev => ({
            ...prev,
            dx: ballSpeed,
            dy: -ballSpeed
          }));
          // Set game as started when ball is launched
          setGameStarted(true);
        } else {
          console.log('[BounceBack] Ball launch blocked - ball has velocity:', { dx: ball.dx, dy: ball.dy });
        }
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
  }, [gameOver, gameWon, showQuestions, currentLevel, ballSpeedMultiplier, ball.dx, ball.dy]);

  // Save game data to Firebase
  const saveGameDataToFirebase = useCallback(async (finalGameData: GameData) => {
    if (!userId) {
      console.warn('[BounceBack][FIREBASE] No userId provided, skipping Firebase save');
      return;
    }

    try {
      console.log('[BounceBack][FIREBASE] Saving game data to Firebase:', finalGameData);
      
      // Calculate ADHD scores based on game performance and self-report
      const selfReport = finalGameData.selfReportResponses;
      const gameMetrics = {
        accuracy: finalGameData.accuracy,
        averageReactionTime: finalGameData.averageReactionTime,
        paddleHits: finalGameData.paddleHits,
        wallHits: finalGameData.wallHits,
        livesLost: finalGameData.livesLost,
        paddleMovements: finalGameData.paddleMovements,
        totalPlayTime: finalGameData.totalPlayTime,
        finalScore: finalGameData.finalScore,
        levelScores: finalGameData.levelScores,
        levelCompletionTimes: finalGameData.levelCompletionTimes,
        // New metrics
        consecutiveErrors: finalGameData.consecutiveErrors,
        maxConsecutiveErrors: finalGameData.maxConsecutiveErrors,
        totalMistakes: finalGameData.totalMistakes,
        successfulRecoveries: finalGameData.successfulRecoveries,
        failedRecoveries: finalGameData.failedRecoveries,
        movementPatterns: finalGameData.movementPatterns,
        errorPatterns: finalGameData.errorPatterns,
        timeBetweenMistakes: finalGameData.timeBetweenMistakes,
      };

      // Debug logging for score calculations
      console.log('[BounceBack][SCORES] Game metrics for score calculation:', {
        accuracy: gameMetrics.accuracy,
        maxConsecutiveErrors: gameMetrics.maxConsecutiveErrors,
        totalMistakes: gameMetrics.totalMistakes,
        totalPlayTime: gameMetrics.totalPlayTime,
        movementPatterns: gameMetrics.movementPatterns.length,
        errorPatterns: gameMetrics.errorPatterns.length,
        paddleMovements: gameMetrics.paddleMovements,
        successfulRecoveries: gameMetrics.successfulRecoveries,
        failedRecoveries: gameMetrics.failedRecoveries,
        selfReport
      });

      // Additional debugging for extreme values
      console.log('[BounceBack][SCORES] Raw values that might cause issues:', {
        accuracyPercent: gameMetrics.accuracy,
        maxConsecutiveErrorsRaw: gameMetrics.maxConsecutiveErrors,
        totalMistakesRaw: gameMetrics.totalMistakes,
        totalPlayTimeSeconds: gameMetrics.totalPlayTime / 1000,
        movementPatternsCount: gameMetrics.movementPatterns.length,
        errorPatternsCount: gameMetrics.errorPatterns.length,
        paddleMovementsRaw: gameMetrics.paddleMovements
      });

      // Calculate Inattention Score (0-10) - LOWER score = MORE inattention
      const accuracyComponent = (gameMetrics.accuracy / 100) * 4;
      const consistencyComponent = Math.max(0, (1 - gameMetrics.maxConsecutiveErrors / 2)) * 3; // Further reduced threshold
      const focusComponent = Math.max(0, (1 - gameMetrics.totalMistakes / Math.max(1, gameMetrics.totalPlayTime / 15000))) * 3; // Further reduced time threshold
      
      // Ensure inattention score is reasonable (not always 10)
      const inattentionScore = Math.max(0, Math.min(10, 
        accuracyComponent + consistencyComponent + focusComponent
      ));

      console.log('[BounceBack][SCORES] Inattention calculation:', {
        accuracyComponent,
        consistencyComponent,
        focusComponent,
        inattentionScore
      });

      // Calculate Hyperactivity Score (0-10) - HIGHER score = MORE hyperactivity
      const movementFrequency = gameMetrics.movementPatterns.length / Math.max(1, gameMetrics.totalPlayTime / 1000);
      const movementComponent = Math.min(1, movementFrequency / 0.5) * 5; // Further reduced threshold
      const erraticComponent = Math.min(1, gameMetrics.errorPatterns.length / Math.max(1, gameMetrics.totalPlayTime / 3000)) * 3; // Further reduced threshold
      const paddleComponent = Math.min(1, gameMetrics.paddleMovements / 50) * 2; // Further reduced threshold
      
      // Fallback: if no movement patterns tracked, use paddle movements as proxy
      const hyperactivityScore = gameMetrics.movementPatterns.length === 0 
        ? Math.min(10, (gameMetrics.paddleMovements / 20) * 2) // Use paddle movements as hyperactivity indicator
        : Math.max(0, Math.min(10, movementComponent + erraticComponent + paddleComponent));

      console.log('[BounceBack][SCORES] Hyperactivity calculation:', {
        movementFrequency,
        movementComponent,
        erraticComponent,
        paddleComponent,
        hyperactivityScore
      });

      // Calculate Impulsivity Score (0-10) - HIGHER score = MORE impulsivity
      const errorComponent = Math.min(1, gameMetrics.totalMistakes / 5) * 4; // Reduced threshold
      const recoveryComponent = Math.min(1, gameMetrics.failedRecoveries / Math.max(1, gameMetrics.totalMistakes)) * 3;
      const selfReportComponent = (selfReport.impulsivity_1 ? (selfReport.impulsivity_1 - 1) / 4 * 3 : 0);
      
      const impulsivityScore = Math.max(0, Math.min(10,
        errorComponent + recoveryComponent + selfReportComponent
      ));

      console.log('[BounceBack][SCORES] Impulsivity calculation:', {
        errorComponent,
        recoveryComponent,
        selfReportComponent,
        impulsivityScore
      });

      // Calculate Executive Function Score (0-10) - HIGHER score = BETTER executive function
      const planningComponent = Math.min(1, gameMetrics.successfulRecoveries / Math.max(1, gameMetrics.totalMistakes)) * 4;
      const execAccuracyComponent = (gameMetrics.accuracy / 100) * 3;
      const execSelfReportComponent = (selfReport.focus_1 ? (selfReport.focus_1 - 1) / 4 * 3 : 0);
      
      // Ensure executive function score is reasonable (not always 10)
      const executiveFunctionScore = Math.max(0, Math.min(10,
        planningComponent + execAccuracyComponent + execSelfReportComponent
      ));

      console.log('[BounceBack][SCORES] Executive Function calculation:', {
        planningComponent,
        execAccuracyComponent,
        execSelfReportComponent,
        executiveFunctionScore
      });

      // Calculate composite ADHD score
      const adhd_composite = Math.max(0, Math.min(10,
        inattentionScore * 0.35 +
        hyperactivityScore * 0.25 +
        impulsivityScore * 0.25 +
        executiveFunctionScore * 0.15
      ));

      const scores = {
        inattention: inattentionScore,
        hyperactivity: hyperactivityScore,
        impulsivity: impulsivityScore,
        executive_function: executiveFunctionScore,
        adhd_composite
      };

      console.log('[BounceBack][FIREBASE] Calculated scores:', scores);

      // Save scores to Firebase
      const firebaseData = { 
        scores,
        gameData: finalGameData,
        timestamp: new Date().toISOString()
      };
      console.log('[BounceBack][FIREBASE] Saving data to Firebase:', firebaseData);
      console.log('[BounceBack][FIREBASE] Scores structure:', scores);
      console.log('[BounceBack][FIREBASE] GameData structure:', finalGameData);
      
      await setDoc(doc(db, 'users', userId, 'games', 'BounceBack'), firebaseData, { merge: true });

      console.log('[BounceBack][FIREBASE] Successfully saved scores to Firebase');

      // Mark game as completed in gameProgress
      try {
        await setDoc(doc(db, 'gameProgress', userId), { game3Completed: true }, { merge: true });
        console.log('[BounceBack][FIREBASE] Set game3Completed: true in gameProgress for user', userId);
      } catch (err) {
        console.error('[BounceBack][FIREBASE] Failed to set game3Completed in gameProgress:', err);
      }

      // Save self-report responses
      if (Object.keys(selfReport).length > 0) {
        try {
          await setDoc(doc(db, 'users', userId, 'games', 'BounceBack'), { 
            selfReport 
          }, { merge: true });
          console.log('[BounceBack][FIREBASE] Saved self-report responses to Firebase');
        } catch (err) {
          console.error('[BounceBack][FIREBASE] Failed to save self-report responses:', err);
        }
      }

    } catch (error) {
      console.error('[BounceBack][FIREBASE] Error saving game data:', error);
      if (onError) {
        onError(`Failed to save game data: ${error}`);
      }
    }
  }, [userId, onError]);

  // Handle transition continue
  const handleTransitionContinue = useCallback(() => {
    setShowLevelTransition(false);
    
    if (transitionData?.type === 'level-complete') {
      if (transitionData.level === 3) {
        // All levels completed, show questions
        setAllLevelsCompleted(true);
        setShowQuestions(true);
        setGameData(prev => ({ 
          ...prev, 
          endTime: Date.now(),
          finalScore: score + (lives * 50),
          gameCompleted: true
        }));
      } else {
        // Move to next level
        const nextLevel = (transitionData.level || 0) + 1;
        setCurrentLevel(nextLevel);
        
        // Reset for next level
        const nextLevelData = LEVELS[nextLevel - 1];
        setBall(createInitialBall(nextLevelData.ballSpeed));
        setBricks(createInitialBricks(nextLevelData.brickRows, nextLevelData));
        setGameStarted(false);
        setLives(3); // Reset lives to 3 for new level
        setLevelStartLives(3); // Reset level start lives to 3 for new level
        setLevelCompleted(false); // Reset level completion flag for new level
        // DON'T reset score - keep it cumulative across levels
        
        // Update game data for new level
        setGameData(prev => ({
          ...prev,
          currentLevel: nextLevel,
          totalBricks: nextLevelData.brickRows * 8,
          ballSpeed: nextLevelData.ballSpeed,
        }));
        
        // Set level start time and score AFTER saving the previous level data
        setLevelStartTime(Date.now());
        setLevelStartScore(score); // Track the current score as the start score for next level
      }
    } else if (transitionData?.type === 'game-over') {
      // Game over, show questions
      setAllLevelsCompleted(true);
      setShowQuestions(true);
      setGameData(prev => ({ 
        ...prev, 
        endTime: Date.now(),
        finalScore: score,
        gameCompleted: true
      }));
    }
  }, [transitionData, score, lives]);

  // Advance to next level
  const advanceLevel = useCallback(() => {
    // Handle level 3 completion differently
    if (currentLevel >= 3) {
      console.log('[BounceBack] Level 3 completed - preparing to show questions');
      
      // Calculate the score for THIS level only (current score minus score at start of level)
      const levelScore = score - levelStartScore;
      const levelTime = Date.now() - levelStartTime;
      
      // Calculate bricks destroyed for this level
      const levelTotalBricks = gameData.totalBricks;
      const levelBricksDestroyed = levelTotalBricks - bricks.filter(brick => brick.status === 1).length;
      
      // Calculate lives lost for this level
      const levelLivesLost = Math.max(0, levelStartLives - lives);
      
      console.log('[BounceBack] Level 3 completion data:', {
        levelScore,
        levelTime,
        levelBricksDestroyed,
        levelLivesLost,
        levelTotalBricks
      });
      
      // Save level 3 data
      setGameData(prev => {
        const newLevelScores = [...prev.levelScores, levelScore];
        const newLevelTimes = [...prev.levelCompletionTimes, levelTime];
        const newLevelBricksDestroyed = [...(prev.levelBricksDestroyed || []), levelBricksDestroyed];
        const newLevelLivesLost = [...(prev.levelLivesLost || []), levelLivesLost];
        const newLevelTotalBricks = [...(prev.levelTotalBricks || []), levelTotalBricks];
        
        return {
          ...prev,
          levelScores: newLevelScores,
          levelCompletionTimes: newLevelTimes,
          levelBricksDestroyed: newLevelBricksDestroyed,
          levelLivesLost: newLevelLivesLost,
          levelTotalBricks: newLevelTotalBricks,
        };
      });
      
      // Show level transition screen for level 3 completion
      setTransitionData({
        type: 'level-complete',
        level: currentLevel,
        score: levelScore,
        time: levelTime,
        bricksDestroyed: levelBricksDestroyed,
        totalBricks: gameData.totalBricks,
        livesLost: levelLivesLost
      });
      setShowLevelTransition(true);
      return;
    }
    
    // Calculate the score for THIS level only (current score minus score at start of level)
    const levelScore = score - levelStartScore;
    const levelTime = Date.now() - levelStartTime;
    
    console.log('[BounceBack] Time calculation debug:', {
      currentTime: Date.now(),
      levelStartTime,
      calculatedLevelTime: levelTime,
      levelTimeInSeconds: (levelTime / 1000).toFixed(2)
    });
    
    // Calculate bricks destroyed for this level
    const levelTotalBricks = gameData.totalBricks; // This is the correct total for this level
    const levelBricksDestroyed = levelTotalBricks - bricks.filter(brick => brick.status === 1).length;
    
    // Calculate lives lost for this level (started with levelStartLives lives, current lives = levelStartLives - lives lost)
    const levelLivesLost = Math.max(0, levelStartLives - lives);
    console.log('[BounceBack] Lives lost calculation:', {
      levelStartLives,
      currentLives: lives,
      calculatedLivesLost: levelLivesLost
    });
    
    console.log('[BounceBack] Advancing to next level:', {
      currentLevel,
      levelScore,
      levelTime,
      currentScore: score,
      previousLevelScores: gameData.levelScores,
      totalPreviousScore: gameData.levelScores.reduce((sum, s) => sum + s, 0),
      levelStartTime,
      levelBricksDestroyed,
      levelLivesLost,
      totalBricksInLevel: gameData.totalBricks
    });
    
    setGameData(prev => {
      const newLevelScores = [...prev.levelScores, levelScore];
      const newLevelTimes = [...prev.levelCompletionTimes, levelTime];
      const newLevelBricksDestroyed = [...(prev.levelBricksDestroyed || []), levelBricksDestroyed];
      const newLevelLivesLost = [...(prev.levelLivesLost || []), levelLivesLost];
      const newLevelTotalBricks = [...(prev.levelTotalBricks || []), levelTotalBricks];
      
      console.log('[BounceBack] Updated level data:', {
        levelScores: newLevelScores,
        levelTimes: newLevelTimes,
        levelBricksDestroyed: newLevelBricksDestroyed,
        levelLivesLost: newLevelLivesLost,
        levelScoresValues: newLevelScores,
        levelTimesValues: newLevelTimes.map(time => `${(time/1000).toFixed(1)}s`)
      });
      
      return {
        ...prev,
        levelScores: newLevelScores,
        levelCompletionTimes: newLevelTimes,
        levelBricksDestroyed: newLevelBricksDestroyed,
        levelLivesLost: newLevelLivesLost,
        levelTotalBricks: newLevelTotalBricks,
      };
    });
    
    // Show level transition screen
    setTransitionData({
      type: 'level-complete',
      level: currentLevel,
      score: levelScore,
      time: levelTime,
      bricksDestroyed: levelBricksDestroyed,
      totalBricks: gameData.totalBricks,
      livesLost: levelLivesLost
    });
    setShowLevelTransition(true);
    
    // Don't advance to next level if this is the final level (Level 3)
    // The transition screen will handle moving to questions
  }, [currentLevel, score, levelStartTime]);

  // Reset game
  const resetGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevelStartLives(3);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(false);
    setCurrentLevel(1);
    setLevelStartTime(Date.now());
    setLevelStartScore(0);
    setShowQuestions(false);
    setCurrentQuestionIndex(0);
    setQuestionResponses({});
    setQuestionsCompleted(false);
    setAllLevelsCompleted(false);
    setLevelCompleted(false);
    setShowLevelTransition(false);
    
    const firstLevel = LEVELS[0];
    setBall(createInitialBall(firstLevel.ballSpeed));
    setBricks(createInitialBricks(firstLevel.brickRows, firstLevel));
    
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
      // New metrics for better ADHD assessment
      consecutiveErrors: 0,
      maxConsecutiveErrors: 0,
      recoveryTimeAfterMistake: 0,
      averageRecoveryTime: 0,
      paddlePositionAccuracy: 0,
      ballSpeedConsistency: 0,
      movementPatterns: [],
      errorPatterns: [],
      timeBetweenMistakes: [],
      lastMistakeTime: 0,
      totalMistakes: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      ballSpeedHistory: [],
    });
  }, []);

  // Check for level completion
  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon && !showQuestions && !showLevelTransition && !levelCompleted) {
      const remainingBricks = bricks.filter(brick => brick.status === 1).length;
      console.log('[BounceBack] Level completion check:', {
        gameStarted,
        gameOver,
        gameWon,
        showQuestions,
        showLevelTransition,
        levelCompleted,
        remainingBricks,
        currentLevel,
        totalBricks: bricks.length,
        allBricksStatus: bricks.map(brick => ({ status: brick.status, x: brick.x, y: brick.y }))
      });
      
      if (remainingBricks === 0) {
        console.log('[BounceBack] 🎉 Level completed! Calling advanceLevel()');
        console.log('[BounceBack] All bricks destroyed - current level:', currentLevel);
        setLevelCompleted(true);
        advanceLevel();
      } else {
        console.log('[BounceBack] Level not completed yet - remaining bricks:', remainingBricks);
      }
    } else if (levelCompleted) {
      console.log('[BounceBack] Level already completed, skipping completion check');
    }
  }, [bricks, gameStarted, gameOver, gameWon, showQuestions, showLevelTransition, levelCompleted, advanceLevel, currentLevel]);

  // Power-up cleanup effect
  useEffect(() => {
    const now = Date.now();
    const expiredPowerUps = Object.entries(activePowerUps).filter(([_, powerUp]) => powerUp.endTime <= now);
    
    if (expiredPowerUps.length > 0) {
      setActivePowerUps(prev => {
        const newPowerUps = { ...prev };
        expiredPowerUps.forEach(([type, _]) => {
          delete newPowerUps[type];
          
          // Reset power-up effects
          switch (type) {
            case 'wider_paddle':
              setPaddleWidthMultiplier(1);
              break;
            case 'slower_ball':
              setBallSpeedMultiplier(1);
              break;
          }
        });
        return newPowerUps;
      });
    }
  }, [activePowerUps]);

  // Ball follows paddle when it has no velocity
  useEffect(() => {
    if (ball.dx === 0 && ball.dy === 0 && !gameOver && !gameWon && !showQuestions) {
      const currentPaddleWidth = getPaddleWidth(currentLevel);
      const newBallX = paddleX + currentPaddleWidth / 2;
      const newBallY = CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS;
      
      setBall(prev => ({
        ...prev,
        x: newBallX,
        y: newBallY,
        dx: 0,
        dy: 0
      }));
    }
  }, [paddleX, currentLevel, gameOver, gameWon, showQuestions, ball.dx, ball.dy]);

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
          
          // Handle brick destruction and health reduction
          if (result.hitBrickIndex !== null) {
            setBricks(prev => {
              const newBricks = [...prev];
              const hitBrick = newBricks[result.hitBrickIndex!];
              
                             if (result.bricksDestroyed > 0) {
                 // Brick is destroyed
                 hitBrick.status = 0;
                 
                 // Calculate score based on brick type only (no luck-based bonuses)
                 let baseScore = 10;
                 
                 // Points based on brick type (skill-based, not luck-based)
                 if (hitBrick.brickType === 'indestructible') {
                   baseScore = 30; // Boss brick gives 30 points
                 } else if (hitBrick.brickType === 'tough') {
                   baseScore = 15; // Tough brick gives 15 points
                 }
                 
                 const totalScore = baseScore;
                 
                 setScore(prev => prev + totalScore);
                 setGameData(prev => ({ 
                   ...prev, 
                   bricksDestroyed: prev.bricksDestroyed + 1
                 }));
                 
                 // Handle power-up activation
                 if (hitBrick.brickType === 'powerup' && hitBrick.powerUpType) {
                   const powerUpType = hitBrick.powerUpType;
                   const duration = 10000; // 10 seconds
                   const endTime = Date.now() + duration;
                   
                   setActivePowerUps(prev => ({
                     ...prev,
                     [powerUpType]: { type: powerUpType, endTime }
                   }));
                   
                   // Apply power-up effects
                   switch (powerUpType) {
                     case 'wider_paddle':
                       setPaddleWidthMultiplier(1.5);
                       break;
                     case 'slower_ball':
                       setBallSpeedMultiplier(0.7);
                       break;


                   }
                 }
               } else if (result.brickHealthReduced) {
                 // Brick health reduced but not destroyed
                 setScore(prev => prev + 5); // Give some points for hitting tough bricks
                 setGameData(prev => ({ 
                   ...prev, 
                   bricksDestroyed: prev.bricksDestroyed 
                 }));
               }
              
              return newBricks;
            });
          }

          // Handle paddle hit
          if (result.paddleHit) {
            setGameData(prev => {
              const currentTime = Date.now();
              const timeSinceLastMistake = currentTime - prev.lastMistakeTime;
              
              // Track successful recovery if this hit happened after a mistake
              let successfulRecoveries = prev.successfulRecoveries;
              let failedRecoveries = prev.failedRecoveries;
              let consecutiveErrors = prev.consecutiveErrors;
              
              if (prev.lastMistakeTime > 0 && timeSinceLastMistake < 5000) { // Recovery within 5 seconds
                successfulRecoveries++;
                consecutiveErrors = 0; // Reset consecutive errors on successful recovery
              }
              
              return { 
                ...prev, 
                paddleHits: prev.paddleHits + 1,
                reactionTimes: [...prev.reactionTimes, currentTime - prev.startTime],
                successfulRecoveries,
                consecutiveErrors,
                movementPatterns: [...prev.movementPatterns, currentTime - prev.startTime]
              };
            });
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
              const currentTime = Date.now();
              
              setGameData(prevData => {
                const timeSinceLastMistake = currentTime - prevData.lastMistakeTime;
                const newConsecutiveErrors = prevData.consecutiveErrors + 1;
                const newMaxConsecutiveErrors = Math.max(prevData.maxConsecutiveErrors, newConsecutiveErrors);
                
                return { 
                  ...prevData, 
                  livesLost: prevData.livesLost + 1,
                  totalMistakes: prevData.totalMistakes + 1,
                  consecutiveErrors: newConsecutiveErrors,
                  maxConsecutiveErrors: newMaxConsecutiveErrors,
                  lastMistakeTime: currentTime,
                  timeBetweenMistakes: [...prevData.timeBetweenMistakes, timeSinceLastMistake],
                  errorPatterns: [...prevData.errorPatterns, currentTime - prevData.startTime]
                };
              });
              
              console.log('[BounceBack] Life lost - updating gameData.livesLost:', {
                previousLivesLost: gameData.livesLost,
                newLivesLost: gameData.livesLost + 1,
                levelStartLives,
                currentLives: newLives
              });
              
              if (newLives <= 0) {
                console.log('[BounceBack] No lives left on level', currentLevel, '- continuing to next level');
                
                // Save the current level data even if it wasn't completed
                const levelScore = score - levelStartScore;
                const levelTime = Date.now() - levelStartTime;
                const levelBricksDestroyed = gameData.totalBricks - bricks.filter(brick => brick.status === 1).length;
                const levelLivesLost = Math.max(0, levelStartLives - newLives);
                console.log('[BounceBack] Lives lost calculation (incomplete level):', {
                  levelStartLives,
                  currentLives: newLives,
                  calculatedLivesLost: levelLivesLost
                });
                const levelTotalBricks = gameData.totalBricks;
                
                console.log('[BounceBack] Saving incomplete level data:', {
                  levelScore,
                  levelTime,
                  levelBricksDestroyed,
                  levelLivesLost,
                  levelTotalBricks
                });
                
                setGameData(prev => {
                  const newLevelScores = [...prev.levelScores, levelScore];
                  const newLevelTimes = [...prev.levelCompletionTimes, levelTime];
                  const newLevelBricksDestroyed = [...(prev.levelBricksDestroyed || []), levelBricksDestroyed];
                  const newLevelLivesLost = [...(prev.levelLivesLost || []), levelLivesLost];
                  const newLevelTotalBricks = [...(prev.levelTotalBricks || []), levelTotalBricks];
                  
                  return {
                    ...prev,
                    levelScores: newLevelScores,
                    levelCompletionTimes: newLevelTimes,
                    levelBricksDestroyed: newLevelBricksDestroyed,
                    levelLivesLost: newLevelLivesLost,
                    levelTotalBricks: newLevelTotalBricks,
                  };
                });
                
                // Check if this is the final level (Level 3)
                if (currentLevel >= 3) {
                  // All levels completed, show questions
                  setAllLevelsCompleted(true);
                  setShowQuestions(true);
                  setGameData(prev => ({ 
                    ...prev, 
                    endTime: Date.now(),
                    finalScore: score,
                    gameCompleted: true
                  }));
                } else {
                  // Continue to next level even with 0 lives
                  const nextLevel = currentLevel + 1;
                  setCurrentLevel(nextLevel);
                  
                  // Reset for next level
                  const nextLevelData = LEVELS[nextLevel - 1];
                  setBall(createInitialBall(nextLevelData.ballSpeed));
                  setBricks(createInitialBricks(nextLevelData.brickRows, nextLevelData));
                  setGameStarted(false);
                  setLives(3); // Reset lives to 3 for new level
                  setLevelStartLives(3); // Reset level start lives to 3 for new level
                  setLevelCompleted(false); // Reset level completion flag for new level
                  
                  // Update game data for new level
                  setGameData(prev => ({
                    ...prev,
                    currentLevel: nextLevel,
                    totalBricks: nextLevelData.brickRows * 8,
                    ballSpeed: nextLevelData.ballSpeed,
                  }));
                  
                  // Set level start time and score
                  setLevelStartTime(Date.now());
                  setLevelStartScore(score);
                }
              } else {
                // Track failed recovery if this happened after a mistake
                setGameData(prevData => {
                  const timeSinceLastMistake = currentTime - prevData.lastMistakeTime;
                  if (prevData.lastMistakeTime > 0 && timeSinceLastMistake < 5000) {
                    return {
                      ...prevData,
                      failedRecoveries: prevData.failedRecoveries + 1
                    };
                  }
                  return prevData;
                });
                
                // Reset ball to follow paddle
                console.log('[BounceBack] Ball out of bounds - resetting ball and setting gameStarted to false');
                setGameStarted(false);
                setBall(prev => ({
                  ...prev,
                  dx: 0,
                  dy: 0
                }));
                outOfBoundsProcessedRef.current = false;
              }
              return newLives;
            });
          }

          return result.newBall;
        });
      } else {
        // Ball follows paddle when game hasn't started - handled by separate effect
        outOfBoundsProcessedRef.current = false; // Reset flag when ball is reset
      }

      // Update game data
      if (gameStarted) {
        setGameData(prev => ({
          ...prev,
          totalPlayTime: Date.now() - prev.startTime,
          accuracy: calculateAccuracy(prev.bricksDestroyed, prev.totalBricks),
          averageReactionTime: calculateAverageReactionTime(prev.reactionTimes),
          ballSpeed: Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy),
          averageRecoveryTime: calculateAverageRecoveryTime(prev.timeBetweenMistakes),
          paddlePositionAccuracy: calculatePaddlePositionAccuracy(prev.paddleHits, prev.paddleHits + prev.livesLost),
          ballSpeedHistory: [...prev.ballSpeedHistory, Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy)],
          ballSpeedConsistency: calculateBallSpeedConsistency([...prev.ballSpeedHistory, Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy)])
        }));
        
        // Debug logging for metrics tracking
        if (gameStarted && gameData.ballSpeedHistory.length % 100 === 0) { // Log every 100th update
          console.log('[BounceBack][METRICS] Current metrics:', {
            ballSpeed: Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy),
            ballSpeedHistoryLength: gameData.ballSpeedHistory.length,
            movementPatternsLength: gameData.movementPatterns.length,
            errorPatternsLength: gameData.errorPatterns.length,
            totalMistakes: gameData.totalMistakes,
            successfulRecoveries: gameData.successfulRecoveries,
            failedRecoveries: gameData.failedRecoveries
          });
        }
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
    
    // Power-ups state
    activePowerUps,
    
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
    
    // Transition state
    showLevelTransition,
    transitionData,
    handleTransitionContinue,
    levelCompleted,
    
    // Game data
    gameData,
    setGameData,
    
    // Actions
    resetGame,
    advanceLevel,
    getPaddleWidth,
    saveGameDataToFirebase,
  };
}; 