import { useState, useCallback, useRef, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { 
  GameState, 
  FlutterFocusLevel, 
  Obstacle, 
  Alien
} from '../types';
import { 
  LEVELS, 
  LIVES_PER_LEVEL, 
  INVULNERABILITY_DURATION,
  IDLE_THRESHOLD,
  POINTS_PER_OBSTACLE_AVOIDED,
  POINTS_PER_SECOND_SURVIVED
} from '../constants';
import { 
  generateObstacle,
  checkCollision,
  updateObstacles,
  calculateLevelScore,
  calculateADHDScores,
  levelToRoundMetrics,
  getNextObstacleSpawnTime,
  calculateInputEfficiency,
  formatTime
} from '../utils';

export const useGameLogic = (userId?: string) => {
  // Game state refs (for performance, avoid React re-renders during game loop)
  const gameStateRef = useRef<GameState>({
    currentLevel: 1,
    isPlaying: false,
    showInstructions: true,
    showCountdown: false,
    countdownValue: 3,
    gameComplete: false,
    showScores: false,
    showQuestions: false,
    currentQuestionIndex: 0,
    questionAnswers: [],
    showThankYou: false,
    alien: {
      x: 100,
      y: 270,
      width: 40,
      height: 40,
      velocityY: 0,
      isAlive: true,
      lives: LIVES_PER_LEVEL,
      invulnerable: false,
      invulnerabilityTimer: 0
    },
    obstacles: [],
    score: 0,
    levelStartTime: 0,
    gameStartTime: 0,
    lastInputTime: 0,
    inputCount: 0,
    excessInputs: 0,
    idleTime: 0,
    reactionTimes: []
  });

  // React state for UI updates (only update when needed)
  const [gameState, setGameState] = useState<GameState>(gameStateRef.current);

  // Refs for game loop
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const obstacleSpawnTimerRef = useRef<number>(0);
  const levelDataRef = useRef<FlutterFocusLevel[]>([]);
  const currentLevelDataRef = useRef<FlutterFocusLevel | null>(null);

  // Save level progress to Firebase in real-time
  const saveLevelProgressToFirebase = useCallback(async (levelData: FlutterFocusLevel) => {
    if (!userId) return;

    try {
      await setDoc(doc(db, 'users', userId, 'games', 'FlutterFocus', 'levels', `level${levelData.levelNumber}`), {
        levelNumber: levelData.levelNumber,
        levelName: levelData.levelName,
        startTime: levelData.startTime,
        endTime: levelData.endTime,
        duration: levelData.duration,
        livesLost: levelData.livesLost,
        crashes: levelData.crashes,
        score: levelData.score,
        obstaclesAvoided: levelData.obstaclesAvoided,
        obstaclesHit: levelData.obstaclesHit,
        decoyCollisions: levelData.decoyCollisions || 0,
        wrongPathChoices: levelData.wrongPathChoices || 0,
        memoryCueFailures: levelData.memoryCueFailures || 0,
        reactionTimes: levelData.reactionTimes,
        inputCount: levelData.inputCount,
        excessInputs: levelData.excessInputs,
        idleTime: levelData.idleTime,
        levelMetrics: levelData.levelMetrics,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving level progress to Firebase:', error);
    }
  }, [userId]);

  // Initialize level data
  useEffect(() => {
    levelDataRef.current = LEVELS.map(level => ({ ...level }));
    currentLevelDataRef.current = levelDataRef.current[0];
  }, []);

  // Start game loop
  const startGameLoop = useCallback(() => {
    lastTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameStateRef.current.isPlaying) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Debug logging
    if (currentTime % 1000 < deltaTime) { // Log every second
      console.log('Game loop running:', {
        deltaTime: Math.round(deltaTime),
        obstacles: gameStateRef.current.obstacles.length,
        alienY: Math.round(gameStateRef.current.alien.y),
        score: gameStateRef.current.score
      });
    }

    // Update game state
    updateGameState(deltaTime);
    
    // Check for level completion
    checkLevelCompletion();
    
    // Continue game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    console.log('startGame called - transitioning to countdown');
    setGameState(prev => ({
      ...prev,
      showInstructions: false,
      showCountdown: true,
      gameStartTime: Date.now(),
      levelStartTime: Date.now()
    }));

    // Start countdown
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      countdown--;
      console.log('Countdown:', countdown);
      setGameState(prev => ({ ...prev, countdownValue: countdown }));
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        console.log('Countdown finished - starting game');
        setGameState(prev => ({
          ...prev,
          showCountdown: false,
          isPlaying: true
        }));
        startGameLoop();
      }
    }, 1000);
  }, [startGameLoop]);

  // Update alien physics
  const updateAlien = useCallback((alien: Alien, deltaTime: number): Alien => {
    // Apply gravity
    const newVelocityY = alien.velocityY + 0.5 * deltaTime;
    
    // Update position
    const newY = alien.y + newVelocityY;
    
    // Ground collision
    if (newY > 500) {
      return {
        ...alien,
        y: 500,
        velocityY: 0
      };
    }
    
    // Ceiling collision
    if (newY < 0) {
      return {
        ...alien,
        y: 0,
        velocityY: 0
      };
    }
    
    return {
      ...alien,
      y: newY,
      velocityY: newVelocityY
    };
  }, []);

  // Spawn obstacles
  const spawnObstacles = useCallback((prevState: GameState, deltaTime: number): Obstacle[] => {
    obstacleSpawnTimerRef.current += deltaTime;
    
    if (obstacleSpawnTimerRef.current >= getNextObstacleSpawnTime(prevState.currentLevel)) {
      obstacleSpawnTimerRef.current = 0;
      const newObstacle = generateObstacle(prevState.currentLevel, Date.now());
      console.log('Spawning new obstacle:', {
        type: newObstacle.type,
        x: newObstacle.x,
        y: newObstacle.y,
        level: prevState.currentLevel
      });
      return [...prevState.obstacles, newObstacle];
    }
    
    return prevState.obstacles;
  }, []);

  // Check collisions
  const checkCollisions = useCallback((alien: Alien, obstacles: Obstacle[], deltaTime: number): {
    alien: Alien;
    obstacles: Obstacle[];
    score: number;
  } => {
    let newScore = gameStateRef.current.score;
    let newAlien = alien;
    let newObstacles = obstacles;
    
    obstacles.forEach((obstacle, index) => {
      if (checkCollision(alien, obstacle) && !alien.invulnerable) {
        if (obstacle.isDecoy) {
          // Decoy collision - no life loss but score penalty
          newScore = Math.max(0, newScore - 5);
          newObstacles[index] = { ...obstacle, isActive: false };
          
          // Track decoy collisions for Level 2 (impulsivity assessment)
          if (currentLevelDataRef.current && currentLevelDataRef.current.levelNumber === 2) {
            currentLevelDataRef.current.decoyCollisions = 
              (currentLevelDataRef.current.decoyCollisions || 0) + 1;
          }
        } else if (obstacle.type === 'portal') {
          // Portal collision - correct path choice, bonus points
          newScore += 10;
          newObstacles[index] = { ...obstacle, isActive: false };
        } else {
          // Real obstacle collision - lose life
          newAlien = {
            ...alien,
            lives: alien.lives - 1,
            invulnerable: true,
            invulnerabilityTimer: INVULNERABILITY_DURATION
          };
          newObstacles[index] = { ...obstacle, isActive: false };
          
          // Track wrong path choices for Level 3 (executive function assessment)
          if (currentLevelDataRef.current && currentLevelDataRef.current.levelNumber === 3) {
            currentLevelDataRef.current.wrongPathChoices = 
              (currentLevelDataRef.current.wrongPathChoices || 0) + 1;
          }
          
          // Update level data
          if (currentLevelDataRef.current) {
            currentLevelDataRef.current.crashes++;
            currentLevelDataRef.current.livesLost++;
            currentLevelDataRef.current.obstaclesHit++;
          }
        }
      } else if (obstacle.x + obstacle.width < alien.x && obstacle.isActive) {
        // Obstacle successfully avoided
        if (currentLevelDataRef.current) {
          currentLevelDataRef.current.obstaclesAvoided++;
        }
      }
    });
    
    // Remove inactive obstacles
    const filteredObstacles = newObstacles.filter(obstacle => obstacle.isActive);
    
    // Add points for obstacles avoided
    newScore += obstacles.filter(obstacle => 
      obstacle.x + obstacle.width < alien.x && obstacle.isActive
    ).length * POINTS_PER_OBSTACLE_AVOIDED;
    
    // Add survival points based on actual time survived
    const survivalTimeSeconds = deltaTime / 1000;
    newScore += Math.floor(survivalTimeSeconds) * POINTS_PER_SECOND_SURVIVED;
    
    return { alien: newAlien, obstacles: filteredObstacles, score: newScore };
  }, [gameStateRef.current.score]);

  // Update idle time
  const updateIdleTime = useCallback((prevState: GameState, deltaTime: number): number => {
    const timeSinceLastInput = Date.now() - prevState.lastInputTime;
    
    if (timeSinceLastInput > IDLE_THRESHOLD) {
      return prevState.idleTime + deltaTime;
    }
    
    return prevState.idleTime;
  }, []);

  // Track executive function metrics for Level 3
  const trackExecutiveFunctionMetrics = useCallback((deltaTime: number) => {
    if (!currentLevelDataRef.current || currentLevelDataRef.current.levelNumber !== 3) return;
    
    // Track hesitation time (time between obstacle appearance and player response)
    const obstacles = gameStateRef.current.obstacles.filter(obstacle => obstacle.isActive);
    obstacles.forEach(obstacle => {
      if (obstacle.x < 800 && obstacle.x > 700) { // Obstacle just appeared
        const timeSinceAppearance = Date.now() - (obstacle.x - 800) / obstacle.speed;
        if (timeSinceAppearance > 1000) { // More than 1 second hesitation
          currentLevelDataRef.current!.memoryCueFailures = 
            (currentLevelDataRef.current!.memoryCueFailures || 0) + 1;
        }
      }
    });
  }, [gameStateRef.current.obstacles]);

  // Update game state
  const updateGameState = useCallback((deltaTime: number) => {
    // Update alien physics
    const newAlien = updateAlien(gameStateRef.current.alien, deltaTime);
    
    // Spawn new obstacles
    const obstaclesWithSpawns = spawnObstacles(gameStateRef.current, deltaTime);
    
    // Move existing obstacles
    const movedObstacles = updateObstacles(obstaclesWithSpawns, deltaTime);
    
    // Check collisions
    const collisionResult = checkCollisions(newAlien, movedObstacles, deltaTime);
    
    // Update timers
    const newIdleTime = updateIdleTime(gameStateRef.current, deltaTime);
    
    // Track executive function metrics for Level 3
    trackExecutiveFunctionMetrics(deltaTime);
    
    // Update the ref (for game logic)
    gameStateRef.current = {
      ...gameStateRef.current,
      alien: collisionResult.alien,
      obstacles: collisionResult.obstacles,
      idleTime: newIdleTime,
      score: collisionResult.score
    };
    
    // Only update React state occasionally for UI updates (every 100ms)
    if (Date.now() % 100 < deltaTime) {
      setGameState(prev => ({
        ...prev,
        alien: collisionResult.alien,
        obstacles: collisionResult.obstacles,
        idleTime: newIdleTime,
        score: collisionResult.score
      }));
    }
  }, [trackExecutiveFunctionMetrics]);



  // Check level completion
  const checkLevelCompletion = useCallback(() => {
    if (!currentLevelDataRef.current) return;
    
    const levelDuration = currentLevelDataRef.current.duration;
    const currentTime = Date.now() - gameStateRef.current.levelStartTime;
    
    if (currentTime >= levelDuration) {
      completeLevel();
    }
  }, [gameStateRef.current.levelStartTime]);

  // Complete current level
  const completeLevel = useCallback(async () => {
    if (!currentLevelDataRef.current) return;
    
    // Calculate level score
    const levelScore = calculateLevelScore(currentLevelDataRef.current);
    currentLevelDataRef.current.score = levelScore;
    currentLevelDataRef.current.endTime = Date.now();
    
    // Save level progress to Firebase
    await saveLevelProgressToFirebase(currentLevelDataRef.current);
    
    // Check if game is complete
    if (gameStateRef.current.currentLevel >= 3) {
      completeGame();
    } else {
      nextLevel();
    }
  }, [gameStateRef.current.currentLevel, saveLevelProgressToFirebase]);

  // Move to next level
  const nextLevel = useCallback(() => {
    const nextLevelNum = gameStateRef.current.currentLevel + 1;
    const nextLevelData = levelDataRef.current[nextLevelNum - 1];
    
    if (nextLevelData) {
      currentLevelDataRef.current = nextLevelData;
      currentLevelDataRef.current.startTime = Date.now();
      
      setGameState(prev => ({
        ...prev,
        currentLevel: nextLevelNum,
        levelStartTime: Date.now(),
        alien: {
          ...prev.alien,
          lives: LIVES_PER_LEVEL,
          invulnerable: false,
          invulnerabilityTimer: 0
        },
        obstacles: [],
        showCountdown: true,
        countdownValue: 3
      }));
      
      // Start countdown for next level
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        countdown--;
        setGameState(prev => ({ ...prev, countdownValue: countdown }));
        
        if (countdown <= 0) {
          clearInterval(countdownInterval);
          setGameState(prev => ({
            ...prev,
            showCountdown: false,
            isPlaying: true
          }));
        }
      }, 1000);
    }
  }, [gameStateRef.current.currentLevel]);

  // Complete game
  const completeGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      gameComplete: true,
      showScores: true
    }));
    
    // Stop game loop
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  // Handle input
  const handleInput = useCallback(() => {
    if (!gameStateRef.current.isPlaying || gameStateRef.current.alien.invulnerable) return;
    
    const currentTime = Date.now();
    const reactionTime = currentTime - gameStateRef.current.lastInputTime;
    
    // Update both ref and React state
    const newAlien = {
      ...gameStateRef.current.alien,
      velocityY: -12
    };
    
    const newInputCount = gameStateRef.current.inputCount + 1;
    const newExcessInputs = gameStateRef.current.excessInputs + (reactionTime < 100 ? 1 : 0);
    
    // Update the ref immediately for game loop
    gameStateRef.current = {
      ...gameStateRef.current,
      alien: newAlien,
      lastInputTime: currentTime,
      inputCount: newInputCount,
      excessInputs: newExcessInputs
    };
    
    // Update level data
    if (currentLevelDataRef.current) {
      currentLevelDataRef.current.inputCount = newInputCount;
      currentLevelDataRef.current.excessInputs = newExcessInputs;
      currentLevelDataRef.current.reactionTimes.push(reactionTime);
    }
    
    // Update React state for UI
    setGameState(prev => ({
      ...prev,
      alien: newAlien,
      lastInputTime: currentTime,
      inputCount: newInputCount,
      excessInputs: newExcessInputs
    }));
  }, []);

  // Transition from scores to questions
  const showQuestions = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showScores: false,
      showQuestions: true
    }));
  }, []);

  // Handle question answer
  const handleQuestionAnswer = useCallback((answer: number) => {
    setGameState(prev => {
      const newAnswers = [...prev.questionAnswers, answer];
      const nextQuestionIndex = prev.currentQuestionIndex + 1;
      
      if (nextQuestionIndex >= 5) {
        // All questions answered, show thank you
        return {
          ...prev,
          questionAnswers: newAnswers,
          showQuestions: false,
          showThankYou: true
        };
      }
      
      return {
        ...prev,
        questionAnswers: newAnswers,
        currentQuestionIndex: nextQuestionIndex
      };
    });
  }, []);

  // Save game data to Firebase
  const saveGameDataToFirebase = useCallback(async (gameData: any) => {
    if (!userId) {
      console.warn('No userId provided, skipping Firebase save');
      return;
    }

    try {
      // Save main game data
      await setDoc(doc(db, 'users', userId, 'games', 'FlutterFocus'), {
        gameData: {
          startTime: gameData.startTime,
          endTime: gameData.endTime,
          totalPlayTime: gameData.totalPlayTime,
          gameCompleted: gameData.gameCompleted,
          finalScore: gameData.finalScore,
          livesLost: gameData.livesLost,
          totalCrashes: gameData.totalCrashes,
          totalObstaclesAvoided: gameData.totalObstaclesAvoided,
          totalObstaclesHit: gameData.totalObstaclesHit,
          selfReportResponses: gameData.selfReportResponses
        },
        levels: levelDataRef.current.map(level => ({
          levelNumber: level.levelNumber,
          levelName: level.levelName,
          startTime: level.startTime,
          endTime: level.endTime,
          duration: level.duration,
          livesLost: level.livesLost,
          crashes: level.crashes,
          obstaclesAvoided: level.obstaclesAvoided,
          obstaclesHit: level.obstaclesHit,
          decoyCollisions: level.decoyCollisions || 0,
          wrongPathChoices: level.wrongPathChoices || 0,
          memoryCueFailures: level.memoryCueFailures || 0,
          reactionTimes: level.reactionTimes,
          inputCount: level.inputCount,
          excessInputs: level.excessInputs,
          idleTime: level.idleTime,
          levelMetrics: level.levelMetrics
        })),
        adhdScores: gameData.adhdScores,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });

      console.log('FlutterFocus game data saved to Firebase successfully');
    } catch (error) {
      console.error('Error saving FlutterFocus game data to Firebase:', error);
    }
  }, [userId]);

  // Get game data for completion
  const getGameData = useCallback(async () => {
    const endTime = Date.now();
    const totalPlayTime = endTime - gameStateRef.current.gameStartTime;
    
    // Calculate final scores
    const finalScores = levelDataRef.current.map(level => level.score);
    const finalScore = finalScores.reduce((sum, score) => sum + score, 0);
    
    // Calculate ADHD scores
    const adhdScores = calculateADHDScores(levelDataRef.current);
    
    const gameData = {
      startTime: gameStateRef.current.gameStartTime,
      endTime,
      totalPlayTime,
      gameCompleted: true,
      finalScore,
      livesLost: levelDataRef.current.reduce((sum, level) => sum + level.livesLost, 0),
      totalCrashes: levelDataRef.current.reduce((sum, level) => sum + level.crashes, 0),
      totalObstaclesAvoided: levelDataRef.current.reduce((sum, level) => sum + level.obstaclesAvoided, 0),
      totalObstaclesHit: levelDataRef.current.reduce((sum, level) => sum + level.obstaclesHit, 0),
      currentLevel: gameStateRef.current.currentLevel,
      levelsCompleted: levelDataRef.current.filter(level => level.endTime).length,
      levelScores: finalScores,
      levelCompletionTimes: levelDataRef.current.map(level => level.endTime ? level.endTime - level.startTime : 0),
      adhdScores,
      selfReportResponses: gameStateRef.current.questionAnswers.reduce((acc, answer, index) => {
        acc[`q${index + 1}`] = answer;
        return acc;
      }, {} as { [key: string]: number }),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to Firebase
    await saveGameDataToFirebase(gameData);
    
    return gameData;
  }, [gameStateRef.current, saveGameDataToFirebase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return {
    gameState,
    startGame,
    handleInput,
    handleQuestionAnswer,
    showQuestions,
    getGameData
  };
}; 