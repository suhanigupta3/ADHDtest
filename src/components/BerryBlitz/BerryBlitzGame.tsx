import React, { useState, useEffect, useRef, useCallback } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  GRID_SIZE, 
  CELL_SIZE, 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PLAYER_SIZE, 
  FRUIT_SIZE, 
  OBSTACLE_SIZE,
  ROUNDS,
  ROUND_DURATION,
  FRUIT_SPAWN_RATE,
  OBSTACLE_SPAWN_RATE,
  FRUIT_LIFETIME,
  OBSTACLE_LIFETIME,
  MAX_FRUITS_ON_SCREEN,
  OBSTACLE_SPAWN_DELAY
} from './constants';
import { 
  BerryBlitzGameProps, 
  BerryBlitzGameData, 
  BerryBlitzRound, 
  GameState, 
  Player, 
  Fruit, 
  Obstacle 
} from './types';
import { 
  createFruit, 
  createObstacle, 
  moveObstacle, 
  checkCollisions, 
  calculateScore, 
  calculateAccuracy,
  calculateADHDScores,
  getFruitEmoji,
  getFruitColor
} from './utils';
import { QUESTIONS } from './constants';

/**
 * Format seconds into hours:minutes:seconds format
 */
const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

/**
 * BerryBlitzGame - ADHD Assessment Game
 * 
 * Game Flow:
 * 1. Instructions → Round 1 (Lemon Collection)
 * 2. Round 1 Complete → Round 2 (Strawberry Collection) 
 * 3. Round 2 Complete → Round 3 (Orange Collection)
 * 4. Round 3 Complete → Self-Report Questions
 * 5. Questions Complete → Assessment Ends
 * 
 * Each round: 30 seconds, collect target fruits, avoid obstacles
 * Final state: Call onGameComplete with ADHD assessment data
 */
const BerryBlitzGame: React.FC<BerryBlitzGameProps> = ({
  userId,
  onGameComplete,
  onCancel,
  onError,
  width = '100%',
  height = '600px'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const roundStartTimeRef = useRef<number>(0);
  const fruitSpawnTimerRef = useRef<number>(0);
  const gameLoopFunctionRef = useRef<(currentTime: number) => void>();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    score: 0,
    lives: 3,
    gameStarted: false,
    gameOver: false,
    gameWon: false,
    showQuestions: false,
    currentQuestionIndex: 0,
    questionResponses: {},
    rounds: []
  });
  
  // Round transition state
  const [showRoundTransition, setShowRoundTransition] = useState(false);
  const [roundTransitionData, setRoundTransitionData] = useState<{
    roundNumber: number;
    score: number;
    targetFruitsCollected: number;
    obstaclesHit: number;
    timeRemaining: number;
  } | null>(null);
  
  // Player state
  const [player, setPlayer] = useState<Player>({
    x: Math.floor(GRID_SIZE / 2),
    y: GRID_SIZE - 1,
    prevX: Math.floor(GRID_SIZE / 2),
    prevY: GRID_SIZE - 1
  });
  
  // Game objects
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  
  // Round tracking
  const [roundScore, setRoundScore] = useState(0);
  const [targetFruitsCollected, setTargetFruitsCollected] = useState(0);
  const [nonTargetFruitsCollected, setNonTargetFruitsCollected] = useState(0);
  const [obstaclesHit, setObstaclesHit] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [movementPatterns, setMovementPatterns] = useState<number[]>([]);
  
  // UI state
  const [showInstructions, setShowInstructions] = useState(true);
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_DURATION / 1000);
  const [collisionFlash, setCollisionFlash] = useState(false);
  
  // Get current round data
  const currentRoundData = ROUNDS[gameState.currentRound - 1];
  
  // Use refs to avoid recreating game loop callback
  const playerRef = useRef<Player>(player);
  const fruitsRef = useRef<Fruit[]>(fruits);
  const obstaclesRef = useRef<Obstacle[]>(obstacles);
  const currentRoundDataRef = useRef(currentRoundData);
  
  // Update refs when state changes
  useEffect(() => {
    playerRef.current = player;
  }, [player]);
  
  useEffect(() => {
    fruitsRef.current = fruits;
  }, [fruits]);
  
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);
  
  useEffect(() => {
    currentRoundDataRef.current = currentRoundData;
  }, [currentRoundData]);
  
  // End current round
  const endRound = useCallback((reason: 'time' | 'hit') => {
    const roundData: BerryBlitzRound = {
      roundNumber: gameState.currentRound,
      targetFruit: currentRoundData.targetFruit,
      startTime: Date.now() - (performance.now() - roundStartTimeRef.current), // Convert back to Date.now() for storage
      endTime: Date.now(),
      duration: ROUND_DURATION,
      score: roundScore,
      fruitsCollected: targetFruitsCollected + nonTargetFruitsCollected,
      obstaclesHit,
      mistakes,
      accuracy: calculateAccuracy(targetFruitsCollected, targetFruitsCollected + nonTargetFruitsCollected),
      reactionTimes: [...reactionTimes],
      movementPatterns: [...movementPatterns]
    };
    
    const newRounds = [...gameState.rounds, roundData];
    const newScore = gameState.score + roundScore;
    
    // Show round transition
    setRoundTransitionData({
      roundNumber: gameState.currentRound,
      score: roundScore,
      targetFruitsCollected,
      obstaclesHit,
      timeRemaining: Math.ceil((ROUND_DURATION - (performance.now() - roundStartTimeRef.current)) / 1000)
    });
    
    setShowRoundTransition(true);
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      rounds: newRounds,
      score: newScore,
      currentRound: prev.currentRound + 1,
      gameStarted: false
    }));
    
    // Reset round state
    setRoundScore(0);
    setTargetFruitsCollected(0);
    setNonTargetFruitsCollected(0);
    setObstaclesHit(0);
    setMistakes(0);
    setReactionTimes([]);
    setMovementPatterns([]);
    setFruits([]);
    setObstacles([]);
  }, [gameState.currentRound, gameState.score, gameState.rounds, currentRoundData.targetFruit, roundScore, targetFruitsCollected, nonTargetFruitsCollected, obstaclesHit, mistakes, reactionTimes, movementPatterns]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.gameStarted || gameState.gameOver || gameState.showQuestions) return;
      
      // Only handle arrow keys
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        return;
      }
      
      e.preventDefault();
      const startTime = Date.now();
      
      setPlayer(prevPlayer => {
        const newPlayer = { ...prevPlayer };
        newPlayer.prevX = prevPlayer.x;
        newPlayer.prevY = prevPlayer.y;
        
        switch (e.key) {
          case 'ArrowUp':
            newPlayer.y = Math.max(0, prevPlayer.y - 1);
            break;
          case 'ArrowDown':
            newPlayer.y = Math.min(GRID_SIZE - 1, prevPlayer.y + 1);
            break;
          case 'ArrowLeft':
            newPlayer.x = Math.max(0, prevPlayer.x - 1);
            break;
          case 'ArrowRight':
            newPlayer.x = Math.min(GRID_SIZE - 1, prevPlayer.x + 1);
            break;
          default:
            return prevPlayer;
        }
        
        // Track movement patterns
        if (newPlayer.x !== prevPlayer.x || newPlayer.y !== prevPlayer.y) {
          setMovementPatterns(prev => [...prev, performance.now() - roundStartTimeRef.current]);
        }
        
        return newPlayer;
      });
      
      // Track reaction time
      const reactionTime = Date.now() - startTime;
      setReactionTimes(prev => [...prev, reactionTime]);
    };
    
    // Add event listener to document to ensure it captures all key events
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameState.gameStarted, gameState.gameOver, gameState.showQuestions]);
  
  // Create stable game loop function
  const createGameLoop = useCallback(() => {
    return (currentTime: number) => {
      if (!gameState.gameStarted || gameState.gameOver || gameState.showQuestions) {
        console.log('[BerryBlitz] Game loop early return - gameStarted:', gameState.gameStarted, 'gameOver:', gameState.gameOver, 'showQuestions:', gameState.showQuestions);
        return;
      }
      
      // Debug: Log game loop running
      if (Math.floor(currentTime / 1000) !== Math.floor((currentTime - 16) / 1000)) {
        console.log('[BerryBlitz] Game loop running, currentTime:', currentTime);
      }
      
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      // Update round timer
      // Ensure roundStartTimeRef is valid (should be set by startRound)
      // Check if it's an old Date.now() value (unreasonably large) or invalid
      if (roundStartTimeRef.current === 0 || roundStartTimeRef.current > 1000000000) {
        // If ref is invalid or contains a Date.now() timestamp, reset it to current time
        console.warn('[BerryBlitz] Invalid roundStartTimeRef detected, resetting to current time');
        roundStartTimeRef.current = currentTime;
      }
      const elapsed = currentTime - roundStartTimeRef.current;
      const timeLeft = Math.max(0, ROUND_DURATION - elapsed);
      setRoundTimeLeft(Math.ceil(timeLeft / 1000));
      
      // Debug: Log timing info every second
      if (Math.floor(elapsed / 1000) !== Math.floor((elapsed - deltaTime) / 1000)) {
        console.log('[BerryBlitz] Elapsed:', Math.floor(elapsed / 1000), 'seconds, Time left:', Math.ceil(timeLeft / 1000), 'seconds');
      }
      
      // Check if round is complete (time up OR hit by obstacle)
      if (timeLeft <= 0 || obstaclesHit > 0) {
        console.log('[BerryBlitz] Round ending - timeLeft:', timeLeft, 'obstaclesHit:', obstaclesHit);
        endRound(timeLeft <= 0 ? 'time' : 'hit');
        return;
      }
      
      // Spawn fruits gradually using timer-based approach
      fruitSpawnTimerRef.current += deltaTime;
      const fruitSpawnInterval = 800; // Spawn a fruit every 800ms
      
      if (fruitSpawnTimerRef.current >= fruitSpawnInterval) {
        fruitSpawnTimerRef.current = 0;
        
        setFruits(prev => {
          const activeFruits = prev.filter(fruit => !fruit.collected);
          
          // Only spawn new fruits if we're under the limit
          if (activeFruits.length < MAX_FRUITS_ON_SCREEN) {
            const newFruit = createFruit(currentRoundDataRef.current.targetFruit, playerRef.current, activeFruits, obstaclesRef.current);
            return [...prev, newFruit];
          }
          
          return prev;
        });
      }
      
      // Spawn obstacles (only after delay period)
      if (elapsed > OBSTACLE_SPAWN_DELAY) {
        // Debug: Log when delay period is reached
        if (elapsed > OBSTACLE_SPAWN_DELAY && elapsed < OBSTACLE_SPAWN_DELAY + 100) {
          console.log('[BerryBlitz] Shuriken spawn delay period reached! Elapsed:', elapsed, 'Delay:', OBSTACLE_SPAWN_DELAY);
        }
        
        // Force spawn a shuriken every 2 seconds for testing
        if (Math.floor(elapsed / 2000) !== Math.floor((elapsed - deltaTime) / 2000)) {
          console.log('[BerryBlitz] Force spawning shuriken for testing!');
          setObstacles(prev => {
            const newObstacle = createObstacle(playerRef.current, fruitsRef.current, prev);
            console.log('[BerryBlitz] Created shuriken at position:', newObstacle.x, newObstacle.y);
            return [...prev, newObstacle];
          });
        }
        
        if (Math.random() < OBSTACLE_SPAWN_RATE) {
          console.log('[BerryBlitz] Random spawn attempt - spawning shuriken!');
          setObstacles(prev => {
            const newObstacle = createObstacle(playerRef.current, fruitsRef.current, prev);
            console.log('[BerryBlitz] Created shuriken at position:', newObstacle.x, newObstacle.y);
            return [...prev, newObstacle];
          });
        }
      } else {
        // Debug: Log elapsed time periodically
        if (Math.floor(elapsed / 1000) !== Math.floor((elapsed - deltaTime) / 1000)) {
          console.log('[BerryBlitz] Elapsed time:', Math.floor(elapsed / 1000), 'seconds');
        }
      }
      
      // Move obstacles
      setObstacles(prev => prev.map(moveObstacle));
      
      // Check collisions
      const { fruitCollected, obstacleHit, newFruits, newObstacles } = checkCollisions(playerRef.current, fruitsRef.current, obstaclesRef.current);
      
      if (fruitCollected) {
        setFruits(newFruits);
        
        if (fruitCollected.isTarget) {
          setTargetFruitsCollected(prev => prev + 1);
          setRoundScore(prev => prev + 10);
        } else {
          setNonTargetFruitsCollected(prev => prev + 1);
          setRoundScore(prev => prev - 2);
          setMistakes(prev => prev + 1);
        }
      }
      
      if (obstacleHit) {
        setObstaclesHit(prev => prev + 1);
        setRoundScore(prev => prev - 5);
        setCollisionFlash(true);
        setTimeout(() => setCollisionFlash(false), 200);
      }
      
      // Clean up old fruits and obstacles
      const now = Date.now();
      setFruits(prev => prev.filter(fruit => now - fruit.spawnTime < FRUIT_LIFETIME));
      setObstacles(prev => prev.filter(obstacle => now - obstacle.spawnTime < OBSTACLE_LIFETIME));
      
      gameLoopRef.current = requestAnimationFrame(gameLoopFunctionRef.current!);
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.showQuestions, obstaclesHit, endRound]);
  
  // Update game loop function when dependencies change
  useEffect(() => {
    gameLoopFunctionRef.current = createGameLoop();
  }, [createGameLoop]);
  
  // Start game loop
  useEffect(() => {
    console.log('[BerryBlitz] Game loop effect triggered - gameStarted:', gameState.gameStarted, 'gameOver:', gameState.gameOver, 'showQuestions:', gameState.showQuestions);
    
    if (gameState.gameStarted && !gameState.gameOver && !gameState.showQuestions) {
      console.log('[BerryBlitz] Starting game loop!');
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoopFunctionRef.current!);
    } else {
      console.log('[BerryBlitz] Not starting game loop - conditions not met');
    }
    
    return () => {
      if (gameLoopRef.current) {
        console.log('[BerryBlitz] Cancelling game loop');
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.showQuestions]);
  
  
  // Start a new round
  const startRound = useCallback(() => {
    // Reset round start time using performance.now() to match requestAnimationFrame timing
    const now = performance.now();
    roundStartTimeRef.current = now;
    lastTimeRef.current = now; // Also reset lastTimeRef to avoid delta issues
    fruitSpawnTimerRef.current = 0; // Reset fruit spawn timer
    setRoundTimeLeft(ROUND_DURATION / 1000); // Reset timer display
    console.log('[BerryBlitz] Starting round at time:', roundStartTimeRef.current);
    console.log('[BerryBlitz] OBSTACLE_SPAWN_DELAY:', OBSTACLE_SPAWN_DELAY);
    console.log('[BerryBlitz] OBSTACLE_SPAWN_RATE:', OBSTACLE_SPAWN_RATE);
    setGameState(prev => ({ ...prev, gameStarted: true }));
    setPlayer({
      x: Math.floor(GRID_SIZE / 2),
      y: GRID_SIZE - 1,
      prevX: Math.floor(GRID_SIZE / 2),
      prevY: GRID_SIZE - 1
    });
  }, []);
  
  // Handle question answer
  const handleQuestionAnswer = useCallback((questionIndex: number, answer: number) => {
    const question = QUESTIONS[questionIndex];
    if (question) {
      setGameState(prev => ({
        ...prev,
        questionResponses: {
          ...prev.questionResponses,
          [question.id]: answer
        },
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  }, []);
  
  // Continue to next round or complete game
  const continueToNextRound = useCallback(() => {
    setShowRoundTransition(false);
    
    if (gameState.currentRound > ROUNDS.length) {
      // All rounds complete, show questions
      setGameState(prev => ({ ...prev, showQuestions: true }));
    } else {
      // Start next round
      setTimeout(() => {
        startRound();
      }, 1000);
    }
  }, [gameState.currentRound, startRound]);
  
  // Complete game
  const completeGame = useCallback(async () => {
    try {
      // Calculate ADHD scores
      const adhdScores = calculateADHDScores(gameState.rounds);
      
      // Create final game data
      const gameData: BerryBlitzGameData = {
        startTime: gameState.rounds[0]?.startTime || Date.now(),
        endTime: Date.now(),
        totalPlayTime: gameState.rounds.reduce((sum, round) => sum + round.duration, 0),
        gameCompleted: true,
        finalScore: gameState.score,
        livesLost: 0, // Berry Blitz doesn't use lives
        totalFruitsCollected: gameState.rounds.reduce((sum, round) => sum + round.fruitsCollected, 0),
        totalObstaclesHit: gameState.rounds.reduce((sum, round) => sum + round.obstaclesHit, 0),
        totalMistakes: gameState.rounds.reduce((sum, round) => sum + round.mistakes, 0),
        currentRound: gameState.currentRound,
        roundsCompleted: gameState.rounds.length,
        roundScores: gameState.rounds.map(round => round.score),
        roundCompletionTimes: gameState.rounds.map(round => round.duration),
        adhdScores,
        selfReport: gameState.questionResponses,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save to Firebase
      if (userId) {
        await setDoc(doc(db, 'users', userId, 'games', 'BerryBlitz'), gameData, { merge: true });
        console.log('[BerryBlitz][FIREBASE] Game data saved successfully');
      }
      
      // Call completion callback
      onGameComplete(gameData);
      
    } catch (error) {
      console.error('[BerryBlitz] Error completing game:', error);
      onError('Failed to complete game: ' + (error as Error).message);
    }
  }, [gameState, userId, onGameComplete, onError]);
  
  // Handle question completion
  useEffect(() => {
    if (gameState.showQuestions && gameState.currentQuestionIndex >= QUESTIONS.length) {
      completeGame();
    }
  }, [gameState.showQuestions, gameState.currentQuestionIndex, completeGame]);
  
  // Render game canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
      ctx.stroke();
    }
    
    // Draw fruits
    fruits.forEach(fruit => {
      if (!fruit.collected) {
        const x = fruit.x * CELL_SIZE + CELL_SIZE / 2;
        const y = fruit.y * CELL_SIZE + CELL_SIZE / 2;
        
        ctx.font = `${FRUIT_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getFruitEmoji(fruit.type), x, y);
      }
    });
    
    // Draw obstacles
    obstacles.forEach(obstacle => {
      const x = obstacle.x * CELL_SIZE + CELL_SIZE / 2;
      const y = obstacle.y * CELL_SIZE + CELL_SIZE / 2;
      
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(x, y, OBSTACLE_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw shuriken symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', x, y);
    });
    
    // Draw player
    const playerX = player.x * CELL_SIZE + CELL_SIZE / 2;
    const playerY = player.y * CELL_SIZE + CELL_SIZE / 2;
    
    ctx.fillStyle = collisionFlash ? '#FF6B6B' : '#10B981';
    ctx.beginPath();
    ctx.arc(playerX, playerY, PLAYER_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw player emoji
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐼', playerX, playerY);
  }, [fruits, obstacles, player, collisionFlash]);
  
  // Render canvas on state changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);
  
  // Render instructions
  if (showInstructions) {
    const targetFruitEmoji = getFruitEmoji(currentRoundData.targetFruit);
    const targetFruitColor = getFruitColor(currentRoundData.targetFruit);
    
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-emerald-50 to-green-100 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full border border-emerald-100">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-emerald-800 mb-1">
              Berry Blitz
            </h1>
            <p className="text-base text-emerald-600 font-medium">
              Round {gameState.currentRound}: {currentRoundData.name}
            </p>
          </div>
          
          {/* Target Fruit Highlight */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 mb-4 border border-emerald-200">
            <div className="text-center">
              <div className="text-3xl mb-2">{targetFruitEmoji}</div>
              <h3 className="text-lg font-bold text-emerald-800 mb-2">
                Target: {currentRoundData.targetFruit}s
              </h3>
              <div className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                +10 points each
              </div>
            </div>
          </div>
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Left Column - Instructions */}
            <div className="space-y-2">
              <h4 className="text-base font-bold text-gray-800 mb-2">How to Play:</h4>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-sm">
                <span className="text-lg">🐼</span>
                <span className="text-gray-800 font-medium">Arrow keys to move</span>
              </div>
              
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-sm">
                <span className="text-lg">🍎</span>
                <span className="text-gray-800 font-medium">Wrong fruits = -2 points</span>
              </div>
              
              <div className="flex items-center space-x-2 p-2 bg-red-50 rounded border border-red-200 text-sm">
                <span className="text-lg">★</span>
                <span className="text-red-800 font-medium">Shurikens = -5 points</span>
              </div>
              
              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded border border-blue-200 text-sm">
                <span className="text-lg">⏱️</span>
                <span className="text-blue-800 font-medium">30 seconds per round</span>
              </div>
              
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded border border-green-200 text-sm">
                <span className="text-lg">🛡️</span>
                <span className="text-green-800 font-medium">5 seconds before shurikens appear</span>
              </div>
            </div>
            
            {/* Right Column - Visual Example */}
            <div className="bg-gray-100 rounded-lg p-3">
              <h4 className="font-semibold text-gray-800 mb-2 text-center text-sm">Grid Example</h4>
              <div className="flex justify-center mb-2">
                <div className="grid grid-cols-5 gap-0.5 bg-white p-1 rounded border border-gray-300">
                  {Array.from({ length: 25 }, (_, i) => {
                    const x = i % 5;
                    const y = Math.floor(i / 5);
                    const isCenter = x === 2 && y === 2;
                    const isTarget = x === 1 && y === 1;
                    const isObstacle = x === 3 && y === 3;
                    
                    return (
                      <div key={i} className="w-4 h-4 border border-gray-200 flex items-center justify-center text-xs">
                        {isCenter && '🐼'}
                        {isTarget && targetFruitEmoji}
                        {isObstacle && '★'}
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-center text-xs text-gray-600">
                🐼 Panda • {targetFruitEmoji} Target • ★ Obstacle
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowInstructions(false);
                startRound();
              }}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-3 rounded-lg font-bold text-sm hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🎮 Start Round {gameState.currentRound}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-lg font-bold text-sm hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render round transition
  if (showRoundTransition && roundTransitionData) {
    const nextRoundData = ROUNDS[gameState.currentRound - 1];
    const nextTargetFruitEmoji = nextRoundData ? getFruitEmoji(nextRoundData.targetFruit) : '';
    
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-emerald-50 to-green-100 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full border border-emerald-100">
          {/* Round Complete Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-emerald-800 mb-2">
              Round {roundTransitionData.roundNumber} Complete!
            </h2>
            <p className="text-lg text-emerald-600">
              {roundTransitionData.obstaclesHit > 0 ? 'Hit by shuriken!' : 'Time\'s up!'}
            </p>
          </div>
          
          {/* Round Results */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 mb-6 border-2 border-emerald-200">
            <h3 className="text-xl font-bold text-emerald-800 mb-4 text-center">Round Results</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{roundTransitionData.targetFruitsCollected}</div>
                <div className="text-sm text-emerald-700">Target Fruits Collected</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{roundTransitionData.score}</div>
                <div className="text-sm text-emerald-700">Round Score</div>
              </div>
            </div>
          </div>
          
          {/* Next Round Info */}
          {gameState.currentRound <= ROUNDS.length && (
            <div className="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-blue-800 mb-4 text-center">Next Round</h3>
              <div className="text-center">
                <div className="text-4xl mb-2">{nextTargetFruitEmoji}</div>
                <p className="text-lg text-blue-700 font-semibold capitalize">
                  Round {gameState.currentRound}: Collect {nextRoundData.targetFruit}s
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  {nextRoundData.description}
                </p>
              </div>
            </div>
          )}
          
          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={continueToNextRound}
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {gameState.currentRound > ROUNDS.length ? 'Continue to Questions' : `Start Round ${gameState.currentRound}`}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render questions
  if (gameState.showQuestions) {
    const currentQuestion = QUESTIONS[gameState.currentQuestionIndex];
    
    if (currentQuestion) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-emerald-50 to-green-100 p-8">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-emerald-800 mb-6 text-center">
              Question {gameState.currentQuestionIndex + 1} of {QUESTIONS.length}
            </h2>
            
            <p className="text-lg text-gray-700 mb-8 text-center">
              {currentQuestion.text}
            </p>
            
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuestionAnswer(gameState.currentQuestionIndex, value)}
                  className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {value === 1 && 'Never'}
                  {value === 2 && 'Rarely'}
                  {value === 3 && 'Sometimes'}
                  {value === 4 && 'Often'}
                  {value === 5 && 'Always'}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }
  }
  
  // Render game
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-emerald-50 to-green-100 p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Game header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-emerald-800">
              Round {gameState.currentRound}: {currentRoundData.name}
            </h2>
            <p className="text-sm text-gray-600">
              Target: {getFruitEmoji(currentRoundData.targetFruit)} {currentRoundData.targetFruit}s
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-emerald-600">Score: {gameState.score + roundScore}</div>
            <div className="text-sm text-gray-600">Time: {formatTime(roundTimeLeft)}</div>
          </div>
        </div>
        
        {/* Game canvas */}
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block"
          />
        </div>
        
        {/* Game stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold text-emerald-600">Target Fruits</div>
            <div>{targetFruitsCollected}</div>
          </div>
          <div>
            <div className="font-semibold text-red-600">Obstacles Hit</div>
            <div>{obstaclesHit}</div>
          </div>
          <div>
            <div className="font-semibold text-yellow-600">Mistakes</div>
            <div>{mistakes}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BerryBlitzGame;
