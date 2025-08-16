import { useState, useCallback, useRef, useEffect } from 'react';
import { Ball, Brick, GameData } from '../types';
import { LEVELS, CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_WIDTH, PADDLE_Y_OFFSET, BALL_RADIUS } from '../constants';
import { createInitialBricks, createInitialBall, updateBallPosition, calculateAccuracy, calculateAverageReactionTime, calculateAverageRecoveryTime, calculatePaddlePositionAccuracy, calculateBallSpeedConsistency } from '../utils';
import { db } from '../../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

interface UseGameLogicProps {
  userId?: string;
  onGameComplete?: (gameData: GameData) => void;
  onError?: (error: string) => void;
}

export const useGameLogic = ({ userId, onGameComplete, onError }: UseGameLogicProps) => {
  const animationFrameRef = useRef<number | undefined>(undefined);
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
    totalHits: 0,
    livesLost: 0,
    finalScore: 0,
    gameCompleted: false,
    reactionTimes: [],
    paddleMovements: 0,
    ballSpeed: LEVELS[0].ballSpeed,
    currentLevel: 1,
    levelScores: [],
    levelCompletionTimes: [],
    levelBricksDestroyed: [],
    levelLivesLost: [],
    levelTotalBricks: [],
    levelTotalHits: [],
    selfReport: {},
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
          
          // Save initial game state to Firebase
          if (userId) {
            setDoc(doc(db, 'users', userId, 'games', 'BounceBack'), {
              gameStarted: true,
              startTime: new Date().toISOString(),
              currentLevel: currentLevel,
              timestamp: new Date().toISOString()
            }, { merge: true }).then(() => {
              console.log('[BounceBack][FIREBASE] Saved game start data to Firebase');
            }).catch(err => {
              console.error('[BounceBack][FIREBASE] Failed to save game start data:', err);
            });
          }
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
      
      // Only calculate ADHD scores if self-report data is available
      const selfReport = finalGameData.selfReport;
      const hasSelfReport = selfReport && Object.keys(selfReport).length > 0;
      
      if (!hasSelfReport) {
        console.log('[BounceBack][FIREBASE] No self-report data available, skipping ADHD score calculation');
        
        // Save basic game data without scores
        const firebaseData = { 
          gameData: finalGameData,
          timestamp: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', userId, 'games', 'BounceBack'), firebaseData, { merge: true });
        console.log('[BounceBack][FIREBASE] Basic game data saved (no scores calculated yet)');
        return;
      }
      
      console.log('[BounceBack][FIREBASE] Self-report data available, calculating ADHD scores');
      console.log('[BounceBack][FIREBASE] Self-report data structure:', {
        selfReportKeys: Object.keys(selfReport),
        selfReportValues: selfReport,
        q1_focus_difficulty: selfReport.q1_focus_difficulty,
        q2_impulsive_movements: selfReport.q2_impulsive_movements,
        q3_frustration_level: selfReport.q3_frustration_level,
        q4_planning_ability: selfReport.q4_planning_ability,
        q5_persistence_motivation: selfReport.q5_persistence_motivation
      });
      
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

      

      // Calculate Inattention Score (0-10) - HIGHER score = MORE inattention
      // Convert from "good attention = high score" to "poor attention = high score"
      const accuracyComponent = (1 - gameMetrics.accuracy / 100) * 2; // Reduced from 3 to 2 to make room for self-report
      const consistencyComponent = Math.min(1, gameMetrics.maxConsecutiveErrors / 2) * 3; // Reduced from 4 to 3
      const focusComponent = Math.min(1, gameMetrics.totalMistakes / Math.max(1, gameMetrics.totalPlayTime / 3000)) * 2; // Reduced from 3 to 2
      
      // Add self-report component for inattention (30% weight)
      const inattentionSelfReportComponent = selfReport.q1_focus_difficulty ? 
        (selfReport.q1_focus_difficulty - 1) / 4 * 3 : 0; // 30% weight (3 points)
      
      // Add bonus for high accuracy but poor consistency (indicates inattention)
      const inattentionBonus = gameMetrics.maxConsecutiveErrors > 1 ? 2 : 0;
      
      // Calculate inattention score: higher = more inattention
      let inattentionScore = Math.max(0, Math.min(10, 
        accuracyComponent + consistencyComponent + focusComponent + inattentionSelfReportComponent + inattentionBonus
      ));
      
      // If accuracy is very high but there are mistakes, this indicates inattention
      if (gameMetrics.accuracy > 80 && gameMetrics.totalMistakes > 0) {
        inattentionScore = Math.min(10, inattentionScore + 2);
      }
      
      // If consecutive errors are high, this definitely indicates inattention
      if (gameMetrics.maxConsecutiveErrors >= 2) {
        inattentionScore = Math.min(10, inattentionScore + 3);
      }
      
      // Final check: ensure minimum score if there are significant issues
      if (gameMetrics.totalMistakes > 0 && inattentionScore < 2) {
        inattentionScore = Math.max(2, inattentionScore);
      }



      // Calculate Hyperactivity Score (0-10) - HIGHER score = MORE hyperactivity
      const movementFrequency = gameMetrics.movementPatterns.length / Math.max(1, gameMetrics.totalPlayTime / 1000);
      const movementComponent = Math.min(1, movementFrequency / 0.5) * 4; // Reduced from 5 to 4 to make room for self-report
      const erraticComponent = Math.min(1, gameMetrics.errorPatterns.length / Math.max(1, gameMetrics.totalPlayTime / 3000)) * 2; // Reduced from 3 to 2
      const paddleComponent = Math.min(1, gameMetrics.paddleMovements / 50) * 1; // Reduced from 2 to 1
      
      // Add self-report component for hyperactivity (30% weight)
      const hyperactivitySelfReportComponent = selfReport.q3_frustration_level ? 
        (selfReport.q3_frustration_level - 1) / 4 * 3 : 0; // 30% weight (3 points)
      
      // Fallback: if no movement patterns tracked, use paddle movements as proxy
      let hyperactivityScore = gameMetrics.movementPatterns.length === 0 
        ? Math.min(10, (gameMetrics.paddleMovements / 20) * 2 + hyperactivitySelfReportComponent) // Include self-report in fallback
        : Math.max(0, Math.min(10, movementComponent + erraticComponent + paddleComponent + hyperactivitySelfReportComponent));



      // Calculate Impulsivity Score (0-10) - HIGHER score = MORE impulsivity
      const errorComponent = Math.min(1, gameMetrics.totalMistakes / 5) * 4; // Reduced threshold
      const recoveryComponent = Math.min(1, gameMetrics.failedRecoveries / Math.max(1, gameMetrics.totalMistakes)) * 3;
      const selfReportComponent = (selfReport.q2_impulsive_movements ? (selfReport.q2_impulsive_movements - 1) / 4 * 3 : 0);
      
      let impulsivityScore = Math.max(0, Math.min(10,
        errorComponent + recoveryComponent + selfReportComponent
      ));



      // Calculate Executive Function Score (0-10) - HIGHER score = WORSE executive function
      // Convert from "good executive function = high score" to "poor executive function = high score"
      const planningComponent = (1 - Math.min(1, gameMetrics.successfulRecoveries / Math.max(1, gameMetrics.totalMistakes))) * 4; // Higher score for poor planning
      const execAccuracyComponent = (1 - gameMetrics.accuracy / 100) * 3; // Higher score for lower accuracy
      const execSelfReportComponent = selfReport.q4_planning_ability ? (5 - selfReport.q4_planning_ability) / 4 * 3 : 0; // Higher score for lower self-report
      
      // Add bonus for poor planning (failed recoveries)
      const planningBonus = gameMetrics.failedRecoveries > 0 ? 2 : 0;
      
      // Calculate executive function score: higher = worse executive function
      let executiveFunctionScore = Math.max(0, Math.min(10,
        planningComponent + execAccuracyComponent + execSelfReportComponent + planningBonus
      ));
      
      // If there are failed recoveries, this indicates poor executive function
      if (gameMetrics.failedRecoveries > 0) {
        executiveFunctionScore = Math.min(10, executiveFunctionScore + 2);
      }
      
      // If accuracy is high but recovery rate is low, this indicates poor planning
      if (gameMetrics.accuracy > 70 && gameMetrics.successfulRecoveries < gameMetrics.totalMistakes * 0.5) {
        executiveFunctionScore = Math.min(10, executiveFunctionScore + 1);
      }
      
      // Final check: ensure minimum score if there are significant issues
      if (gameMetrics.failedRecoveries > 0 && executiveFunctionScore < 2) {
        executiveFunctionScore = Math.max(2, executiveFunctionScore);
      }



      // Add persistence/motivation component from self-report (affects all domains)
      const persistenceComponent = selfReport.q5_persistence_motivation ? 
        (5 - selfReport.q5_persistence_motivation) / 4 * 2 : 0; // Higher score for lower motivation
      
      // Adjust scores based on persistence (lower motivation = higher ADHD indicators)
      if (persistenceComponent > 0) {
        inattentionScore = Math.min(10, inattentionScore + persistenceComponent * 0.5);
        impulsivityScore = Math.min(10, impulsivityScore + persistenceComponent * 0.3);
        executiveFunctionScore = Math.min(10, executiveFunctionScore + persistenceComponent * 0.2);
      }
      

      
      // Calculate composite ADHD score with equal weights (25% each) for consistency
      const adhd_composite = Math.max(0, Math.min(10,
        (inattentionScore + hyperactivityScore + impulsivityScore + executiveFunctionScore) / 4
      ));
      


      const scores = {
        inattention: inattentionScore,
        hyperactivity: hyperactivityScore,
        impulsivity: impulsivityScore,
        executive_function: executiveFunctionScore,
        adhd_composite
      };

      // Save scores to Firebase
      const firebaseData = { 
        scores,
        gameData: finalGameData,
        timestamp: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', userId, 'games', 'BounceBack'), firebaseData, { merge: true });

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
        // All levels completed - call onGameComplete instead of showing questions
        setAllLevelsCompleted(true);
        setGameData(prev => ({ 
          ...prev, 
          endTime: Date.now(),
          finalScore: score + (lives * 50),
          gameCompleted: true
        }));
        
        // Call the completion callback to let GameFlow handle questions
        if (onGameComplete) {
          const finalGameData = {
            ...gameData,
            gameId: 'bounce-back', // Add the gameId that AssessmentPage expects
            endTime: Date.now(),
            finalScore: score + (lives * 50),
            gameCompleted: true
          };
          onGameComplete(finalGameData);
        }
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
          totalBricks: prev.totalBricks + (nextLevelData.brickRows * 8), // Accumulate total bricks across levels
          ballSpeed: nextLevelData.ballSpeed,
        }));
        
        // Set level start time and score AFTER saving the previous level data
        setLevelStartTime(Date.now());
        setLevelStartScore(score); // Track the current score as the start score for next level
      }
    } else if (transitionData?.type === 'game-over') {
      // Game over - call onGameComplete instead of showing questions
      setAllLevelsCompleted(true);
      setGameData(prev => ({ 
        ...prev, 
        endTime: Date.now(),
        finalScore: score,
        gameCompleted: true
      }));
      
      // Call the completion callback to let GameFlow handle questions
      if (onGameComplete) {
        const finalGameData = {
          ...gameData,
          gameId: 'bounce-back', // Add the gameId that AssessmentPage expects
          endTime: Date.now(),
          finalScore: score,
          gameCompleted: true
        };
        onGameComplete(finalGameData);
      }
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
      
      // Calculate total hits for this level (we need to track this from level start)
      const currentLevelHits = (() => {
        try {
          const previousHits = gameData.levelTotalHits?.reduce((sum, hits) => sum + hits, 0) || 0;
          const result = Math.max(0, gameData.totalHits - previousHits);
          console.log('[BounceBack] currentLevelHits calculation (scope 1):', { gameDataTotalHits: gameData.totalHits, previousHits, result });
          return result;
        } catch (error) {
          console.error('[BounceBack] Error calculating currentLevelHits (scope 1):', error);
          return 0;
        }
      })();
      
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
        const newLevelTotalHits = [...(prev.levelTotalHits || []), typeof currentLevelHits === 'number' ? currentLevelHits : 0];
        
        const updatedGameData = {
          ...prev,
          levelScores: newLevelScores,
          levelCompletionTimes: newLevelTimes,
          levelBricksDestroyed: newLevelBricksDestroyed,
          levelLivesLost: newLevelLivesLost,
          levelTotalBricks: newLevelTotalBricks,
          levelTotalHits: newLevelTotalHits,
        };

        // Save level data to Firebase immediately
        if (userId) {
          setDoc(doc(db, 'users', userId, 'games', 'BounceBack'), {
            levelData: {
              level: currentLevel,
              score: levelScore,
              time: levelTime,
              bricksDestroyed: levelBricksDestroyed,
              livesLost: levelLivesLost,
              totalHits: typeof currentLevelHits === 'number' ? currentLevelHits : 0,
              timestamp: new Date().toISOString()
            },
            gameData: updatedGameData
          }, { merge: true }).then(() => {
            console.log('[BounceBack][FIREBASE] Saved level', currentLevel, 'data to Firebase');
          }).catch(err => {
            console.error('[BounceBack][FIREBASE] Failed to save level data:', err);
          });
        }

        return updatedGameData;
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
    
          // Calculate bricks destroyed for this level
      const levelTotalBricks = gameData.totalBricks; // This is the correct total for this level
      const levelBricksDestroyed = levelTotalBricks - bricks.filter(brick => brick.status === 1).length;
      
      // Calculate total hits for this level (we need to track this from level start)
      const currentLevelHits = (() => {
        try {
          const previousHits = gameData.levelTotalHits?.reduce((sum, hits) => sum + hits, 0) || 0;
          const result = Math.max(0, gameData.totalHits - previousHits);
          return result;
        } catch (error) {
          console.error('[BounceBack] Error calculating currentLevelHits (scope 2):', error);
          return 0;
        }
      })();
      
      // Calculate lives lost for this level (started with levelStartLives lives, current lives = levelStartLives - lives lost)
      const levelLivesLost = Math.max(0, levelStartLives - lives);
    
    setGameData(prev => {
      const newLevelScores = [...prev.levelScores, levelScore];
      const newLevelTimes = [...prev.levelCompletionTimes, levelTime];
      const newLevelBricksDestroyed = [...(prev.levelBricksDestroyed || []), levelBricksDestroyed];
      const newLevelLivesLost = [...(prev.levelLivesLost || []), levelLivesLost];
      const newLevelTotalBricks = [...(prev.levelTotalBricks || []), levelTotalBricks];
      const newLevelTotalHits = [...(prev.levelTotalHits || []), typeof currentLevelHits === 'number' ? currentLevelHits : 0];
      
      console.log('[BounceBack] Updated level data:', {
        levelScores: newLevelScores,
        levelTimes: newLevelTimes,
        levelBricksDestroyed: newLevelBricksDestroyed,
        levelLivesLost: newLevelLivesLost,
        levelScoresValues: newLevelScores,
        levelTimesValues: newLevelTimes.map(time => `${(time/1000).toFixed(1)}s`)
      });
      
      const updatedGameData = {
        ...prev,
        levelScores: newLevelScores,
        levelCompletionTimes: newLevelTimes,
        levelBricksDestroyed: newLevelBricksDestroyed,
        levelLivesLost: newLevelLivesLost,
        levelTotalBricks: newLevelTotalBricks,
        levelTotalHits: newLevelTotalHits,
      };

      // Save level data to Firebase immediately
      if (userId) {
        setDoc(doc(db, 'users', userId, 'games', 'BounceBack'), {
          levelData: {
            level: currentLevel,
            score: levelScore,
            time: levelTime,
            bricksDestroyed: levelBricksDestroyed,
            livesLost: levelLivesLost,
            totalHits: typeof currentLevelHits === 'number' ? currentLevelHits : 0,
            timestamp: new Date().toISOString()
          },
          gameData: updatedGameData
        }, { merge: true }).then(() => {
          console.log('[BounceBack][FIREBASE] Saved level', currentLevel, 'data to Firebase');
        }).catch(err => {
          console.error('[BounceBack][FIREBASE] Failed to save level data:', err);
        });
      }

      return updatedGameData;
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
      totalHits: 0,
      livesLost: 0,
      finalScore: 0,
      gameCompleted: false,
      reactionTimes: [],
      paddleMovements: 0,
      ballSpeed: firstLevel.ballSpeed,
      currentLevel: 1,
      levelScores: [],
      levelCompletionTimes: [],
      levelBricksDestroyed: [],
      levelLivesLost: [],
      levelTotalBricks: [],
      levelTotalHits: [],
      selfReport: {},
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
      
      if (remainingBricks === 0) {
        setLevelCompleted(true);
        advanceLevel();
      }
    } else if (levelCompleted) {
      // Level already completed, skipping completion check
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
                   bricksDestroyed: prev.bricksDestroyed + 1,
                   totalHits: prev.totalHits + 1
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
                   bricksDestroyed: prev.bricksDestroyed,
                   totalHits: prev.totalHits + 1
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
          
          if (result.outOfBounds) {
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
                                  // Save the current level data even if it wasn't completed
                  const levelScore = score - levelStartScore;
                  const levelTime = Date.now() - levelStartTime;
                  const levelBricksDestroyed = gameData.totalBricks - bricks.filter(brick => brick.status === 1).length;
                  const levelLivesLost = Math.max(0, levelStartLives - newLives);
                  const levelTotalHits = gameData.totalHits - (gameData.levelTotalHits?.reduce((sum, hits) => sum + hits, 0) || 0);
                  const levelTotalBricks = gameData.totalBricks;
                
                setGameData(prev => {
                  const newLevelScores = [...prev.levelScores, levelScore];
                  const newLevelTimes = [...prev.levelCompletionTimes, levelTime];
                  const newLevelBricksDestroyed = [...(prev.levelBricksDestroyed || []), levelBricksDestroyed];
                  const newLevelLivesLost = [...(prev.levelLivesLost || []), levelLivesLost];
                  const newLevelTotalBricks = [...(prev.levelTotalBricks || []), levelTotalBricks];
                  const newLevelTotalHits = [...(prev.levelTotalHits || []), levelTotalHits];
                  
                  const updatedGameData = {
                    ...prev,
                    levelScores: newLevelScores,
                    levelCompletionTimes: newLevelTimes,
                    levelBricksDestroyed: newLevelBricksDestroyed,
                    levelLivesLost: newLevelLivesLost,
                    levelTotalBricks: newLevelTotalBricks,
                    levelTotalHits: newLevelTotalHits,
                  };

                  // Save incomplete level data to Firebase immediately
                  if (userId) {
                    setDoc(doc(db, 'users', userId, 'games', 'BounceBack'), {
                      levelData: {
                        level: currentLevel,
                        score: levelScore,
                        time: levelTime,
                        bricksDestroyed: levelBricksDestroyed,
                        livesLost: levelLivesLost,
                        totalHits: levelTotalHits,
                        completed: false,
                        timestamp: new Date().toISOString()
                      },
                      gameData: updatedGameData
                    }, { merge: true }).then(() => {
                      console.log('[BounceBack][FIREBASE] Saved incomplete level', currentLevel, 'data to Firebase');
                    }).catch(err => {
                      console.error('[BounceBack][FIREBASE] Failed to save incomplete level data:', err);
                    });
                  }

                  return updatedGameData;
                });
                
                // Check if this is the final level (Level 3)
                if (currentLevel >= 3) {
                  // All levels completed - call onGameComplete instead of showing questions
                  setAllLevelsCompleted(true);
                  
                  // Create final game data and call completion callback
                  const finalGameData = {
                    ...gameData,
                    gameId: 'bounce-back', // Add the gameId that AssessmentPage expects
                    endTime: Date.now(),
                    finalScore: score,
                    gameCompleted: true
                  };
                  
                  // Call the completion callback to let GameFlow handle questions
                  if (onGameComplete) {
                    onGameComplete(finalGameData);
                  }
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
                    totalBricks: prev.totalBricks + (nextLevelData.brickRows * 8), // Accumulate total bricks across levels
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
                setGameStarted(false);
                
                // Ensure paddleX is within valid bounds before positioning ball
                const currentPaddleWidth = getPaddleWidth(currentLevel);
                const maxPaddleX = CANVAS_WIDTH - currentPaddleWidth;
                const safePaddleX = Math.max(0, Math.min(paddleX, maxPaddleX));
                
                setBall(prev => ({
                  ...prev,
                  x: safePaddleX + currentPaddleWidth / 2, // Center ball on current paddle width
                  y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS, // Position above paddle
                  dx: 0,
                  dy: 0
                }));
                

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