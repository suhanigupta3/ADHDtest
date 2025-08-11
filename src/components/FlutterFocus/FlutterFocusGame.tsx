import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FlutterFocusGameProps, Debris, DebrisConfig, DebrisType, DebrisSize, DebrisSpeed, DebrisRotationSpeed, ShootingStar } from './types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  DEBRIS_SPAWN_INTERVAL_MIN, 
  DEBRIS_SPAWN_INTERVAL_MAX,
  DEBRIS_MAX_ON_SCREEN,
  DEBRIS_SPEEDS,
  DEBRIS_ROTATION_SPEEDS,
  DEBRIS_CONFIGS,
  Z_INDEX_LAYERS,
  SHOOTING_STAR_SPAWN_INTERVAL_MIN,
  SHOOTING_STAR_SPAWN_INTERVAL_MAX,
  SHOOTING_STAR_MAX_ON_SCREEN,
  SHOOTING_STAR_CONFIGS,
  SHOOTING_STAR_LENGTHS,
  SHOOTING_STAR_SPEEDS
} from './constants';

/**
 * FlutterFocusGame - ADHD Assessment Game
 * 
 * Game Flow:
 * 1. Instructions → Countdown → Level 1 (3 lives)
 * 2. Level 1 Complete → Countdown → Level 2 (3 lives) 
 * 3. Level 2 Complete → Countdown → Level 3 (3 lives)
 * 4. Level 3 Complete → Assessment Ends (no replay)
 * 
 * Each level: Lose 3 lives to complete, post results to Firebase
 * Final state: Call onGameComplete with ADHD assessment data
 */
const FlutterFocusGame: React.FC<FlutterFocusGameProps> = ({
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
  const renderCountRef = useRef<number>(0);
  
  // Simple game state
  const [gameState, setGameState] = useState<'instructions' | 'countdown' | 'playing' | 'gameOver' | 'levelComplete' | 'gameComplete'>('instructions');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  // Clean collision feedback - no screen shake for ADHD assessment accuracy
  const [collisionFlash, setCollisionFlash] = useState(false);
  const [collisionParticles, setCollisionParticles] = useState<Array<{x: number, y: number, vx: number, vy: number, life: number}>>([]);
  
  // Background debris system
  const [backgroundDebris, setBackgroundDebris] = useState<Debris[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const debrisRef = useRef<Debris[]>([]); // Ref to track current debris state
  const debrisSpawnTimerRef = useRef(0);
  const shootingStarsRef = useRef<ShootingStar[]>([]); // Ref to track current shooting stars state
  const shootingStarSpawnTimerRef = useRef(0);
  const debrisSpeedRef = useRef(0);
  const debrisRotationSpeedRef = useRef(0);
  const debrisCountRef = useRef(0);
  
  // Use ref to track current game state to avoid stale closures
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  
  // Use ref to track current level to avoid stale closures
  const levelRef = useRef(level);
  levelRef.current = level;
  
  // Game objects
  const alienRef = useRef({ x: 100, y: 270, width: 120, height: 92, velocityY: 0 });
  const obstaclesRef = useRef<Array<{ x: number; y: number; width: number; height: number; type: string; collisionState?: 'normal' | 'hit' | 'exploding' | 'removing'; collisionTimer?: number; rotation?: number; scale?: number; alpha?: number; explosionFrame?: number; explosionX?: number; explosionY?: number }>>([]);
  const obstacleSpawnTimerRef = useRef(0);
  const gameStartTimeRef = useRef(Date.now());
  
  // Star layers for deep space effect
  const starsLayer1Ref = useRef<Array<{x: number, y: number, size: number}>>([]);
  const starsLayer2Ref = useRef<Array<{x: number, y: number, size: number}>>([]);
  const starsLayer3Ref = useRef<Array<{x: number, y: number, size: number}>>([]);
  
  // Flying saucer sprite
  const alienSpriteRef = useRef<HTMLImageElement | null>(null);
  
  // Background debris sprites
  const debrisSpritesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  
  // Explosion sprite sequence
  const explosionSpritesRef = useRef<HTMLImageElement[]>([]);
  
  // Debug logging
  // Essential logging for troubleshooting
  const logDebug = useCallback((message: string, data?: any) => {
    console.log(`[FlutterFocus] ${message}`, data || '');
  }, []);
  
  // Initialize star layers
  const initializeStars = useCallback(() => {
    // Layer 1: Static stars (background)
    starsLayer1Ref.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * 960,
      y: Math.random() * 540,
      size: Math.random() * 1.5 + 0.5
    }));
    
    // Layer 2: Slow moving stars (medium brightness)
    starsLayer2Ref.current = Array.from({ length: 40 }, () => ({
      x: Math.random() * 960,
      y: Math.random() * 540,
      size: Math.random() * 1.2 + 0.8
    }));
    
    // Layer 3: Fast moving stars (brightest)
    starsLayer3Ref.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * 960,
      y: Math.random() * 540,
      size: Math.random() * 1.0 + 1.0
    }));
  }, []);
  
  // Load flying saucer sprite
  const loadAlienSprite = useCallback(() => {
    const img = new Image();
    img.onload = () => {
      alienSpriteRef.current = img;
      logDebug('Flying saucer sprite loaded successfully');
    };
    img.onerror = () => {
      console.error('[FlutterFocus] Failed to load flying saucer sprite');
      alienSpriteRef.current = null;
    };
    img.src = '/FlutterFocus/flying-saucer-sprite.png';
  }, [logDebug]);
  
  // Load explosion sprite sequence
  const loadExplosionSprites = useCallback(() => {
    const spriteCount = 7;
    const sprites: HTMLImageElement[] = [];
    let loadedCount = 0;
    
    for (let i = 1; i <= spriteCount; i++) {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === spriteCount) {
          explosionSpritesRef.current = sprites;
          logDebug('All explosion sprites loaded successfully');
        }
      };
      img.onerror = () => {
        console.error(`[FlutterFocus] Failed to load explosion sprite e${i}.png`);
      };
      img.src = `/FlutterFocus/explosions/e${i}.png`;
      sprites.push(img);
    }
  }, [logDebug]);
  
  // Clear existing obstacles since we're using the new debris system
  const clearExistingObstacles = useCallback(() => {
    obstaclesRef.current = [];
    console.log('[FlutterFocus] Cleared existing obstacles, using new debris system');
  }, []);

  // Spawn shooting star
  const spawnShootingStar = useCallback(() => {
    // Select random configuration based on weights
    const totalWeight = SHOOTING_STAR_CONFIGS.reduce((sum, config) => sum + config.spawnWeight, 0);
    let randomWeight = Math.random() * totalWeight;
    let selectedConfig = SHOOTING_STAR_CONFIGS[0];
    
    for (const config of SHOOTING_STAR_CONFIGS) {
      randomWeight -= config.spawnWeight;
      if (randomWeight <= 0) {
        selectedConfig = config;
        break;
      }
    }
    
    // Random starting position (top-right area)
    const startX = CANVAS_WIDTH + Math.random() * 100;
    const startY = Math.random() * 200;
    
    // Random angle (diagonal from top-right to bottom-left)
    const angle = Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 6; // 45° ± 15°
    
    const newShootingStar: ShootingStar = {
      id: `shooting-star-${Date.now()}-${Math.random()}`,
      x: startX,
      y: startY,
      length: SHOOTING_STAR_LENGTHS[selectedConfig.length],
      angle: angle,
      speed: SHOOTING_STAR_SPEEDS[selectedConfig.speed],
      life: 120, // Frames the shooting star will live
      maxLife: 120,
      alpha: 1.0,
      isActive: true
    };
    
    shootingStarsRef.current.push(newShootingStar);
    setShootingStars([...shootingStarsRef.current]);
    
    console.log('[FlutterFocus] Shooting star spawned:', { 
      type: `${selectedConfig.speed}-${selectedConfig.length}`,
      x: Math.round(startX), 
      y: Math.round(startY),
      angle: Math.round(angle * 180 / Math.PI) + '°'
    });
  }, []);

  // Update shooting stars
  const updateShootingStars = useCallback((deltaTime: number) => {
    shootingStarsRef.current = shootingStarsRef.current
      .map(star => ({
        ...star,
        x: star.x - Math.cos(star.angle) * star.speed,
        y: star.y + Math.sin(star.angle) * star.speed,
        life: star.life - 1,
        alpha: star.life / star.maxLife // Fade out over time
      }))
      .filter(star => star.life > 0 && star.x > -star.length && star.y < CANVAS_HEIGHT + star.length); // Remove dead or off-screen stars
    
    // Update React state to keep it in sync
    setShootingStars([...shootingStarsRef.current]);
    
    // Debug: log shooting star count
    if (shootingStarsRef.current.length > 0 && Math.random() < 0.05) { // Log 5% of the time
      console.log('[FlutterFocus] Shooting stars update:', { 
        count: shootingStarsRef.current.length,
        firstStar: shootingStarsRef.current[0] ? { 
          x: Math.round(shootingStarsRef.current[0].x), 
          y: Math.round(shootingStarsRef.current[0].y),
          life: shootingStarsRef.current[0].life 
        } : null 
      });
    }
  }, []);
  
  // Load background debris sprites
  const loadBackgroundDebrisSprites = useCallback(() => {
    const backgroundDebrisTypes = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'];
    const collisionDebrisTypes = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'd14', 'd15', 'd16', 'd17', 'd18', 'd19', 'd20', 'd21', 'd22', 'd23', 'd24'];
    const allDebrisTypes = [...backgroundDebrisTypes, ...collisionDebrisTypes];
    let loadedCount = 0;
    
    allDebrisTypes.forEach(type => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        debrisSpritesRef.current[type] = img;
        if (loadedCount === allDebrisTypes.length) {
          logDebug('All debris sprites loaded successfully');
        }
      };
      img.onerror = () => {
        console.error(`[FlutterFocus] Failed to load debris sprite ${type}.png`);
      };
      
      // Load from different folders based on type
      if (backgroundDebrisTypes.includes(type)) {
        img.src = `/FlutterFocus/debrisBackground/${type}.png`;
      } else {
        img.src = `/FlutterFocus/debris/${type}.png`;
      }
    });
  }, [logDebug]);
  
  // Update star positions
  const updateStars = useCallback((deltaTime: number) => {
    // Layer 2: Slow movement (right to left)
    starsLayer2Ref.current.forEach(star => {
      star.x -= 0.02 * deltaTime; // Slow movement
      if (star.x < -10) star.x = 970; // Wrap around
    });
    
    // Layer 3: Fast movement (right to left)
    starsLayer3Ref.current.forEach(star => {
      star.x -= 0.05 * deltaTime; // Fast movement
      if (star.x < -10) star.x = 970; // Wrap around
    });
  }, []);
  
  // Spawn background debris
  const spawnBackgroundDebris = useCallback(() => {
    // Select random debris configuration based on weights
    const totalWeight = DEBRIS_CONFIGS.reduce((sum, config) => sum + config.spawnWeight, 0);
    let randomWeight = Math.random() * totalWeight;
    let selectedConfig: DebrisConfig = DEBRIS_CONFIGS[0]; // Default fallback
    
    for (const config of DEBRIS_CONFIGS) {
      randomWeight -= config.spawnWeight;
      if (randomWeight <= 0) {
        selectedConfig = config;
        break;
      }
    }
    
    // Get size dimensions - size is now a direct number value
    const width = selectedConfig.size;
    const height = selectedConfig.size; // Assuming square debris for now
    
    // Random position (right side of screen, random Y)
    const x = CANVAS_WIDTH + width;
    const y = Math.random() * (CANVAS_HEIGHT - height);
    
    // Get speed and rotation values
    const speed = DEBRIS_SPEEDS[selectedConfig.speed];
    const rotationSpeed = DEBRIS_ROTATION_SPEEDS[selectedConfig.rotationSpeed];
    const rotation = Math.random() * 360;
    
    const newDebris: Debris = {
      id: `debris_${Date.now()}_${Math.random()}`,
      x,
      y,
      width,
      height,
      type: selectedConfig.type,
      speed: selectedConfig.speed,
      rotationSpeed: selectedConfig.rotationSpeed,
      rotation,
      zIndex: selectedConfig.zIndex,
      isActive: true,
      hasCollision: selectedConfig.hasCollision,
      collisionDamage: selectedConfig.collisionDamage
    };
    
    console.log('[FlutterFocus] Spawning debris:', {
      config: selectedConfig,
      speed: speed,
      rotationSpeed: rotationSpeed,
      debris: newDebris,
      spriteLoaded: !!debrisSpritesRef.current[selectedConfig.type]
    });
    
    // Debug: log the current state before and after adding debris
    console.log('[FlutterFocus] Before adding debris, count:', debrisRef.current.length);
    debrisRef.current = [...debrisRef.current, newDebris]; // Update ref directly
    setBackgroundDebris([...debrisRef.current]); // Update state for React
    console.log('[FlutterFocus] After adding debris, new count:', debrisRef.current.length);
  }, []);
  
  // Update background debris positions and rotation
  const updateBackgroundDebris = useCallback((deltaTime: number) => {
    debrisRef.current = debrisRef.current
      .map(debris => ({
        ...debris,
        x: debris.x - DEBRIS_SPEEDS[debris.speed], // Move by speed per frame
        rotation: debris.rotation + DEBRIS_ROTATION_SPEEDS[debris.rotationSpeed] // All debris rotate
      }))
      .filter(debris => debris.x > -debris.width && debris.isActive); // Remove debris that's off-screen or inactive
    
    // Update React state to keep it in sync
    setBackgroundDebris([...debrisRef.current]);
    
    // Debug: log debris count and positions
    if (debrisRef.current.length > 0 && Math.random() < 0.1) { // Log 10% of the time
      console.log('[FlutterFocus] Debris update:', { 
        count: debrisRef.current.length, 
        active: debrisRef.current.filter(d => d.isActive).length,
        firstDebris: debrisRef.current[0] ? { x: Math.round(debrisRef.current[0].x), y: Math.round(debrisRef.current[0].y) } : null 
      });
    }
  }, []);
  
  // Clean up inactive debris to prevent memory issues
  const cleanupInactiveDebris = useCallback(() => {
    debrisRef.current = debrisRef.current.filter(debris => debris.isActive);
    setBackgroundDebris([...debrisRef.current]); // Update state for React
  }, []);
  
  // Handle obstacle collision animation
  const handleObstacleCollision = useCallback((obstacle: any) => {
    // Start explosion immediately at collision point
    obstacle.collisionState = 'exploding';
    obstacle.collisionTimer = 0;
    obstacle.explosionFrame = 0;
    
    // Calculate exact collision point (center of overlap between alien and obstacle)
    const alien = alienRef.current;
    const collisionX = Math.max(obstacle.x, alien.x) + Math.min(obstacle.width, alien.width) / 2;
    const collisionY = Math.max(obstacle.y, alien.y) + Math.min(obstacle.height, alien.height) / 2;
    
    obstacle.explosionX = collisionX;
    obstacle.explosionY = collisionY;
    
    // Add collision particles for obstacle
    const particleCount = 8;
    const newParticles: Array<{x: number, y: number, vx: number, vy: number, life: number}> = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: collisionX,
        y: collisionY,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30
      });
    }
    setCollisionParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Handle debris collision animation
  const handleDebrisCollision = useCallback((debris: Debris) => {
    // Start explosion immediately at collision point
    debris.collisionState = 'exploding';
    debris.collisionTimer = 0;
    debris.explosionFrame = 0;
    
    // Calculate exact collision point (center of overlap between alien and debris)
    const alien = alienRef.current;
    const collisionX = Math.max(debris.x, alien.x) + Math.min(debris.width, alien.width) / 2;
    const collisionY = Math.max(debris.y, alien.y) + Math.min(debris.height, alien.height) / 2;
    
    debris.explosionX = collisionX;
    debris.explosionY = collisionY;
    
    // Add collision particles for debris
    const particleCount = 6;
    const newParticles: Array<{x: number, y: number, vx: number, vy: number, life: number}> = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: collisionX,
        y: collisionY,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 25
      });
    }
    setCollisionParticles(prev => [...prev, ...newParticles]);
    
    console.log('[FlutterFocus] Debris collision animation started:', { 
      debrisId: debris.id, 
      collisionPoint: { x: Math.round(collisionX), y: Math.round(collisionY) } 
    });
  }, []);
  
  // Update obstacle collision animations
  const updateObstacleAnimations = useCallback((deltaTime: number) => {
    obstaclesRef.current.forEach(obstacle => {
      if (obstacle.collisionState === 'exploding' && obstacle.collisionTimer !== undefined) {
        obstacle.collisionTimer += deltaTime;
        
        // Update explosion frame (7 frames over 400ms = ~57ms per frame)
        const frameTime = 57;
        const frameIndex = Math.floor(obstacle.collisionTimer / frameTime);
        obstacle.explosionFrame = Math.min(frameIndex, 6); // Cap at frame 6 (e7.png)
        
        // Remove obstacle immediately when explosion reaches the last frame (e7.png)
        if (obstacle.explosionFrame >= 6) {
          obstacle.collisionState = 'removing';
        }
      }
    });
    
    // Remove obstacles marked for removal
    obstaclesRef.current = obstaclesRef.current.filter(obstacle => obstacle.collisionState !== 'removing');
  }, []);

  // Update debris collision animations
  const updateDebrisCollisionAnimations = useCallback((deltaTime: number) => {
    debrisRef.current.forEach(debris => {
      if (debris.collisionState === 'exploding' && debris.collisionTimer !== undefined) {
        debris.collisionTimer += deltaTime;
        
        // Update explosion frame (7 frames over 400ms = ~57ms per frame)
        const frameTime = 57;
        const frameIndex = Math.floor(debris.collisionTimer / frameTime);
        debris.explosionFrame = Math.min(frameIndex, 6); // Cap at frame 6 (e7.png)
        
        // Mark debris for removal when explosion reaches the last frame
        if (debris.explosionFrame >= 6) {
          debris.collisionState = 'removing';
        }
      }
    });
    
    // Remove debris marked for removal
    debrisRef.current = debrisRef.current.filter(debris => debris.collisionState !== 'removing');
    setBackgroundDebris([...debrisRef.current]); // Update state for React
  }, []);
  
  // Main game loop
  const gameLoop = useCallback((currentTime: number) => {
    // Use ref to get current game state and avoid stale closure
    const currentGameState = gameStateRef.current;
    
    if (currentGameState !== 'playing') {
      console.warn(`[FlutterFocus] Game loop called but gameState is '${currentGameState}', not 'playing'`);
      return;
    }
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    // Protect against extreme deltaTime values (first frame or lag)
    const clampedDeltaTime = Math.min(deltaTime, 100); // Max 100ms per frame
    
    // Update alien physics - make movement time-based for smoothness
    const alien = alienRef.current;
    const gravity = 0.0005; // Gravity per millisecond
    const movementSpeed = 0.3; // Pixels per millisecond
    
    alien.velocityY += gravity * clampedDeltaTime;
    alien.y += alien.velocityY * movementSpeed * clampedDeltaTime;
    
    // Ground collision
    if (alien.y > 448) { // 540 - 92 (canvas height - alien height)
      alien.y = 448;
      alien.velocityY = 0;
    }
    
    // Ceiling collision
    if (alien.y < 0) {
      alien.y = 0;
      alien.velocityY = 0;
    }
    
    // Update star positions for parallax effect
    updateStars(clampedDeltaTime);
    
    // Update background debris positions and rotation
    updateBackgroundDebris(clampedDeltaTime);
    
    // Update shooting stars
    updateShootingStars(clampedDeltaTime);
    
    // Clean up inactive debris periodically
    if (Math.random() < 0.01) { // 1% chance per frame to clean up
      cleanupInactiveDebris();
    }
    
    // Update obstacle collision animations
    updateObstacleAnimations(clampedDeltaTime);

    // Update debris collision animations
    updateDebrisCollisionAnimations(clampedDeltaTime);

    // Spawn obstacles (harder with each level) - DISABLED: Using new debris system instead
    // obstacleSpawnTimerRef.current += clampedDeltaTime;
    // const spawnInterval = Math.max(1000, 3000 - levelRef.current * 500); // Level 1: 2.5s, Level 2: 2s, Level 3: 1.5s
    
    // if (obstacleSpawnTimerRef.current > spawnInterval) {
    //   obstacleSpawnTimerRef.current = 0;
    //   const newObstacle = {
    //     x: 960,
    //     y: Math.random() * 400 + 50,
    //     width: 60,
    //     height: 60,
    //     type: 'asteroid'
    //   };
    //   obstaclesRef.current.push(newObstacle);
    //   // Only log every few spawns to reduce spam
    //   if (obstaclesRef.current.length % 3 === 0) {
    //     logDebug('Obstacle spawned', { 
    //       count: obstaclesRef.current.length, 
    //       level: levelRef.current,
    //       spawnInterval,
    //       deltaTime: clampedDeltaTime
    //     });
    //   }
    // }
    
    // Spawn background debris (distractors)
    debrisSpawnTimerRef.current += 1; // Increment frame counter instead of deltaTime
    const debrisSpawnInterval = DEBRIS_SPAWN_INTERVAL_MIN / 16 + Math.random() * (DEBRIS_SPAWN_INTERVAL_MAX - DEBRIS_SPAWN_INTERVAL_MIN) / 16; // Convert to frames (assuming 60fps = 16ms per frame)
    
    console.log('[FlutterFocus] Debris spawn check:', { 
      timer: debrisSpawnTimerRef.current, 
      interval: debrisSpawnInterval,
      shouldSpawn: debrisSpawnTimerRef.current > debrisSpawnInterval,
      currentDebris: debrisRef.current.length,
      maxDebris: DEBRIS_MAX_ON_SCREEN
    });
    
    if (debrisSpawnTimerRef.current > debrisSpawnInterval && debrisRef.current.length < DEBRIS_MAX_ON_SCREEN) {
      debrisSpawnTimerRef.current = 0;
      
      // Random count of debris to spawn (1-3 pieces), but respect max limit
      const maxSpawnCount = Math.min(3, DEBRIS_MAX_ON_SCREEN - debrisRef.current.length);
      const debrisCount = Math.floor(Math.random() * maxSpawnCount) + 1;
      
      console.log('[FlutterFocus] Attempting to spawn debris:', { 
        count: debrisCount, 
        timer: debrisSpawnTimerRef.current,
        interval: debrisSpawnInterval,
        currentDebris: debrisRef.current.length,
        maxDebris: DEBRIS_MAX_ON_SCREEN
      });
      
      for (let i = 0; i < debrisCount; i++) {
        spawnBackgroundDebris();
      }
      
      // Only log every few spawns to reduce spam
      if (debrisRef.current.length % 5 === 0) {
        logDebug('Background debris spawned', { 
          count: debrisCount, 
          totalDebris: debrisRef.current.length,
          spawnInterval: debrisSpawnInterval,
          deltaTime: clampedDeltaTime
        });
      }
    }

    // Spawn shooting stars
    shootingStarSpawnTimerRef.current += clampedDeltaTime;
    const shootingStarSpawnInterval = SHOOTING_STAR_SPAWN_INTERVAL_MIN + Math.random() * (SHOOTING_STAR_SPAWN_INTERVAL_MAX - SHOOTING_STAR_SPAWN_INTERVAL_MIN);
    
    if (shootingStarSpawnTimerRef.current > shootingStarSpawnInterval && shootingStarsRef.current.length < SHOOTING_STAR_MAX_ON_SCREEN) {
      shootingStarSpawnTimerRef.current = 0;
      spawnShootingStar();
      
      console.log('[FlutterFocus] Shooting star spawned in game loop');
    }
    
    // Move obstacles - make movement time-based for smoothness (faster with each level) - DISABLED: Using new debris system instead
    // const baseObstacleSpeed = 0.15; // Base speed in pixels per millisecond
    // const obstacleSpeed = baseObstacleSpeed + (levelRef.current - 1) * 0.05; // Level 1: 0.15, Level 2: 0.20, Level 3: 0.25
    // const previousObstacles = [...obstaclesRef.current];
    // obstaclesRef.current = obstaclesRef.current
    //   .map(obstacle => ({ 
    //     ...obstacle, 
    //     x: obstacle.x - (obstacleSpeed * clampedDeltaTime)
    //   }))
    //   .filter(obstacle => obstacle.x > -100);
    
    // Debug obstacle movement (less frequent to reduce log spam) - DISABLED
    // if (obstaclesRef.current.length > 0 && renderCountRef.current % 30 === 0) {
    //   const movedCount = obstaclesRef.current.length;
    //   const removedCount = previousObstacles.length - movedCount;
    //   logDebug('Obstacles moved', { 
    //     count: movedCount,
    //     removed: removedCount,
    //     firstObstacle: obstaclesRef.current[0] ? { 
    //       x: Math.round(obstaclesRef.current[0].x), 
    //       y: Math.round(obstaclesRef.current[0].y) 
    //     } : null
    //   });
    // }
    
    // Check collisions - immediate consequences for ADHD assessment - DISABLED: Using new debris system instead
    // obstaclesRef.current.forEach((obstacle, index) => {
    //   if (alien.x < obstacle.x + obstacle.width &&
    //                       alien.x + alien.width > obstacle.x &&
    //             alien.y < obstacle.y + obstacle.height &&
    //             alien.y + alien.height > obstacle.y &&
    //             obstacle.collisionState !== 'exploding') {
    //     // Collision! Immediate life loss for accurate ADHD assessment
    //     setLives(prev => {
    //       const newLives = prev - 1;
    //       if (newLives <= 0) {
    //         // Clear all screen effects immediately
    //         setCollisionFlash(false);
    //         setCollisionParticles([]);
            
    //         // Level complete - post results to Firebase
    //         postLevelResults();
            
    //         if (levelRef.current < 3) {
    //           // Move to next level (user gets 3 more lives)
    //           setGameState('levelComplete');
    //         } else {
    //           // All 3 levels complete - assessment ends, no more gameplay
    //           postFinalResults();
    //           setGameState('gameComplete');
    //         }
    //       }
    //       return newLives;
    //     });
        
    //     // Start collision animation instead of removing immediately
    //     handleObstacleCollision(obstacle);
        
    //     // Add collision animation effects (clean visual feedback for ADHD assessment)
    //     setCollisionFlash(true); // Brief red flash - no screen movement
        
    //     // Create collision particles for alien
    //     const particles: Array<{x: number, y: number, vx: number, vy: number, life: number}> = [];
    //     for (let i = 0; i < 8; i++) {
    //       particles.push({
    //       x: alien.x + alien.width / 2,
    //       y: alien.y + alien.height / 2,
    //       vx: (Math.random() - 0.5) * 4,
    //       vy: (Math.random() - 0.5) * 4,
    //       life: 30 // Frames the particle will live
    //       });
    //     }
    //     setCollisionParticles(particles);
        
    //     logDebug('Alien hit obstacle! Lives remaining:', lives - 1);
    //   }
    // });
    
    // Check collisions with debris that have collision enabled
    debrisRef.current.forEach((debris) => {
      if (debris.hasCollision && debris.isActive) {
        if (alien.x < debris.x + debris.width &&
            alien.x + alien.width > debris.x &&
            alien.y < debris.y + debris.height &&
            alien.y + alien.height > debris.y) {
          
          // Collision with debris! Life loss based on collision damage
          const damage = debris.collisionDamage;
          setLives(prev => {
            const newLives = Math.max(0, prev - damage);
            if (newLives <= 0) {
              // Clear all screen effects immediately
              setCollisionFlash(false);
              setCollisionParticles([]);
              
              // Level complete - post results to Firebase
              postLevelResults();
              
              if (levelRef.current < 3) {
                // Move to next level (user gets 3 more lives)
                setGameState('levelComplete');
              } else {
                // All 3 levels complete - assessment ends, no more gameplay
                postFinalResults();
                setGameState('gameComplete');
              }
            }
            return newLives;
          });
          
          // Add collision animation effects
          setCollisionFlash(true);
          
          // Start collision animation for the debris
          handleDebrisCollision(debris);
          
          // Create collision particles for alien
          const particles: Array<{x: number, y: number, vx: number, vy: number, life: number}> = [];
          for (let i = 0; i < 6; i++) {
            particles.push({
              x: alien.x + alien.width / 2,
              y: alien.y + alien.height / 2,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 25
            });
          }
          setCollisionParticles(particles);
          
          // Deactivate the debris after collision
          debrisRef.current = debrisRef.current.map(d => d.id === debris.id ? { ...d, isActive: false } : d);
          setBackgroundDebris([...debrisRef.current]); // Update state for React
          
          logDebug(`Alien hit debris! Damage: ${damage}, Lives remaining:`, Math.max(0, lives - damage));
        }
      }
    });
    
    // Update collision flash
    if (collisionFlash) {
      setCollisionFlash(false);
    }
    
    // Update collision particles
    setCollisionParticles(prev => 
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 1
      })).filter(particle => particle.life > 0)
    );
    
    // Add score continuously for ADHD assessment
    setScore(prev => prev + 1);
    
    // Render the game immediately after physics update for smooth animation
    renderGame();
    
    // Continue game loop
    if (currentGameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [lives, logDebug, collisionFlash, collisionParticles, updateStars, updateBackgroundDebris, handleObstacleCollision, updateObstacleAnimations, cleanupInactiveDebris, updateDebrisCollisionAnimations]);
  
  // Start game loop
  const startGameLoop = useCallback(() => {
    try {
      logDebug('Starting game loop');
      
      // Check if requestAnimationFrame is available
      if (typeof requestAnimationFrame === 'undefined') {
        console.warn('[FlutterFocus] requestAnimationFrame not available, using setTimeout fallback');
        const fallbackLoop = () => {
          if (gameStateRef.current === 'playing') {
            gameLoop(performance.now());
            setTimeout(fallbackLoop, 16);
          }
        };
        fallbackLoop();
        return;
      }
      
      // Cancel any existing game loop
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = undefined;
      }
      
      lastTimeRef.current = performance.now();
      
      // Start the game loop
      gameLoopRef.current = requestAnimationFrame((timestamp) => {
        try {
          gameLoop(timestamp);
        } catch (error) {
          console.error('[FlutterFocus] Game loop error:', error);
        }
      });
      
      logDebug('Game loop started', { frameId: gameLoopRef.current });
    } catch (error) {
      console.error('[FlutterFocus] Error starting game loop:', error);
    }
  }, [logDebug, gameLoop]);
  
  // Start the game
  const startGame = useCallback(() => {
    logDebug('Starting game...');
    setGameState('countdown');
    setCountdown(3);
    setScore(0);
    setLives(3);
    setLevel(1);
    
    // Reset game objects
    alienRef.current = { x: 100, y: 250, width: 120, height: 92, velocityY: 0 };
    obstaclesRef.current = [];
    obstacleSpawnTimerRef.current = 0;
    
    // Clear any existing obstacles (using new debris system)
    clearExistingObstacles();
    
    // Reset background debris
    setBackgroundDebris([]);
    debrisSpawnTimerRef.current = 0;
    
    // Reset shooting stars
    setShootingStars([]);
    shootingStarSpawnTimerRef.current = 0;

    // Initialize star layers for deep space effect
    initializeStars();
    
    // Load flying saucer sprite
    loadAlienSprite();
    
    // Load explosion sprites
    loadExplosionSprites();

    // Load background debris sprites
    loadBackgroundDebrisSprites();
    
    // Load shooting star sprites (no actual sprites needed, just initialize)
    console.log('[FlutterFocus] Shooting star system initialized');
    
    // Spawn initial debris for testing
    setTimeout(() => {
      console.log('[FlutterFocus] Spawning initial test debris...');
      console.log('[FlutterFocus] Available debris configs:', DEBRIS_CONFIGS);
      console.log('[FlutterFocus] Debris sprites loaded:', Object.keys(debrisSpritesRef.current));
      
      for (let i = 0; i < 3; i++) {
        spawnBackgroundDebris();
      }
      console.log('[FlutterFocus] Initial debris spawned, current count:', debrisRef.current.length);
    }, 1000);
    
    // Reset animation states
    setCollisionFlash(false);
    setCollisionParticles([]);
    
    // Initialize time reference to prevent huge first deltaTime
    lastTimeRef.current = performance.now();
    gameStartTimeRef.current = Date.now();
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          logDebug('Countdown finished, starting game loop');
          setGameState('playing');
          
          setTimeout(() => {
            startGameLoop();
          }, 100);
          
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  }, [logDebug, startGameLoop, initializeStars, loadAlienSprite, loadExplosionSprites, loadBackgroundDebrisSprites, spawnBackgroundDebris, spawnShootingStar, clearExistingObstacles]);
  
  // Post level results to Firebase
  const postLevelResults = useCallback(async () => {
    try {
      const levelData = {
        userId,
        level,
        score,
        lives: 0, // Level ended with 0 lives
        timestamp: new Date().toISOString(),
        gameType: 'FlutterFocus',
        levelStats: {
          finalScore: score,
          livesLost: 3, // All 3 lives were lost
          levelDuration: Date.now() - gameStartTimeRef.current
        }
      };
      
      logDebug('Posting level results to Firebase:', levelData);
      // TODO: Implement Firebase posting logic here
      // await firebase.postLevelResults(levelData);
      
    } catch (error) {
      console.error('[FlutterFocus] Error posting level results:', error);
    }
  }, [userId, score]);
  
  // Calculate ADHD assessment scores
  const calculateReactionTime = useCallback(() => {
    // Simple reaction time calculation based on score and level
    // Higher score = better reaction time
    return Math.max(1, Math.min(10, Math.floor(score / 50)));
  }, [score]);
  
  const calculateImpulseControl = useCallback(() => {
    // Impulse control based on lives lost
    // Fewer lives lost = better impulse control
    return Math.max(1, Math.min(10, 10 - (3 - lives)));
  }, [lives]);
  
  const calculateSustainedAttention = useCallback(() => {
    // Sustained attention based on level reached
    // Higher level = better sustained attention
    return Math.max(1, Math.min(10, levelRef.current * 3));
  }, []);
  
  const calculateOverallScore = useCallback(() => {
    // Overall ADHD score (average of all metrics)
    const reactionTime = calculateReactionTime();
    const impulseControl = calculateImpulseControl();
    const sustainedAttention = calculateSustainedAttention();
    return Math.round((reactionTime + impulseControl + sustainedAttention) / 3);
  }, [calculateReactionTime, calculateImpulseControl, calculateSustainedAttention]);
  
  // Post final ADHD scores to Firebase
  const postFinalResults = useCallback(async () => {
    try {
      const finalData = {
        userId,
        gameType: 'FlutterFocus',
        totalScore: score,
        levelsCompleted: 3,
        timestamp: new Date().toISOString(),
        adhdScores: {
          reactionTime: calculateReactionTime(),
          impulseControl: calculateImpulseControl(),
          sustainedAttention: calculateSustainedAttention(),
          overallScore: calculateOverallScore()
        }
      };
      
      logDebug('Posting final ADHD scores to Firebase:', finalData);
      // TODO: Implement Firebase posting logic here
      // await firebase.postFinalResults(finalData);
      
      // Notify parent component that ADHD assessment is complete
      if (onGameComplete) {
        onGameComplete({
          startTime: gameStartTimeRef.current,
          endTime: Date.now(),
          totalPlayTime: Date.now() - gameStartTimeRef.current,
          gameCompleted: true,
          finalScore: score,
          livesLost: 9, // 3 lives lost per level * 3 levels
          totalCrashes: 9, // Same as lives lost
          totalObstaclesAvoided: 0, // TODO: Track this
          totalObstaclesHit: 9, // Same as crashes
          currentLevel: 3,
          levelsCompleted: 3,
          levelScores: [score], // TODO: Track individual level scores
          levelCompletionTimes: [0], // TODO: Track individual level times
          adhdScores: {
            inattention: calculateSustainedAttention(),
            hyperactivity: calculateImpulseControl(),
            impulsivity: calculateReactionTime(),
            executiveFunction: calculateOverallScore()
          },
          selfReportResponses: {} // No self-report in this game
        });
      }
      
    } catch (error) {
      console.error('[FlutterFocus] Error posting final results:', error);
    }
  }, [userId, score, calculateReactionTime, calculateImpulseControl, calculateSustainedAttention, calculateOverallScore]);
  
  // Start next level
  const startNextLevel = useCallback(() => {
    const nextLevel = levelRef.current + 1;
    logDebug('Starting next level:', nextLevel);
    
    // Safety check - prevent going beyond Level 3
    if (nextLevel > 3) {
      logDebug('Cannot start level beyond 3, ending assessment');
      postFinalResults();
      setGameState('gameComplete');
      return;
    }
    
    // Increment level
    setLevel(nextLevel);
    
    // Reset lives for new level
    setLives(3);
    
    // Keep current score (carries over between levels)
    // setScore stays the same
    
    // Reset alien position
    alienRef.current = { x: 100, y: 250, width: 120, height: 92, velocityY: 0 };
    
    // Reset obstacles
    obstaclesRef.current = [];
    obstacleSpawnTimerRef.current = 0;
    
    // Reset background debris for new level
    setBackgroundDebris([]);
    debrisSpawnTimerRef.current = 0;

    // Reinitialize star layers for new level
    initializeStars();
    
    // Reload flying saucer sprite for new level
    loadAlienSprite();
    
    // Reload explosion sprites for new level
    loadExplosionSprites();

    // Reload background debris sprites for new level
    loadBackgroundDebrisSprites();
    
    // Reset animation states completely - ensure no lingering effects
    setCollisionFlash(false);
    setCollisionParticles([]);
    
    // Force clear any remaining screen effects
    setTimeout(() => {
      setCollisionFlash(false);
      setCollisionParticles([]);
    }, 100);
    
    // Initialize time reference
    lastTimeRef.current = performance.now();
    
    // Start the game immediately for the next level (no countdown)
    logDebug('Starting next level immediately');
    setGameState('playing');
    startGameLoop();
  }, [logDebug, startGameLoop, initializeStars, loadAlienSprite, loadExplosionSprites, loadBackgroundDebrisSprites]);
  
  // Handle jump
  const handleJump = useCallback(() => {
    if (gameState === 'playing') {
      // Make jump velocity time-based for consistency
      alienRef.current.velocityY = -0.8; // Velocity per millisecond
    }
  }, [gameState]);
  
  // Handle up movement
  const handleMoveUp = useCallback(() => {
    if (gameState === 'playing') {
      const alien = alienRef.current;
      // Move up by a fixed amount, but respect boundaries
      alien.y = Math.max(0, alien.y - 20);
      // Reset velocity when manually moving
      alien.velocityY = 0;
    }
  }, [gameState]);
  
  // Handle down movement
  const handleMoveDown = useCallback(() => {
    if (gameState === 'playing') {
      const alien = alienRef.current;
      // Move down by a fixed amount, but respect boundaries
      alien.y = Math.min(500, alien.y + 20);
      // Reset velocity when manually moving
      alien.velocityY = 0;
    }
  }, [gameState]);
  
  // Handle key events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameState === 'playing') {
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        handleJump();
      } else if (event.code === 'ArrowUp') {
        event.preventDefault();
        handleMoveUp();
      } else if (event.code === 'ArrowDown') {
        event.preventDefault();
        handleMoveDown();
      }
    }
  }, [gameState, handleJump, handleMoveUp, handleMoveDown]);
  
  // Render game
  const renderGame = useCallback(() => {
    renderCountRef.current += 1;
    
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    
    // Apply collision flash effect (clean visual feedback for ADHD assessment)
    // No screen shake - maintains focus and measurement accuracy
    if (collisionFlash) {
      ctx.fillStyle = 'rgba(255, 107, 107, 0.3)'; // Semi-transparent red flash
      ctx.fillRect(0, 0, 960, 540);
    }
    
    // Clear canvas
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 960, 540);
    
    // Draw star layers for deep space effect
    
    // Layer 1: Static background stars (dimmest)
    ctx.fillStyle = '#666666';
    starsLayer1Ref.current.forEach(star => {
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    
    // Layer 2: Slow moving stars (medium brightness)
    ctx.fillStyle = '#AAAAAA';
    starsLayer2Ref.current.forEach(star => {
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    
    // Layer 3: Fast moving stars (brightest)
    ctx.fillStyle = '#FFFFFF';
    starsLayer3Ref.current.forEach(star => {
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    
    // Draw background debris behind the ship (z-index 1)
    const debrisBehind = debrisRef.current.filter(debris => debris.zIndex === Z_INDEX_LAYERS.BACKGROUND_DEBRIS && debris.isActive);
    const debrisGameObjects = debrisRef.current.filter(debris => debris.zIndex === Z_INDEX_LAYERS.GAME_OBJECTS && debris.isActive);
    const debrisFront = debrisRef.current.filter(debris => debris.zIndex === Z_INDEX_LAYERS.FOREGROUND_DEBRIS && debris.isActive);
    
    console.log('[FlutterFocus] Rendering debris:', { 
      total: debrisRef.current.length, 
      active: debrisRef.current.filter(d => d.isActive).length,
      behind: debrisBehind.length,
      gameObjects: debrisGameObjects.length,
      front: debrisFront.length,
      spritesLoaded: Object.keys(debrisSpritesRef.current).length,
      backgroundTypes: debrisBehind.map(d => d.type),
      collisionTypes: debrisGameObjects.map(d => d.type)
    });
    
    // Draw debris behind the ship (z-index 1)
    debrisBehind.forEach(debris => {
      const sprite = debrisSpritesRef.current[debris.type];
      if (sprite) {
        ctx.save();
        ctx.translate(debris.x + debris.width / 2, debris.y + debris.height / 2);
        ctx.rotate(debris.rotation * Math.PI / 180);
        ctx.drawImage(sprite, -debris.width / 2, -debris.height / 2, debris.width, debris.height);
        ctx.restore();
      } else {
        // Fallback: draw a colored rectangle if sprite not loaded
        console.warn('[FlutterFocus] Missing sprite for debris type:', debris.type, 'using fallback');
        ctx.save();
        // All b1-b8 are background debris (blue)
        ctx.fillStyle = '#4444FF';
        ctx.fillRect(debris.x, debris.y, debris.width, debris.height);
        ctx.restore();
      }
    });
    
    // Draw alien
    const alien = alienRef.current;
    
    // Draw flying saucer sprite if loaded, otherwise fallback to rectangle
    if (alienSpriteRef.current) {
      // Apply collision flash effect by adjusting brightness
      if (collisionFlash) {
        ctx.filter = 'brightness(1.5) saturate(2) hue-rotate(0deg)';
      }
      
      ctx.drawImage(alienSpriteRef.current, alien.x, alien.y, alien.width, alien.height);
      
      // Reset filter
      ctx.filter = 'none';
    } else {
      // Fallback to rectangle if sprite not loaded
      if (collisionFlash) {
        ctx.fillStyle = '#FF6B6B'; // Red when hit
      } else {
        ctx.fillStyle = '#10B981'; // Green alien
      }
      ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
      
      // Alien eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(alien.x + 20, alien.y + 20, 12, 12);
      ctx.fillRect(alien.x + 48, alien.y + 20, 12, 12);
      
      // Alien pupils
      ctx.fillStyle = '#000000';
      ctx.fillRect(alien.x + 24, alien.y + 24, 4, 4);
      ctx.fillRect(alien.x + 52, alien.y + 24, 4, 4);
    }
    
    // Draw obstacles with collision animations
    obstaclesRef.current.forEach((obstacle) => {
      // Draw obstacle only if not exploding (explosion sprites will be drawn on top)
      if (obstacle.collisionState !== 'exploding') {
        ctx.save();
        
        // Draw obstacle with appropriate color
        if (obstacle.collisionState === 'hit') {
          ctx.fillStyle = '#FF4444'; // Red when hit
        } else {
          ctx.fillStyle = '#F97316'; // Normal orange
        }
        
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.restore();
      }
      
      // Draw explosion sprite on top (topmost layer)
      if (obstacle.collisionState === 'exploding' && explosionSpritesRef.current.length > 0 && obstacle.explosionFrame !== undefined) {
        const sprite = explosionSpritesRef.current[obstacle.explosionFrame];
        if (sprite && obstacle.explosionX !== undefined && obstacle.explosionY !== undefined) {
          // Center the explosion sprite on the collision point
          const spriteWidth = 80; // Adjust size as needed
          const spriteHeight = 80;
          ctx.drawImage(
            sprite,
            obstacle.explosionX - spriteWidth / 2,
            obstacle.explosionY - spriteHeight / 2,
            spriteWidth,
            spriteHeight
          );
        }
      }
    });
    
    // Draw game objects debris (z-index 2) - collision debris
    debrisGameObjects.forEach(debris => {
      const sprite = debrisSpritesRef.current[debris.type];
      if (sprite) {
        ctx.save();
        ctx.translate(debris.x + debris.width / 2, debris.y + debris.height / 2);
        ctx.rotate(debris.rotation * Math.PI / 180);
        ctx.drawImage(sprite, -debris.width / 2, -debris.height / 2, debris.width, debris.height);
        ctx.restore();
      } else {
        // Fallback: draw a colored rectangle if sprite not loaded
        console.warn('[FlutterFocus] Missing sprite for debris type:', debris.type, 'using fallback');
        ctx.save();
        // Collision debris fallback (red with white border)
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(debris.x, debris.y, debris.width, debris.height);
        
        // Add collision indicator
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(debris.x, debris.y, debris.width, debris.height);
        ctx.restore();
      }
    });
    
    // Draw background debris in front of the ship (z-index 3)
    debrisFront.forEach(debris => {
      const sprite = debrisSpritesRef.current[debris.type];
      if (sprite) {
        ctx.save();
        ctx.translate(debris.x + debris.width / 2, debris.y + debris.height / 2);
        ctx.rotate(debris.rotation * Math.PI / 180);
        ctx.drawImage(sprite, -debris.width / 2, -debris.height / 2, debris.width, debris.height);
        ctx.restore();
      } else {
        // Fallback: draw a colored rectangle if sprite not loaded
        console.warn('[FlutterFocus] Missing sprite for debris type:', debris.type, 'using fallback');
        ctx.save();
        // Color based on collision status and type
        let color = '#4444FF'; // Default blue for background
        if (debris.hasCollision) {
          color = (debris.type === 'b5' || debris.type === 'b6') ? '#FF8800' : '#FF4444'; // Orange for rotating (b5, b6), red for static (b7, b8)
        }
        ctx.fillStyle = color;
        ctx.fillRect(debris.x, debris.y, debris.width, debris.height);
        
        // Add collision indicator if debris has collision
        if (debris.hasCollision) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.strokeRect(debris.x, debris.y, debris.width, debris.height);
        }
        ctx.restore();
      }
    });
    
    // Draw shooting stars
    shootingStarsRef.current.forEach(star => {
      ctx.save();
      ctx.globalAlpha = star.alpha;
      
      // Draw shooting star trail (line with gradient)
      const endX = star.x - Math.cos(star.angle) * star.length;
      const endY = star.y + Math.sin(star.angle) * star.length;
      
      // Create gradient for the trail
      const gradient = ctx.createLinearGradient(star.x, star.y, endX, endY);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); // Bright at start
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)'); // Medium brightness
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)'); // Fading
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)'); // Transparent at end
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      // Draw the trail
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Draw bright head of the shooting star
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(star.x, star.y, 2, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.restore();
    });
    
    // Draw collision particles
    if (collisionParticles.length > 0) {
      ctx.fillStyle = '#FF6B6B';
      collisionParticles.forEach(particle => {
        const alpha = particle.life / 30; // Fade out over time
        ctx.globalAlpha = alpha;
        ctx.fillRect(particle.x, particle.y, 4, 4);
      });
      ctx.globalAlpha = 1; // Reset alpha
    }
    
    // Draw UI - only level (score and lives are in the overlay)
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '24px Arial';
    ctx.fillText(`Level: ${level}`, 20, 40);
    
          // Collision flash effect applied
  }, [gameState, level, logDebug, collisionFlash, collisionParticles, debrisRef]);
  
  // Monitor game state changes
  useEffect(() => {
    logDebug('Game state changed', { newState: gameState });
  }, [gameState, logDebug]);
  
  // Monitor debris state for debugging
  useEffect(() => {
    console.log('[FlutterFocus] Debris state changed:', {
      count: debrisRef.current.length,
      active: debrisRef.current.filter(d => d.isActive).length,
      debris: debrisRef.current.map(d => ({ id: d.id, x: d.x, y: d.y, type: d.type, isActive: d.isActive }))
    });
  }, [debrisRef]);
  
  // Remove separate render interval - game loop will handle rendering
  // This eliminates conflicts between game loop and render loop
  // Key improvements for smoothness:
  // 1. Time-based movement (not frame-based)
  // 2. Single game loop handles both physics and rendering
  // 3. Consistent deltaTime handling
  // 4. No competing render intervals
  
  // Set up event listeners
  useEffect(() => {
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Add window focus/blur listeners
    const handleFocus = () => {};
    const handleBlur = () => {};
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown]);
  
  // Cleanup game loop
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);
  

  
  // Render instructions
  if (gameState === 'instructions') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white min-h-[600px]">
        <h1 className="text-3xl font-bold mb-6 text-green-400">Flutter Focus: The Galaxy Hopper</h1>
        
        <div className="max-w-2xl text-center space-y-4 mb-8">
          <p className="text-lg">
            Navigate your alien through space, dodging obstacles across 3 challenging levels.
          </p>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Controls</h2>
            <p>Click or tap to make your alien jump and avoid obstacles!</p>
            <div className="text-sm text-gray-400 mt-2 space-y-1">
              <p>• SPACEBAR or CLICK to jump</p>
              <p>• ↑ ARROW UP to move up</p>
              <p>• ↓ ARROW DOWN to move down</p>
            </div>
          </div>
          
                      <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Assessment Structure</h2>
              <div className="text-sm text-gray-400 space-y-1">
                <p>• Each level gets progressively harder!</p>
                <p>• Results posted to Firebase after each level</p>
                <p>• <strong>Assessment ends after Level 3 - no replay</strong></p>
              </div>
            </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={startGame}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Start Game
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Render countdown
  if (gameState === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white min-h-[600px]">
        <div className="text-8xl font-bold text-green-400 mb-4">
          {countdown}
        </div>
        <p className="text-xl text-gray-300">Get ready to navigate the galaxy!</p>
      </div>
    );
  }
  
  // Render level complete
  if (gameState === 'levelComplete') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white min-h-[600px] text-center">
        <h1 className="text-3xl font-bold mb-6 text-green-400">Level {levelRef.current} Complete!</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6 text-center">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Level Results</h2>
          <div className="text-4xl font-bold text-green-400 mb-2">{score}</div>
          <p className="text-gray-300">Level Score</p>
        </div>
        
        <button
          onClick={startNextLevel}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
        >
          Play Level {levelRef.current + 1}
        </button>
      </div>
    );
  }
  
  // Render game complete (all 3 levels finished) - END OF ASSESSMENT
  // No more gameplay options - assessment is complete
  if (gameState === 'gameComplete') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white min-h-[600px] text-center">
        <h1 className="text-3xl font-bold mb-6 text-green-400">🎉 Assessment Complete! 🎉</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6 text-center">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Assessment Results</h2>
          <div className="text-4xl font-bold text-green-400 mb-2">{score}</div>
          <p className="text-gray-300">Final Performance Score</p>
          <p className="text-gray-300">All 3 assessment levels completed!</p>
          <p className="text-gray-300 mt-2">ADHD evaluation finished!</p>
        </div>
        
        <div className="text-center text-gray-400 text-sm">
          <p>Thank you for completing the ADHD assessment.</p>
          <p>Your results have been recorded and analyzed.</p>
          <p className="mt-2 text-blue-400">Assessment Complete - No Further Action Required</p>
          <p className="mt-1 text-xs">This concludes your evaluation session.</p>
        </div>
      </div>
    );
  }
  
  // Render game over
  if (gameState === 'gameOver') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white min-h-[600px]">
        <h1 className="text-3xl font-bold mb-6 text-red-400">Game Over!</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Final Score</h2>
          <div className="text-4xl font-bold text-green-400 mb-2">{score}</div>
        </div>
        
        <button
          onClick={() => setGameState('instructions')}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
        >
          Play Again
        </button>
      </div>
    );
  }
  
  // Render game canvas
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        onClick={handleJump}
        className="cursor-pointer border border-gray-600"
        style={{ width, height }}
      />
      
      {/* Game overlay */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
        <div className="text-center space-y-2">
          <div>
            <div className="text-2xl font-bold text-green-400">{score}</div>
            <div className="text-sm">Score</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-400">{lives}</div>
            <div className="text-sm">Lives</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FlutterFocusGame; 