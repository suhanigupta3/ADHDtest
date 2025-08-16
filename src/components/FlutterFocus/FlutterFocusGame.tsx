import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FlutterFocusGameProps, Debris, DebrisConfig, DebrisType, DebrisSize, DebrisSpeed, DebrisRotationSpeed, ShootingStar, SaturnRingParticle } from './types';
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
  SHOOTING_STAR_SPEEDS,
  QUESTIONS
} from './constants';
import { db } from '../../firebase/config';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import GameStateManager from './GameStateManager';


/**
 * FlutterFocusGame - ADHD Assessment Game
 * 
 * Game Flow:
 * 1. Instructions → Level 1 (3 lives)
 * 2. Level 1 Complete → Level 2 (3 lives) 
 * 3. Level 2 Complete → Level 3 (3 lives)
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
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'gameOver' | 'levelComplete' | 'gameComplete'>('instructions');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  // Clean collision feedback - no screen shake for ADHD assessment accuracy
  const [collisionFlash, setCollisionFlash] = useState(false);
  const [collisionParticles, setCollisionParticles] = useState<Array<{x: number, y: number, vx: number, vy: number, life: number}>>([]);
  
  // Level transition state
  const [transitionData, setTransitionData] = useState<{
    type: 'level-complete' | 'game-over';
    level?: number;
    score: number;
    time: number;
    debrisAvoided: number;
    totalDebris: number;
    livesLost: number;
  } | null>(null);
  
  // Self-reporting questions state - removed for post-game flow
  const [questionResponses, setQuestionResponses] = useState<{ [key: string]: number }>({});
  
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
  
  // Sync gameStateRef with gameState
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  
  // Use ref to track current level to avoid stale closures
  const levelRef = useRef(level);
  
  // Sync levelRef with level state
  useEffect(() => {
    levelRef.current = level;
  }, [level]);
  
  // Game objects
  const alienRef = useRef({ x: 100, y: 270, width: 120, height: 92, velocityY: 0 });
  const obstaclesRef = useRef<Array<{ x: number; y: number; width: number; height: number; type: string; collisionState?: 'normal' | 'hit' | 'exploding' | 'removing'; collisionTimer?: number; rotation?: number; scale?: number; alpha?: number; explosionFrame?: number; explosionX?: number; explosionY?: number }>>([]);
  const obstacleSpawnTimerRef = useRef(0);
  const gameStartTimeRef = useRef(Date.now());
  
  // Level tracking variables
  const levelStartTimeRef = useRef(Date.now());
  const levelLivesLostRef = useRef(0);
  const levelDebrisHitRef = useRef(0);
  const levelDebrisSpawnedRef = useRef(0);
  const levelReactionTimeRef = useRef(0);
  const levelScoreRef = useRef(0);
  
  // Track all levels data
  const allLevelsDataRef = useRef<Array<{
    level: number;
    score: number;
    livesLost: number;
    debrisHit: number;
    debrisSpawned: number;
    debrisAvoided: number;
    duration: number;
    reactionTime: number;
    startTime: number;
  }>>([]);
  
  // Update level score ref when score state changes
  useEffect(() => {
    // Ensure game score cannot be negative
    const validScore = Math.max(0, score);
    levelScoreRef.current = validScore;
  }, [score]);
  
  // Track lives lost for current level
  const [levelLivesLost, setLevelLivesLost] = useState(0);
  
  useEffect(() => {
    if (lives < 3) {
      const lost = 3 - lives;
      setLevelLivesLost(lost);
      levelLivesLostRef.current = lost;
    }
  }, [lives]);
  
  // Track reaction times for current level
  const reactionTimesRef = useRef<number[]>([]);
  const obstacleSpawnTimesRef = useRef<Map<string, number>>(new Map());
  
  // Function to record a reaction time when player responds to obstacles/debris
  const recordReactionTime = useCallback((obstacleId: string) => {
    const spawnTime = obstacleSpawnTimesRef.current.get(obstacleId);
    if (spawnTime) {
      const reactionTime = Date.now() - spawnTime;
      reactionTimesRef.current.push(reactionTime);
      
      // Calculate average reaction time for this level
      const totalReactionTime = reactionTimesRef.current.reduce((sum, time) => sum + time, 0);
      levelReactionTimeRef.current = reactionTimesRef.current.length > 0 ? totalReactionTime / reactionTimesRef.current.length : 0;
      
      // Remove the spawn time after recording
      obstacleSpawnTimesRef.current.delete(obstacleId);
    }
  }, []);
  
  // Function to mark when obstacles/debris spawn (for reaction time measurement)
  const markObstacleSpawn = useCallback((obstacleId: string) => {
    obstacleSpawnTimesRef.current.set(obstacleId, Date.now());
  }, []);
  
  // Star layers for deep space effect
  const starsLayer1Ref = useRef<Array<{x: number, y: number, size: number, brightness?: number, name?: string, twinkleSpeed?: number, twinklePhase?: number, shouldTwinkle?: boolean}>>([]);
  const starsLayer2Ref = useRef<Array<{x: number, y: number, size: number, brightness?: number, twinkleSpeed?: number, twinklePhase?: number, shouldTwinkle?: boolean}>>([]);
  const starsLayer3Ref = useRef<Array<{x: number, y: number, size: number, brightness?: number, twinkleSpeed?: number, twinklePhase?: number, shouldTwinkle?: boolean}>>([]);
  
  // Planets and celestial objects
  const planetsRef = useRef<Array<{x: number, y: number, size: number, type: string, color: string, name: string}>>([]);
  
  // Flying saucer sprite
  const alienSpriteRef = useRef<HTMLImageElement | null>(null);
  
  // Background debris sprites
  const debrisSpritesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  
  // Explosion sprite sequence
  const explosionSpritesRef = useRef<HTMLImageElement[]>([]);
  
  // Debug logging - disabled to reduce console spam
  const logDebug = useCallback((message: string, data?: any) => {
    // console.log(`[FlutterFocus] ${message}`, data || '');
  }, []);
  

  
  // Initialize star layers and celestial objects
  const initializeStars = useCallback(() => {
    // Layer 1: Static stars (background) - varied sizes and brightness with twinkling
    starsLayer1Ref.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * 960,
      y: Math.random() * 540,
      size: Math.random() * 2.0 + 0.8, // 0.8 to 2.8 pixels - smaller, more star-like
      brightness: Math.random() * 0.5 + 0.3, // 0.3 to 0.8 alpha
      twinkleSpeed: Math.random() * 0.02 + 0.01, // Twinkling speed
      twinklePhase: Math.random() * Math.PI * 2, // Random starting phase
      shouldTwinkle: Math.random() < 0.3 // 30% of stars twinkle
    }));
    
    // Layer 2: Slow moving stars (medium brightness) - varied sizes with some twinkling
    starsLayer2Ref.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * 960,
      y: Math.random() * 540,
      size: Math.random() * 1.8 + 0.6, // 0.6 to 2.4 pixels
      brightness: Math.random() * 0.6 + 0.4, // 0.4 to 1.0 alpha
      twinkleSpeed: Math.random() * 0.015 + 0.008, // Slower twinkling
      twinklePhase: Math.random() * Math.PI * 2,
      shouldTwinkle: Math.random() < 0.4 // 40% of stars twinkle
    }));
    
    // Layer 3: Fast moving stars (brightest) - varied sizes with more twinkling
    starsLayer3Ref.current = Array.from({ length: 40 }, () => ({
      x: Math.random() * 960,
      y: Math.random() * 540,
      size: Math.random() * 1.5 + 0.5, // 0.5 to 2.0 pixels
      brightness: Math.random() * 0.7 + 0.3, // 0.3 to 1.0 alpha
      twinkleSpeed: Math.random() * 0.025 + 0.015, // Faster twinkling
      twinklePhase: Math.random() * Math.PI * 2,
      shouldTwinkle: Math.random() < 0.6 // 60% of stars twinkle
    }));
    
    // Add some larger, brighter stars (like Sirius, Vega, etc.) with strong twinkling
    const brightStars = [
      { x: 150, y: 80, size: 3.0, brightness: 1.0, name: 'Sirius', twinkleSpeed: 0.03, twinklePhase: 0, shouldTwinkle: true },
      { x: 800, y: 120, size: 2.8, brightness: 0.9, name: 'Vega', twinkleSpeed: 0.025, twinklePhase: Math.PI/4, shouldTwinkle: true },
      { x: 450, y: 400, size: 2.6, brightness: 0.85, name: 'Arcturus', twinkleSpeed: 0.02, twinklePhase: Math.PI/2, shouldTwinkle: true },
      { x: 700, y: 450, size: 2.4, brightness: 0.8, name: 'Capella', twinkleSpeed: 0.035, twinklePhase: Math.PI, shouldTwinkle: true },
      { x: 200, y: 480, size: 2.9, brightness: 0.95, name: 'Rigel', twinkleSpeed: 0.04, twinklePhase: Math.PI*3/4, shouldTwinkle: true }
    ];
    
    // Add bright stars to layer 1
    brightStars.forEach(star => {
      starsLayer1Ref.current.push(star);
    });
    
    // Add planets and celestial objects
    const planets = [
      { x: 50, y: 150, size: 25, type: 'gas_giant', color: '#FFB366', name: 'Jupiter' },
      { x: 850, y: 300, size: 18, type: 'ice_giant', color: '#87CEEB', name: 'Neptune' },
      { x: 300, y: 50, size: 15, type: 'terrestrial', color: '#CD853F', name: 'Mars' },
      { x: 750, y: 80, size: 20, type: 'gas_giant', color: '#F4A460', name: 'Saturn' }
    ];
    
    // Store planets for rendering (using a ref instead of window)
    if (!planetsRef.current) {
      planetsRef.current = planets;
    }
  }, []);
  
  // Load flying saucer sprite
  const loadAlienSprite = useCallback(() => {
    const img = new Image();
    img.onload = () => {
      alienSpriteRef.current = img;
      // logDebug('Flying saucer sprite loaded successfully');
    };
    img.onerror = () => {
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
        // Failed to load explosion sprite
      };
      img.src = `/FlutterFocus/explosions/e${i}.png`;
      sprites.push(img);
    }
  }, [logDebug]);
  
  // Clear existing obstacles since we're using the new debris system
  const clearExistingObstacles = useCallback(() => {
    obstaclesRef.current = [];
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
    // 135° = 3π/4 radians, creates movement from top-right to bottom-left
    const angle = 3 * Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 6; // 135° ± 15° (top-right to bottom-left)
    
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
  }, []);

  // Update shooting stars - move from top-right to bottom-left
  const updateShootingStars = useCallback((deltaTime: number) => {
    shootingStarsRef.current = shootingStarsRef.current
      .map(star => ({
        ...star,
        x: star.x + Math.cos(star.angle) * star.speed, // Move left (negative cos for 135°)
        y: star.y + Math.sin(star.angle) * star.speed, // Move down (positive sin for 135°)
        life: star.life - 1,
        alpha: star.life / star.maxLife // Fade out over time
      }))
      .filter(star => star.life > 0 && star.x > -star.length && star.y < CANVAS_HEIGHT + star.length); // Remove dead or off-screen stars
    
    // Update React state to keep it in sync
    setShootingStars([...shootingStarsRef.current]);
    
    // Debug: log shooting star count - disabled to reduce console spam
    // if (shootingStarsRef.current.length > 0 && Math.random() < 0.05) { // Log 5% of the time
    //   console.log('[FlutterFocus] Shooting stars update:', { 
    //     count: shootingStarsRef.current.length,
    //     firstStar: shootingStarsRef.current[0] ? { 
    //       x: Math.round(shootingStarsRef.current[0].x), 
    //       y: Math.round(shootingStarsRef.current[0].y),
    //       life: shootingStarsRef.current[0].life 
    //     } : null 
    //   });
    // }
  }, []);
  
  // Load background debris sprites
  const loadBackgroundDebrisSprites = useCallback(() => {
    const backgroundDebrisTypes = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'];
    const collisionDebrisTypes = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'd14', 'd15', 'd16', 'd17', 'd18', 'd19', 'd20', 'd21', 'd22', 'd23'];
    const allDebrisTypes = [...backgroundDebrisTypes, ...collisionDebrisTypes];
    let loadedCount = 0;
    
    allDebrisTypes.forEach(type => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        debrisSpritesRef.current[type] = img;
        if (loadedCount === allDebrisTypes.length) {
          // logDebug('All debris sprites loaded successfully');
        }
      };
      img.onerror = () => {
        // Failed to load debris sprite
      };
      
      // Load from different folders based on type
      if (backgroundDebrisTypes.includes(type)) {
        img.src = `/FlutterFocus/debrisBackground/${type}.png`;
      } else {
        img.src = `/FlutterFocus/debris/${type}.png`;
      }
    });
  }, [logDebug]);
  
  // Update star positions and twinkling
  const updateStars = useCallback((deltaTime: number) => {
    // Layer 2: Slow movement (right to left) with twinkling
    starsLayer2Ref.current.forEach(star => {
      star.x -= 0.02 * deltaTime; // Slow movement
      if (star.x < -10) star.x = 970; // Wrap around
      
      // Update twinkling phase
      if (star.shouldTwinkle && star.twinkleSpeed && star.twinklePhase !== undefined) {
        star.twinklePhase += star.twinkleSpeed * deltaTime;
      }
    });
    
    // Layer 3: Fast movement (right to left) with twinkling
    starsLayer3Ref.current.forEach(star => {
      star.x -= 0.05 * deltaTime; // Fast movement
      if (star.x < -10) star.x = 970; // Wrap around
      
      // Update twinkling phase
      if (star.shouldTwinkle && star.twinkleSpeed && star.twinklePhase !== undefined) {
        star.twinklePhase += star.twinkleSpeed * deltaTime;
      }
    });
    
    // Update twinkling for static stars (Layer 1)
    starsLayer1Ref.current.forEach(star => {
      if (star.shouldTwinkle && star.twinkleSpeed && star.twinklePhase !== undefined) {
        star.twinklePhase += star.twinkleSpeed * deltaTime;
      }
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
      collisionDamage: selectedConfig.collisionDamage,
      // Initialize collision animation properties
      collisionState: 'normal',
      collisionTimer: 0,
      explosionFrame: 0,
      explosionX: 0,
      explosionY: 0
    };

    // Mark obstacle spawn for reaction time tracking
    markObstacleSpawn(newDebris.id);
    
    // Count collision debris spawns (only debris that can actually hit the player)
    if (newDebris.hasCollision) {
      levelDebrisSpawnedRef.current += 1;
    }
    
    debrisRef.current = [...debrisRef.current, newDebris]; // Update ref directly
    setBackgroundDebris([...debrisRef.current]); // Update state for React
  }, []);
  
  // Update background debris positions and rotation
  const updateBackgroundDebris = useCallback((deltaTime: number) => {
    // Move all debris
    debrisRef.current = debrisRef.current.map(debris => ({
        ...debris,
        x: debris.x - DEBRIS_SPEEDS[debris.speed], // Move by speed per frame
        // Only rotate if rotation speed is not 'none'
        rotation: debris.rotationSpeed === 'none' ? debris.rotation : debris.rotation + DEBRIS_ROTATION_SPEEDS[debris.rotationSpeed]
    }));
    
    // Record reaction time for debris that go off-screen (successful avoidance)
    debrisRef.current.forEach(debris => {
      if (debris.x <= -debris.width && obstacleSpawnTimesRef.current.has(debris.id)) {
        recordReactionTime(debris.id);
      }
    });
    
    // Filter out debris that are off-screen or inactive
    debrisRef.current = debrisRef.current.filter(debris => debris.x > -debris.width && debris.isActive);
    
    // Update React state to keep it in sync
    setBackgroundDebris([...debrisRef.current]);
    

  }, [recordReactionTime]);
  
  // Clean up inactive debris to prevent memory issues
  const cleanupInactiveDebris = useCallback(() => {
    // Remove debris that are no longer active (already tracked in updateBackgroundDebris)
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
    // Track debris collision for ADHD assessment
    levelDebrisHitRef.current += 1;
    
    // Record reaction time for this collision (player failed to avoid)
    if (obstacleSpawnTimesRef.current.has(debris.id)) {
      recordReactionTime(debris.id);
    }

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
    
    // console.log('[FlutterFocus] Debris collision animation started:', { 
    //   debrisId: debris.id, 
    //   collisionPoint: { x: Math.round(collisionX), y: Math.round(collisionY) } 
    // });
  }, []);
  
  // Update obstacle collision animations
  const updateObstacleAnimations = useCallback((deltaTime: number) => {
    obstaclesRef.current.forEach(obstacle => {
      if (obstacle.collisionState === 'exploding' && obstacle.collisionTimer !== undefined) {
        obstacle.collisionTimer += deltaTime;
        
        // Much slower explosion animation - 7 frames over 7000ms = ~1000ms per frame
        const frameTime = 1000; // 5x longer explosions for dramatic effect
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
        
        // Much slower explosion animation - 7 frames over 7000ms = ~1000ms per frame
        const frameTime = 1000; // 5x longer explosions for dramatic effect
        const frameIndex = Math.floor(debris.collisionTimer / frameTime);
        debris.explosionFrame = Math.min(frameIndex, 6); // Cap at frame 6 (e7.png)
        
        // Mark debris for removal after e5.png (frame 4) for better visual flow
        if (debris.explosionFrame >= 4) {
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
      return;
    }
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    // Protect against extreme deltaTime values (first frame or lag)
    const clampedDeltaTime = Math.min(deltaTime, 100); // Max 100ms per frame for physics
    const explosionDeltaTime = Math.min(deltaTime, 1000); // Max 1000ms for explosions to allow longer durations
    
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
    
    // Safety check: if alien somehow gets stuck outside bounds, respawn it
    if (alien.x < 0 || alien.x > 960 || alien.y < 0 || alien.y > 540) {
      alienRef.current = { x: 100, y: 250, width: 120, height: 92, velocityY: 0 };
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
    updateObstacleAnimations(explosionDeltaTime);

    // Update debris collision animations
    updateDebrisCollisionAnimations(explosionDeltaTime);

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
    debrisSpawnTimerRef.current += clampedDeltaTime; // Use actual time instead of frame counter
    const debrisSpawnInterval = DEBRIS_SPAWN_INTERVAL_MIN + Math.random() * (DEBRIS_SPAWN_INTERVAL_MAX - DEBRIS_SPAWN_INTERVAL_MIN); // 2-4 seconds
    

    
    if (debrisSpawnTimerRef.current > debrisSpawnInterval && debrisRef.current.length < DEBRIS_MAX_ON_SCREEN) {
      debrisSpawnTimerRef.current = 0;
      
      // Spawn 2-3 pieces of debris at a time for more engaging background
      // This creates a more dynamic space environment
      const debrisCount = Math.random() < 0.7 ? 2 : 3;
      
            // console.log('[FlutterFocus] Attempting to spawn debris:', { 
      //   count: debrisCount, 
      //   timer: debrisSpawnTimerRef.current, 
      //   interval: debrisSpawnInterval, 
      //   currentDebris: debrisRef.current.length, 
      //   maxDebris: DEBRIS_MAX_ON_SCREEN 
      // });
      
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
      
              // console.log('[FlutterFocus] Shooting star spawned in game loop');
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
              
            // Save level results before proceeding
            postLevelResults();
            
            if (levelRef.current < 3) {
              // Move to next level (user gets 3 more lives)
              // console.log('[FlutterFocus] Moving to next level, setting state to levelComplete');
              setGameState('levelComplete');
            } else {
              // All 3 levels complete - trigger onGameComplete for self-report flow
              // console.log('[FlutterFocus] All levels complete, triggering onGameComplete for self-report flow');
              
              // Ensure Level 3 data is saved to allLevelsDataRef before calling onGameComplete
              const debrisAvoided = Math.max(0, levelDebrisSpawnedRef.current - levelDebrisHitRef.current);
              const validScore = Math.max(0, levelScoreRef.current);
              const validDuration = Math.max(0, Date.now() - levelStartTimeRef.current);
              const validReactionTime = Math.max(0, levelReactionTimeRef.current);
              
              const level3Data = {
                level: 3,
                score: validScore,
                livesLost: Math.max(0, levelLivesLostRef.current),
                debrisHit: Math.max(0, levelDebrisHitRef.current),
                debrisSpawned: Math.max(0, levelDebrisSpawnedRef.current),
                debrisAvoided: debrisAvoided,
                duration: validDuration,
                reactionTime: validReactionTime,
                startTime: levelStartTimeRef.current
              };
              
              // Save Level 3 data to the tracking array
              allLevelsDataRef.current[2] = level3Data;
              console.log('[FlutterFocus] Level 3 data saved before onGameComplete:', level3Data);
              
              if (onGameComplete) {
                // Debug: Log the current state of allLevelsDataRef
                console.log('[FlutterFocus] Debug - allLevelsDataRef contents:', allLevelsDataRef.current);
                console.log('[FlutterFocus] Debug - Level 1 data:', allLevelsDataRef.current[0]);
                console.log('[FlutterFocus] Debug - Level 2 data:', allLevelsDataRef.current[1]);
                console.log('[FlutterFocus] Debug - Level 3 data:', allLevelsDataRef.current[2]);
                
                // Aggregate data from all completed levels
                const allLevels = allLevelsDataRef.current.filter(level => level !== undefined);
                console.log('[FlutterFocus] Debug - Filtered levels:', allLevels);
                
                const totalScore = allLevels.reduce((sum, level) => sum + (level?.score || 0), 0);
                const totalLivesLost = allLevels.reduce((sum, level) => sum + (level?.livesLost || 0), 0);
                const totalDebrisHit = allLevels.reduce((sum, level) => sum + (level?.debrisHit || 0), 0);
                const totalDebrisAvoided = allLevels.reduce((sum, level) => sum + (level?.debrisAvoided || 0), 0);
                
                console.log('[FlutterFocus] Debug - Calculated totals:', {
                  totalScore,
                  totalLivesLost,
                  totalDebrisHit,
                  totalDebrisAvoided
                });
                
                // Build level scores, completion times, and reaction times arrays
                const levelScores = [];
                const levelCompletionTimes = [];
                const levelReactionTimes = [];
                for (let i = 1; i <= 3; i++) {
                  const levelData = allLevelsDataRef.current[i - 1];
                  if (levelData) {
                    levelScores.push(levelData.score);
                    levelCompletionTimes.push(levelData.duration);
                    levelReactionTimes.push(levelData.reactionTime);
                  } else {
                    levelScores.push(0);
                    levelCompletionTimes.push(0);
                    levelReactionTimes.push(0);
                  }
                }
                
                // Calculate average reaction time across all levels
                const validReactionTimes = levelReactionTimes.filter(time => time > 0);
                const averageReactionTime = validReactionTimes.length > 0 
                  ? validReactionTimes.reduce((sum, time) => sum + time, 0) / validReactionTimes.length 
                  : 0;
                
                console.log('[FlutterFocus] Debug - Final arrays:', {
                  levelScores,
                  levelCompletionTimes,
                  levelReactionTimes,
                  averageReactionTime
                });
                
                onGameComplete({
                  startTime: gameStartTimeRef.current,
                  endTime: Date.now(),
                  totalPlayTime: Date.now() - gameStartTimeRef.current,
                  gameCompleted: true,
                  finalScore: totalScore,
                  livesLost: totalLivesLost,
                  totalCrashes: totalDebrisHit,
                  totalObstaclesAvoided: totalDebrisAvoided,
                  totalObstaclesHit: totalDebrisHit,
                  currentLevel: 3,
                  levelsCompleted: 3,
                  levelScores: levelScores,
                  levelCompletionTimes: levelCompletionTimes,
                  adhdScores: calculateAllADHDScores(),
                  selfReport: { ...questionResponses }
                });
              }
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
          
          // DO NOT reset alien position - just show collision effects
          // Alien stays where it is, only loses life
          
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
    } else {
      console.log('[FlutterFocus] Game loop not continuing - state:', currentGameState, 'level:', levelRef.current);
    }
  }, [lives, logDebug, collisionFlash, collisionParticles, updateStars, updateBackgroundDebris, handleObstacleCollision, updateObstacleAnimations, cleanupInactiveDebris, updateDebrisCollisionAnimations, handleDebrisCollision]);
  
  // Start game loop
  const startGameLoop = useCallback(() => {
    try {
      // Only start game loop if game is actually in playing state
      if (gameStateRef.current !== 'playing') {
        // logDebug('Not starting game loop - game not in playing state:', gameStateRef.current);
        return;
      }
      
      // Prevent multiple game loops from running, but allow restarting if needed
      if (gameLoopRef.current) {
        console.log('[FlutterFocus] Game loop already has reference, canceling previous:', gameLoopRef.current);
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = undefined;
      }
      
      // logDebug('Starting game loop');
      
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
      
      lastTimeRef.current = performance.now();
      
      // Start the game loop
      gameLoopRef.current = requestAnimationFrame((timestamp) => {
        try {
          gameLoop(timestamp);
        } catch (error) {
          console.error('[FlutterFocus] Game loop error:', error);
        }
      });
      
      console.log('[FlutterFocus] Game loop started, frameId:', gameLoopRef.current, 'level:', levelRef.current, 'state:', gameStateRef.current);
    } catch (error) {
      console.error('[FlutterFocus] Error starting game loop:', error);
    }
  }, [logDebug, gameLoop]);
  
  // Start the game
  const startGame = useCallback(() => {
    // logDebug('Starting game...');
    // Skip countdown and go directly to playing state
    setGameState('playing');
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
    // console.log('[FlutterFocus] Shooting star system initialized');
    
    // Spawn initial debris
    setTimeout(() => {
      // console.log('[FlutterFocus] Spawning initial debris...');
      // console.log('[FlutterFocus] Available debris configs:', DEBRIS_CONFIGS);
      // console.log('[FlutterFocus] Debris sprites loaded:', Object.keys(debrisSpritesRef.current));
      
      for (let i = 0; i < 3; i++) {
        spawnBackgroundDebris();
      }
      // console.log('[FlutterFocus] Initial debris spawned, current count:', debrisRef.current.length);
    }, 1000);
    
    // Reset animation states
    setCollisionFlash(false);
    setCollisionParticles([]);
    
    // Initialize time reference to prevent huge first deltaTime
    lastTimeRef.current = performance.now();
    gameStartTimeRef.current = Date.now();
    
    // Start the game loop immediately instead of waiting for countdown
    setTimeout(() => {
      // logDebug('Starting game loop immediately');
      startGameLoop();
    }, 100);
  }, []); // Empty dependency array since this should only run once when component mounts
  
  // Calculate ADHD assessment scores based on real gameplay performance
  // All functions return ADHD scores: lower = better performance, higher = worse ADHD
  const calculateReactionTime = useCallback(() => {
    // Calculate reaction time score based on aggregated data from all levels
    const allLevels = allLevelsDataRef.current.filter(level => level !== undefined);
    
    // Debug: Log what data we're working with - disabled to reduce console spam
    // console.log('[FlutterFocus] calculateReactionTime - allLevelsDataRef:', allLevelsDataRef.current);
    // console.log('[FlutterFocus] calculateReactionTime - filtered levels:', allLevels);
    
    const totalReactionTime = allLevels.reduce((sum, level) => sum + (level?.reactionTime || 0), 0);
    const averageReactionTime = allLevels.length > 0 ? totalReactionTime / allLevels.length : 0;
    
    // If no reaction time data, calculate based on aggregated score and debris avoidance
    if (averageReactionTime === 0) {
      const totalScore = allLevels.reduce((sum, level) => sum + (level?.score || 0), 0);
      const totalDebrisAvoided = allLevels.reduce((sum, level) => sum + (level?.debrisAvoided || 0), 0);
      
      // Higher score and more debris avoided = better reaction time (lower ADHD score)
      let score = 5; // neutral base
      if (totalScore > 3000) score -= 2; // High total score across all levels (was 2400)
      else if (totalScore > 2500) score -= 1.5; // Good (was 1800, -1)
      else if (totalScore > 2000) score -= 1; // Fair
      if (totalDebrisAvoided > 40) score -= 2; // High debris avoidance across all levels (was 45)
      else if (totalDebrisAvoided > 25) score -= 1; // Good (was 30)
      

      
      return Math.max(1, Math.min(10, score));
    }
    
      // Convert reaction time to score: faster = lower score (better performance = lower ADHD)
  // Calibrated for real mobile game performance - much stricter scoring
  const reactionTimeMs = averageReactionTime;
  if (reactionTimeMs <= 800) return 1; // Excellent: 0-800ms
  if (reactionTimeMs <= 1200) return 2; // Very good: 800-1200ms
  if (reactionTimeMs <= 1600) return 3; // Good: 1200-1600ms
  if (reactionTimeMs <= 2000) return 4; // Fair: 1600-2000ms
  if (reactionTimeMs <= 2400) return 5; // Average: 2000-2400ms
  if (reactionTimeMs <= 2800) return 6; // Below average: 2400-2800ms
  if (reactionTimeMs <= 3200) return 7; // Poor: 2800-3200ms
  if (reactionTimeMs <= 3600) return 8; // Very poor: 3200-3600ms
  if (reactionTimeMs <= 4000) return 9; // Extremely poor: 3600-4000ms
  return 10; // Worst: 4000ms+
  }, []);
  
  const calculateImpulseControl = useCallback(() => {
    // Calculate impulse control based on aggregated data from all levels
    const allLevels = allLevelsDataRef.current.filter(level => level !== undefined);
    const totalLivesLost = allLevels.reduce((sum, level) => sum + (level?.livesLost || 0), 0);
    const totalDebrisHit = allLevels.reduce((sum, level) => sum + (level?.debrisHit || 0), 0);
    const totalDebrisAvoided = allLevels.reduce((sum, level) => sum + (level?.debrisAvoided || 0), 0);
    const totalDebrisSpawned = allLevels.reduce((sum, level) => sum + (level?.debrisSpawned || 0), 0);
    
    // Mathematical formula: Higher performance = Lower ADHD score
    // All components are 0-10 scale where 0 = perfect, 10 = worst
    
    // 1. Debris collision rate: (hits / total) * 10
    const collisionRate = totalDebrisSpawned > 0 ? (totalDebrisHit / totalDebrisSpawned) * 10 : 10;
    
    // 2. Debris avoidance efficiency: (1 - avoided/total) * 10
    const avoidanceEfficiency = totalDebrisSpawned > 0 ? (1 - totalDebrisAvoided / totalDebrisSpawned) * 10 : 10;
    
    // 3. Lives lost rate: (lives lost / max possible) * 10
    const livesRate = (totalLivesLost / 9) * 10;
    
    // 4. Impulse control score: weighted average of all components
    const adhdScore = (collisionRate * 0.5 + avoidanceEfficiency * 0.3 + livesRate * 0.2);
    
    // Ensure score is between 1-10
    const finalScore = Math.max(1, Math.min(10, Math.round(adhdScore)));
    
    console.log('[FlutterFocus] Impulse Control calculation:', {
      totalDebrisHit, totalDebrisSpawned, collisionRate,
      totalDebrisAvoided, avoidanceEfficiency,
      totalLivesLost, livesRate,
      finalScore
    });
    
    return finalScore;
  }, []);
  
  const calculateSustainedAttention = useCallback(() => {
    // Calculate sustained attention based on aggregated data from all levels
    const allLevels = allLevelsDataRef.current.filter(level => level !== undefined);
    const totalScore = allLevels.reduce((sum, level) => sum + (level?.score || 0), 0);
    const totalDebrisAvoided = allLevels.reduce((sum, level) => sum + (level?.debrisAvoided || 0), 0);
    const totalDuration = allLevels.reduce((sum, level) => sum + (level?.duration || 0), 0);
    const levelsCompleted = allLevels.length;
    
    // Mathematical formula: Higher performance = Lower ADHD score
    // All components are 0-10 scale where 0 = perfect, 10 = worst
    
    // 1. Score efficiency: (1 - actual/max_expected) * 10
    // Max expected score for 3 levels: 8000 (excellent), 4000 (average), 1000 (poor)
    const maxExpectedScore = 8000;
    const scoreEfficiency = Math.max(0, Math.min(10, (1 - totalScore / maxExpectedScore) * 10));
    
    // 2. Debris avoidance rate: (avoided / total_spawned) * 10
    const totalDebrisSpawned = allLevels.reduce((sum, level) => sum + (level?.debrisSpawned || 0), 0);
    const avoidanceRate = totalDebrisSpawned > 0 ? (totalDebrisAvoided / totalDebrisSpawned) * 10 : 0;
    const avoidanceComponent = 10 - avoidanceRate; // Invert: higher avoidance = lower ADHD
    
    // 3. Duration efficiency: longer play time = better focus = lower ADHD
    // Optimal duration: 60s (excellent focus), 30s (average focus), 15s (poor focus)
    const minDuration = 15000; // 15 seconds minimum
    const maxDuration = 60000; // 60 seconds maximum
    const durationEfficiency = Math.max(0, Math.min(10, 
      (1 - (totalDuration - minDuration) / (maxDuration - minDuration)) * 10
    ));
    
    // 4. Lives lost rate: (lives lost / max possible) * 10
    const totalLivesLost = allLevels.reduce((sum, level) => sum + (level?.livesLost || 0), 0);
    const livesComponent = (totalLivesLost / 9) * 10;
    
    // 5. Sustained attention score: weighted average of all components
    const adhdScore = (scoreEfficiency * 0.35 + avoidanceComponent * 0.3 + durationEfficiency * 0.2 + livesComponent * 0.15);
    
    // Ensure score is between 1-10
    const finalScore = Math.max(1, Math.min(10, Math.round(adhdScore)));
    
    console.log('[FlutterFocus] Sustained Attention calculation:', {
      totalScore, scoreEfficiency,
      totalDebrisAvoided, avoidanceComponent,
      totalDuration, durationEfficiency,
      totalLivesLost, livesComponent,
      finalScore
    });
    
    return finalScore;
  }, []);
  
  // Calculate final ADHD scores integrating gameplay and self-assessment (70% gameplay, 30% self-report)
  const calculateFinalADHDScores = useCallback((gameplayScores: any, selfReport: any) => {
    // Convert self-report scores (1-5) to ADHD scores (1-10)
    // Higher self-report scores = higher ADHD scores (worse performance)
    // We want self-report to contribute 3 out of 10 when answer is 5 (30% weight)
    // So map 1→1, 2→3, 3→5, 4→7, 5→10
    // This means: 30% of 10 = 3 points from self-report when answer is 5
    // 
    // IMPORTANT: All questions now follow the same logic:
    // - Higher self-report score = Higher ADHD score (worse performance)
    // - No more inverted logic confusion
    const convertSelfReportToADHD = (selfReportScore: number) => {
      // Map 1-5 to 1-10 so that 30% of 10 = 3 points exactly
      // 1→1, 2→3, 3→5, 4→7, 5→10
      return 1 + (selfReportScore - 1) * 2;
    };
    
    // Calculate self-report based ADHD scores
    let selfReportInattention = 5; // Neutral base
    let selfReportHyperactivity = 5;
    let selfReportImpulsivity = 5;
    let selfReportExecutiveFunction = 5;
    
    if (selfReport) {
      // ALL QUESTIONS: Higher self-report score = Higher ADHD score (worse performance)
      // Consistent direction across all questions for proper ADHD assessment
      
      // Focus difficulty (q1_flutter_focus_difficulty: 1-5, higher = more difficulty)
      if (selfReport.q1_flutter_focus_difficulty) {
        const originalScore = selfReport.q1_flutter_focus_difficulty;
        const convertedScore = convertSelfReportToADHD(originalScore);
        selfReportInattention = convertedScore;
        console.log('[FlutterFocus] Q1 Focus difficulty:', { original: originalScore, converted: convertedScore });
      }
      
      // Impulsive movements (q2_flutter_impulsive_movements: 1-5, higher = more impulsive)
      if (selfReport.q2_flutter_impulsive_movements) {
        const originalScore = selfReport.q2_flutter_impulsive_movements;
        const convertedScore = convertSelfReportToADHD(originalScore);
        selfReportHyperactivity = convertedScore;
        selfReportImpulsivity = convertedScore;
        console.log('[FlutterFocus] Q2 Impulsive movements:', { original: originalScore, converted: convertedScore });
      }
      
      // Frustration level (q3_flutter_frustration_level: 1-5, higher = more frustration)
      if (selfReport.q3_flutter_frustration_level) {
        const originalScore = selfReport.q3_flutter_frustration_level;
        const convertedScore = convertSelfReportToADHD(originalScore);
        // Frustration affects all areas - use direct assignment for consistency
        selfReportInattention = convertedScore;
        selfReportHyperactivity = convertedScore;
        selfReportImpulsivity = convertedScore;
        selfReportExecutiveFunction = convertedScore;
        console.log('[FlutterFocus] Q3 Frustration level:', { original: originalScore, converted: convertedScore });
      }
      
      // Planning ability (q4_flutter_planning_ability: 1-5, higher = better planning)
      if (selfReport.q4_flutter_planning_ability) {
        const originalScore = selfReport.q4_flutter_planning_ability;
        // For planning ability: 1=excellent (ADHD score 1), 5=poor (ADHD score 10)
        // Higher answer = Better planning = Lower ADHD score
        // So we need to INVERT: 1 (excellent) → 1 (ADHD score), 5 (poor) → 10 (ADHD score)
        const invertedScore = 6 - originalScore; // 1→5, 2→4, 3→3, 4→2, 5→1
        const convertedScore = convertSelfReportToADHD(invertedScore);
        selfReportExecutiveFunction = convertedScore;
        console.log('[FlutterFocus] Q4 Planning ability:', { original: originalScore, inverted: invertedScore, converted: convertedScore });
      }
      
      // Persistence motivation (q5_flutter_persistence_motivation: 1-5, higher = better persistence)
      if (selfReport.q5_flutter_persistence_motivation) {
        const originalScore = selfReport.q5_flutter_persistence_motivation;
        // For persistence: 1=excellent (ADHD score 1), 5=poor (ADHD score 10)
        // Higher answer = Better persistence = Lower ADHD score
        // So we need to INVERT: 1 (excellent) → 1 (ADHD score), 5 (poor) → 10 (ADHD score)
        const invertedScore = 6 - originalScore; // 1→5, 2→4, 3→3, 4→2, 5→1
        const convertedScore = convertSelfReportToADHD(invertedScore);
        selfReportInattention = convertedScore; // Direct assignment for consistency
        selfReportExecutiveFunction = convertedScore; // Direct assignment for consistency
        console.log('[FlutterFocus] Q5 Persistence motivation:', { original: originalScore, inverted: invertedScore, converted: convertedScore });
      }
    }
    
    // Debug logging for self-report calculations
    console.log('[FlutterFocus] Self-report calculations:', {
      selfReportInattention,
      selfReportHyperactivity,
      selfReportImpulsivity,
      selfReportExecutiveFunction,
      rawSelfReport: selfReport
    });
    

    
    // Calculate final scores: 70% gameplay + 30% self-report
    // When self-report is 5 (worst), it contributes 3 points (30% weight)
    // When self-report is 1 (best), it contributes 0.3 points
    // 
    // IMPORTANT: gameplayScores.sustainedAttention and gameplayScores.impulseControl are ADHD scores (lower = better)
    // But gameplayScores.overall is a PERFORMANCE score (higher = better) - we need to convert it to ADHD score
    const inattention = (gameplayScores.sustainedAttention * 0.7) + (selfReportInattention * 0.3);
    const hyperactivity = (gameplayScores.impulseControl * 0.7) + (selfReportHyperactivity * 0.3);
    const impulsivity = (gameplayScores.impulseControl * 0.7) + (selfReportImpulsivity * 0.3);
    
    // Convert overall performance score back to ADHD score: 11 - performanceScore
    const overallADHDScore = 11 - gameplayScores.overall;
    const executiveFunction = (overallADHDScore * 0.7) + (selfReportExecutiveFunction * 0.3);
    
    // Debug logging for final calculations
    console.log('[FlutterFocus] Final score calculations:', {
      gameplayScores,
      selfReportScores: {
        inattention: selfReportInattention,
        hyperactivity: selfReportHyperactivity,
        impulsivity: selfReportImpulsivity,
        executiveFunction: selfReportExecutiveFunction
      },
      finalScores: {
        inattention,
        hyperactivity,
        impulsivity,
        executiveFunction
      }
    });
    

    
    // Calculate ADHD composite score with proper decimal precision
    const rawSum = inattention + hyperactivity + impulsivity + executiveFunction;
    const rawAverage = rawSum / 4;
    const adhdComposite = Math.round(rawAverage * 10) / 10;
    
    // Ensure all ADHD scores are non-negative and within valid range
    const validInattention = Math.max(1, Math.min(10, Math.round(inattention * 10) / 10));
    const validHyperactivity = Math.max(1, Math.min(10, Math.round(hyperactivity * 10) / 10));
    const validImpulsivity = Math.max(1, Math.min(10, Math.round(impulsivity * 10) / 10));
    const validExecutiveFunction = Math.max(1, Math.min(10, Math.round(executiveFunction * 10) / 10));
    const validAdhdComposite = Math.max(1, Math.min(10, Math.round(adhdComposite * 10) / 10));
    
    return {
      inattention: validInattention,
      hyperactivity: validHyperactivity,
      impulsivity: validImpulsivity,
      executive_function: validExecutiveFunction,
      adhd_composite: validAdhdComposite
    };
  }, []);
  
  const calculateOverallScore = useCallback(() => {
    // Overall performance score (average of all metrics)
    // We need to convert ADHD scores to performance scores for proper calculation
    const reactionTime = calculateReactionTime();
    const impulseControl = calculateImpulseControl();
    const sustainedAttention = calculateSustainedAttention();
    
    // Convert ADHD scores to performance scores: 1→10, 2→9, 3→8, etc.
    // This ensures that better performance = higher score
    const reactionTimePerformance = 11 - reactionTime;
    const impulseControlPerformance = 11 - impulseControl;
    const sustainedAttentionPerformance = 11 - sustainedAttention;
    
    const averagePerformance = (reactionTimePerformance + impulseControlPerformance + sustainedAttentionPerformance) / 3;
    

    
    return Math.round(averagePerformance * 10) / 10;
  }, [calculateReactionTime, calculateImpulseControl, calculateSustainedAttention]);
  
  // Single function to calculate all ADHD scores with self-report integration
  const calculateAllADHDScores = useCallback(() => {
    try {
      const gameplayScores = {
        sustainedAttention: calculateSustainedAttention(),
        impulseControl: calculateImpulseControl(),
        overall: calculateOverallScore()
      };
      
      const scores = calculateFinalADHDScores(gameplayScores, questionResponses);
      
      // Validate that all required scores exist
      if (!scores.inattention || !scores.hyperactivity || !scores.impulsivity || !scores.executive_function || !scores.adhd_composite) {
        console.error('[FlutterFocus] Missing required scores:', {
          inattention: scores.inattention,
          hyperactivity: scores.hyperactivity,
          impulsivity: scores.impulsivity,
          executive_function: scores.executive_function,
          adhd_composite: scores.adhd_composite
        });
        throw new Error('Missing required ADHD scores');
      }
      
      const result = {
        inattention: scores.inattention,
        hyperactivity: scores.hyperactivity,
        impulsivity: scores.impulsivity,
        executive_function: scores.executive_function,  // Use snake_case for Firebase compatibility
        executiveFunction: scores.executive_function,   // Also provide camelCase for TypeScript interface
        adhd_composite: scores.adhd_composite  // Use the pre-calculated value
      };
      
      return result;
    } catch (error) {
      // Return default scores if calculation fails
      return {
        inattention: 5,
        hyperactivity: 5,
        impulsivity: 5,
        executive_function: 5,
        executiveFunction: 5,
        adhd_composite: 5
      };
    }
  }, [calculateSustainedAttention, calculateImpulseControl, calculateOverallScore, calculateFinalADHDScores, questionResponses]);
  
  // Post level results to Firebase
  const postLevelResults = useCallback(async () => {
    try {
      // Calculate level completion data for transition screen
      const debrisAvoided = Math.max(0, levelDebrisSpawnedRef.current - levelDebrisHitRef.current);
      const validScore = Math.max(0, levelScoreRef.current);
      const validDuration = Math.max(0, Date.now() - levelStartTimeRef.current);
      const validLivesLost = Math.max(0, levelLivesLostRef.current);
      
      // Set transition data for the LevelTransition component
      setTransitionData({
        type: 'level-complete',
        level: levelRef.current,
        score: validScore,
        time: validDuration,
        debrisAvoided: debrisAvoided,
        totalDebris: levelDebrisSpawnedRef.current,
        livesLost: validLivesLost
      });
      
      const levelData = {
        userId,
        level: levelRef.current,
        score: levelScoreRef.current,
        lives: 0, // Level ended with 0 lives
        timestamp: new Date().toISOString(),
        gameType: 'flutter-focus',
        levelStats: {
          finalScore: levelScoreRef.current,
          livesLost: levelLivesLostRef.current,
          levelDuration: Date.now() - levelStartTimeRef.current,
          debrisHit: levelDebrisHitRef.current,
          debrisAvoided: levelDebrisSpawnedRef.current - levelDebrisHitRef.current,
          shootingStarsSeen: 0, // TODO: Track shooting stars
          accuracy: (levelDebrisSpawnedRef.current - levelDebrisHitRef.current) > 0 ? ((levelDebrisSpawnedRef.current - levelDebrisHitRef.current) / levelDebrisSpawnedRef.current) * 100 : 0,
          reactionTime: levelReactionTimeRef.current
        }
      };
      
      logDebug('Posting level results to Firebase:', levelData);
      
              // Post to main game document with the structure expected by GameResultsPage
        if (userId) {
          const docRef = doc(db, 'users', userId, 'games', 'flutter-focus');

          
          // Get existing document to preserve selfReport data
          const existingDoc = await getDoc(docRef);
          const existingData = existingDoc.exists() ? existingDoc.data() : {};
          
          // Store this level's data in our tracking array
          const debrisAvoided = Math.max(0, levelDebrisSpawnedRef.current - levelDebrisHitRef.current);
          const validScore = Math.max(0, levelScoreRef.current);
          const validDuration = Math.max(0, Date.now() - levelStartTimeRef.current);
          const validReactionTime = Math.max(0, levelReactionTimeRef.current);
          
          const currentLevelData = {
            level: levelRef.current,
            score: validScore,
            livesLost: Math.max(0, levelLivesLostRef.current),
            debrisHit: Math.max(0, levelDebrisHitRef.current),
            debrisSpawned: Math.max(0, levelDebrisSpawnedRef.current),
            debrisAvoided: debrisAvoided,
            duration: validDuration,
            reactionTime: validReactionTime,
            startTime: levelStartTimeRef.current
          };
          
          allLevelsDataRef.current[levelRef.current - 1] = currentLevelData;
          
          // Debug: Log what we're saving (this ensures Level 3 data is logged)
          console.log(`[FlutterFocus] Level ${levelRef.current} data saved:`, currentLevelData);
          

          

          
          // Build the complete rounds array with all levels
          const allRounds = [];
          for (let i = 1; i <= 3; i++) {
            const levelData = allLevelsDataRef.current[i - 1];
            if (levelData) {
              const debrisAvoided = levelData.debrisSpawned - levelData.debrisHit;
              allRounds.push({
                roundNumber: i,
                roundType: 'level',
                startTime: levelData.startTime || 0,
                endTime: levelData.startTime + levelData.duration,
                duration: levelData.duration,
                score: levelData.score,
                livesLost: levelData.livesLost,
                debrisHit: levelData.debrisHit,
                debrisAvoided: debrisAvoided,
                shootingStarsSeen: 0,
                accuracy: debrisAvoided > 0 ? (debrisAvoided / (debrisAvoided + levelData.debrisHit)) * 100 : 0,
                reactionTime: levelData.reactionTime,
                timestamp: new Date().toISOString()
              });
            }
          }
          
          
          
          const documentData = {
            [`level${levelRef.current}Data`]: allLevelsDataRef.current[levelRef.current - 1],
            lastUpdated: new Date().toISOString(),
            currentLevel: levelRef.current,
            gameCompleted: false,
            
            // Level results don't need ADHD scores - those are calculated at the end
            
            // Preserve existing selfReport data if it exists, otherwise save empty object
            selfReport: existingData.selfReport || {},
            
            // Save all rounds data (accumulated from all levels)
            rounds: allRounds
          };
          

          
          await setDoc(docRef, documentData, { merge: true });
        
        
        
        // Post to rounds subcollection for detailed tracking
        const roundsRef = collection(db, 'users', userId, 'games', 'flutter-focus', 'rounds');
        
        
        await addDoc(roundsRef, {
          roundNumber: levelRef.current,
          roundType: 'level',
          startTime: levelStartTimeRef.current,
          endTime: Date.now(),
          duration: Date.now() - levelStartTimeRef.current,
          score: levelScoreRef.current,
          livesLost: levelLivesLostRef.current,
          debrisHit: levelDebrisHitRef.current,
          debrisAvoided: levelDebrisSpawnedRef.current - levelDebrisHitRef.current,
          shootingStarsSeen: 0,
          accuracy: (levelDebrisSpawnedRef.current - levelDebrisHitRef.current) > 0 ? ((levelDebrisSpawnedRef.current - levelDebrisHitRef.current) / levelDebrisSpawnedRef.current) * 100 : 0,
          reactionTime: levelReactionTimeRef.current,
          timestamp: new Date().toISOString()
        });
        
        
        logDebug('Level results successfully posted to Firebase');
      } else {
        console.warn('[FlutterFocus] No userId provided, not posting level results');
        logDebug('No userId provided, not posting level results');
      }
      
    } catch (error) {
      console.error('[FlutterFocus] Error posting level results:', error);
      if (error instanceof Error) {
        console.error('[FlutterFocus] Error details:', {
          message: error.message,
          code: (error as any).code,
          stack: error.stack
        });
      } else {
        console.error('[FlutterFocus] Unknown error type:', error);
      }
    }
  }, [userId, score, logDebug, calculateReactionTime, calculateImpulseControl, calculateSustainedAttention, calculateOverallScore]);
  
  // Post final results to Firebase
  const postFinalResults = useCallback(async () => {
    try {
      // console.log('[FlutterFocus] postFinalResults called with userId:', userId);
      
      // ADHD scores are calculated in calculateAllADHDScores function
      
      // Calculate real metrics from all levels data
      const allLevels = allLevelsDataRef.current.filter(level => level !== undefined);
      const totalLivesLost = allLevels.reduce((sum, level) => sum + (level?.livesLost || 0), 0);
      const totalDebrisHit = allLevels.reduce((sum, level) => sum + (level?.debrisHit || 0), 0);
      const totalDebrisAvoided = allLevels.reduce((sum, level) => sum + ((level?.debrisSpawned || 0) - (level?.debrisHit || 0)), 0);
      const totalReactionTime = allLevels.reduce((sum, level) => sum + (level?.reactionTime || 0), 0);
      const averageReactionTime = allLevels.length > 0 ? totalReactionTime / allLevels.length : 0;
      const overallAccuracy = totalDebrisAvoided > 0 ? (totalDebrisAvoided / (totalDebrisAvoided + totalDebrisHit)) * 100 : 0;
      
      
      
      // Calculate level-specific arrays
      const levelScores = [];
      const levelCompletionTimes = [];
      const levelLivesLost = [];
      const levelDebrisHit = [];
      const levelDebrisAvoided = [];
      const levelAccuracy = [];
      const levelReactionTime = [];
      
      for (let i = 1; i <= 3; i++) {
        const levelData = allLevelsDataRef.current[i - 1];
        if (levelData) {
          levelScores.push(levelData.score);
          levelCompletionTimes.push(levelData.duration);
          levelLivesLost.push(levelData.livesLost);
          levelDebrisHit.push(levelData.debrisHit);
          const debrisAvoided = levelData.debrisSpawned - levelData.debrisHit;
          levelDebrisAvoided.push(debrisAvoided);
          levelAccuracy.push(debrisAvoided > 0 ? (debrisAvoided / levelData.debrisSpawned) * 100 : 0);
          levelReactionTime.push(levelData.reactionTime);
        } else {
          // Fill with 0 for levels not completed
          levelScores.push(0);
          levelCompletionTimes.push(0);
          levelLivesLost.push(0);
          levelDebrisHit.push(0);
          levelDebrisAvoided.push(0);
          levelAccuracy.push(0);
          levelReactionTime.push(0);
        }
      }
      
      // Calculate assessment metrics using the proper functions
      const adhdScores = calculateAllADHDScores();
      const focusLevel = Math.round((adhdScores.inattention / 10) * 100); // Convert 1-10 to 0-100
      const reactionSpeed = Math.round((adhdScores.hyperactivity / 10) * 100); // Convert 1-10 to 0-100
      const accuracyScore = Math.round(overallAccuracy);
      const consistencyScore = Math.round((adhdScores.executiveFunction / 10) * 100); // Convert 1-10 to 0-100
      
      // Generate ADHD indicators based on performance
      const adhdIndicators = [];
      if (adhdScores.inattention < 5) adhdIndicators.push('Difficulty maintaining focus');
      if (adhdScores.hyperactivity < 5) adhdIndicators.push('Impulsive behavior detected');
      if (adhdScores.hyperactivity < 5) adhdIndicators.push('Slower reaction times');
      if (overallAccuracy < 50) adhdIndicators.push('Accuracy challenges');
      if (totalLivesLost > 6) adhdIndicators.push('High error rate');
      
      // Ensure all values are non-negative
      const validFinalScore = Math.max(0, score);
      const validTotalPlayTime = Math.max(0, Date.now() - gameStartTimeRef.current);
      const validLevelScores = levelScores.map(s => Math.max(0, s));
      const validLevelCompletionTimes = levelCompletionTimes.map(t => Math.max(0, t));
      const validLevelLivesLost = levelLivesLost.map(l => Math.max(0, l));
      const validLevelDebrisHit = levelDebrisHit.map(d => Math.max(0, d));
      const validLevelDebrisAvoided = levelDebrisAvoided.map(d => Math.max(0, d));
      const validLevelAccuracy = levelAccuracy.map(a => Math.max(0, Math.min(100, a))); // Accuracy should be 0-100
      const validLevelReactionTime = levelReactionTime.map(r => Math.max(0, r));
      const validOverallAccuracy = Math.max(0, Math.min(100, overallAccuracy)); // Accuracy should be 0-100
      const validAverageReactionTime = Math.max(0, averageReactionTime);
      
      const finalData = {
        userId,
        gameType: 'flutter-focus',
        assessmentComplete: true,
        finalScore: validFinalScore,
        totalLivesLost: Math.max(0, totalLivesLost),
        totalPlayTime: validTotalPlayTime,
        completionTimestamp: new Date().toISOString(),
        levelScores: validLevelScores,
        levelCompletionTimes: validLevelCompletionTimes,
        levelLivesLost: validLevelLivesLost,
        levelDebrisHit: validLevelDebrisHit,
        levelDebrisAvoided: validLevelDebrisAvoided,
        levelShootingStarsSeen: [0, 0, 0], // Not implemented in current version
        levelAccuracy: validLevelAccuracy,
        levelReactionTime: validLevelReactionTime,
        overallAccuracy: validOverallAccuracy,
        averageReactionTime: validAverageReactionTime,
        assessmentMetrics: {
          focusLevel: Math.max(0, Math.min(100, focusLevel)), // Should be 0-100
          reactionSpeed: Math.max(0, Math.min(100, reactionSpeed)), // Should be 0-100
          accuracyScore: Math.max(0, Math.min(100, accuracyScore)), // Should be 0-100
          consistencyScore: Math.max(0, Math.min(100, consistencyScore)), // Should be 0-100
          adhdIndicators
        }
      };
      
      logDebug('Posting final results to Firebase:', finalData);
      
      
              // Post to main game document with the structure expected by GameResultsPage
        if (userId) {
          const docRef = doc(db, 'users', userId, 'games', 'flutter-focus');
          
          // Get existing document to preserve individual level data
          const existingDoc = await getDoc(docRef);
          const existingData = existingDoc.exists() ? existingDoc.data() : {};
          
          await setDoc(docRef, {
          // Save the final results
          finalResults: finalData,
          lastUpdated: new Date().toISOString(),
          currentLevel: 3,
          gameCompleted: true,
          assessmentComplete: true,
          
          // Save the scores structure expected by GameResultsPage
          scores: (() => {
            const scoresToSave = calculateAllADHDScores();
            console.log('[FlutterFocus] postFinalResults - Saving scores to Firebase:', scoresToSave);
            return scoresToSave;
          })(),
          
          // NO DATA PRESERVATION - Use current game data only
          // Individual level data comes from allLevels array
          level1Data: allLevels[0] || null,
          level2Data: allLevels[1] || null,
          level3Data: allLevels[2] || null,
          
          // Self-report data comes from current questionResponses
          selfReport: { ...questionResponses },
          
          // Save rounds data using real level data
          rounds: allLevels.map((levelData, index) => ({
            roundNumber: index + 1,
              roundType: 'level',
            startTime: levelData.startTime,
            endTime: levelData.startTime + levelData.duration,
            duration: levelData.duration,
            score: levelData.score,
            livesLost: levelData.livesLost,
            debrisHit: levelData.debrisHit,
            debrisAvoided: levelData.debrisSpawned - levelData.debrisHit,
            shootingStarsSeen: 0, // Not implemented in current version
            accuracy: (levelData.debrisSpawned - levelData.debrisHit) > 0 ? ((levelData.debrisSpawned - levelData.debrisHit) / levelData.debrisSpawned) * 100 : 0,
            reactionTime: levelData.reactionTime,
              timestamp: new Date().toISOString()
          }))
        }, { merge: true });
        
        // Debug logging for self-report data
        console.log('[FlutterFocus] postFinalResults - existingData.selfReport:', existingData.selfReport);
        console.log('[FlutterFocus] postFinalResults - questionResponses:', questionResponses);
        console.log('[FlutterFocus] postFinalResults - Final document data saved with selfReport:', existingData.selfReport || {});
        
        // Post to rounds subcollection for final round
        const roundsRef = collection(db, 'users', userId, 'games', 'flutter-focus', 'rounds');
        
        
        // Add final round with real aggregated data
        await addDoc(roundsRef, {
          roundNumber: 3,
          roundType: 'final',
          startTime: gameStartTimeRef.current,
          endTime: Date.now(),
          duration: Date.now() - gameStartTimeRef.current,
          score: score,
          livesLost: totalLivesLost,
          debrisHit: totalDebrisHit,
          debrisAvoided: totalDebrisAvoided,
          shootingStarsSeen: 0, // Not implemented in current version
          accuracy: overallAccuracy,
          reactionTime: averageReactionTime,
          timestamp: new Date().toISOString(),
          finalRound: true
        });
        
        
        logDebug('Final results successfully posted to Firebase');
        
        // Notify parent component that ADHD assessment is complete
        if (onGameComplete) {

          onGameComplete({
            startTime: gameStartTimeRef.current,
            endTime: Date.now(),
            totalPlayTime: Date.now() - gameStartTimeRef.current,
            gameCompleted: true,
            finalScore: score,
            livesLost: totalLivesLost,
            totalCrashes: totalDebrisHit,
            totalObstaclesAvoided: totalDebrisAvoided,
            totalObstaclesHit: totalDebrisHit,
            currentLevel: 3,
            levelsCompleted: allLevels.length,
            levelScores: levelScores,
            levelCompletionTimes: levelCompletionTimes,
                  adhdScores: calculateAllADHDScores(),
            selfReport: { ...questionResponses }
          });
        } else {

        }
        
      } else {
        console.warn('[FlutterFocus] No userId provided, not posting final results');
        logDebug('No userId provided, not posting final results');
      }
      
    } catch (error) {
      console.error('[FlutterFocus] Error posting final results:', error);
      if (error instanceof Error) {
        console.error('[FlutterFocus] Error details:', {
          message: error.message,
          code: (error as any).code,
          stack: error.stack
        });
      } else {
        console.error('[FlutterFocus] Unknown error type:', error);
      }
    }
  }, [userId, score, logDebug, onGameComplete, calculateReactionTime, calculateImpulseControl, calculateSustainedAttention, calculateOverallScore]);
  
  // Handle question responses - removed for post-game flow

  // Handle questions completion - removed for post-game flow
  
  // Start next level
  const startNextLevel = useCallback(() => {
    const nextLevel = levelRef.current + 1;
    logDebug('Starting next level:', nextLevel);

    // Clear transition data
    setTransitionData(null);
    
    // Safety check - prevent going beyond Level 3
    if (nextLevel > 3) {
      logDebug('Cannot start level beyond 3, game complete');
      setGameState('gameComplete');
      return;
    }
    
    // Save current level data BEFORE resetting refs
    // Ensure all values are non-negative
    const validScore = Math.max(0, levelScoreRef.current);
    const validLivesLost = Math.max(0, levelLivesLostRef.current);
    const validDebrisHit = Math.max(0, levelDebrisHitRef.current);
    const validDebrisSpawned = Math.max(0, levelDebrisSpawnedRef.current);
    const validDebrisAvoided = Math.max(0, levelDebrisSpawnedRef.current - levelDebrisHitRef.current);
    const validDuration = Math.max(0, Date.now() - levelStartTimeRef.current);
    const validReactionTime = Math.max(0, levelReactionTimeRef.current);
    
    const currentLevelData = {
      level: levelRef.current,
      score: validScore,
      livesLost: validLivesLost,
      debrisHit: validDebrisHit,
      debrisSpawned: validDebrisSpawned,
      debrisAvoided: validDebrisAvoided,
      duration: validDuration,
      reactionTime: validReactionTime,
      startTime: levelStartTimeRef.current
    };
    
    // Store the current level data in our tracking array
    allLevelsDataRef.current[levelRef.current - 1] = currentLevelData;
    
    // Debug: Log what we're saving
    console.log(`[FlutterFocus] Level ${levelRef.current} data saved:`, currentLevelData);
 
    // Increment level - update both ref and state
    levelRef.current = nextLevel;
    setLevel(nextLevel);
    
    // Reset lives for new level
    setLives(3);
    
    // Reset score for new level (each level starts from 0)
    setScore(0);
    
    // Reset level tracking variables for new level
    levelStartTimeRef.current = Date.now();
    levelLivesLostRef.current = 0;
    levelDebrisHitRef.current = 0;
    levelDebrisSpawnedRef.current = 0;
    levelReactionTimeRef.current = 0;
    levelScoreRef.current = 0;
    
    // Reset reaction time tracking for new level
    reactionTimesRef.current = [];
    obstacleSpawnTimesRef.current.clear();
    

    
    // Reset alien position
    alienRef.current = { x: 100, y: 250, width: 120, height: 92, velocityY: 0 };
    
    // Reset obstacles
    obstaclesRef.current = [];
    obstacleSpawnTimerRef.current = 0;
    
    // Reset background debris for new level
    debrisRef.current = []; // Reset the ref array
    setBackgroundDebris([]);
    debrisSpawnTimerRef.current = 0;
    
    // Reset shooting stars for new level
    shootingStarsRef.current = [];
    setShootingStars([]);
    shootingStarSpawnTimerRef.current = 0;

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
    console.log('[FlutterFocus] Starting next level immediately, level:', nextLevel);
    setGameState('playing');
    
    // Spawn initial debris for the new level
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        spawnBackgroundDebris();
      }
      console.log('[FlutterFocus] Initial debris spawned for level', nextLevel, 'count:', debrisRef.current.length);
    }, 1000);
    
    // Add a small delay to ensure state is updated before starting game loop
    setTimeout(() => {
      console.log('[FlutterFocus] Starting game loop for level', nextLevel, 'gameState:', gameStateRef.current, 'gameLoopRef:', gameLoopRef.current);
      startGameLoop();
    }, 100);
  }, []); // Empty dependency array since this should only run once when component mounts
  
  // Handle jump
  const handleJump = useCallback(() => {
    if (gameState === 'playing') {
      // Make jump velocity time-based for consistency
      alienRef.current.velocityY = -0.8; // Velocity per millisecond
      
      // Record reaction time for any nearby debris (obstacles don't have IDs)
      const alien = alienRef.current;
      const nearbyDebris = debrisRef.current.filter(debris => 
        debris.x < alien.x + 200 && debris.x > alien.x - 50 && // Within 200px ahead or 50px behind
        Math.abs(debris.y - alien.y) < 100 // Within 100px vertically
      );
      
      nearbyDebris.forEach(debris => {
        if (obstacleSpawnTimesRef.current.has(debris.id)) {
          recordReactionTime(debris.id);
        }
      });
    }
  }, [gameState, recordReactionTime]);
  
  // Handle up movement
  const handleMoveUp = useCallback(() => {
    if (gameState === 'playing') {
      const alien = alienRef.current;
      // Move up by a fixed amount, but respect boundaries
      alien.y = Math.max(0, alien.y - 20);
      // Reset velocity when manually moving
      alien.velocityY = 0;
      
      // Record reaction time for any nearby debris
      const nearbyDebris = debrisRef.current.filter(debris => 
        debris.x < alien.x + 200 && debris.x > alien.x - 50 && // Within 200px ahead or 50px behind
        Math.abs(debris.y - alien.y) < 100 // Within 100px vertically
      );
      
      nearbyDebris.forEach(debris => {
        if (obstacleSpawnTimesRef.current.has(debris.id)) {
          recordReactionTime(debris.id);
        }
      });
    }
  }, [gameState, recordReactionTime]);
  
  // Handle down movement
  const handleMoveDown = useCallback(() => {
    if (gameState === 'playing') {
      const alien = alienRef.current;
      // Move down by a fixed amount, but respect boundaries
      alien.y = Math.min(500, alien.y + 20);
      // Reset velocity when manually moving
      alien.velocityY = 0;
      
      // Record reaction time for any nearby debris
      const nearbyDebris = debrisRef.current.filter(debris => 
        debris.x < alien.x + 200 && debris.x > alien.x - 50 && // Within 200px ahead or 50px behind
        Math.abs(debris.y - alien.y) < 100 // Within 100px vertically
      );
      
      nearbyDebris.forEach(debris => {
        if (obstacleSpawnTimesRef.current.has(debris.id)) {
          recordReactionTime(debris.id);
        }
      });
    }
  }, [gameState, recordReactionTime]);
  
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
    
    // Layer 1: Static background stars (dimmest) - varied sizes and brightness
    starsLayer1Ref.current.forEach(star => {
      const brightness = star.brightness || 0.6;
      ctx.globalAlpha = brightness;
      ctx.fillStyle = '#666666';
      ctx.fillRect(star.x, star.y, star.size, star.size);
      
      // Add twinkling effect for bright stars
      if (star.brightness && star.brightness > 0.8) {
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = brightness * 0.5;
        ctx.fillRect(star.x + star.size * 0.3, star.y + star.size * 0.3, star.size * 0.4, star.size * 0.4);
      }
    });
    
    // Layer 2: Slow moving stars (medium brightness) - varied sizes
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#AAAAAA';
    starsLayer2Ref.current.forEach(star => {
      const brightness = star.brightness || 0.8;
      ctx.globalAlpha = brightness;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    
    // Layer 3: Fast moving stars (brightest) - varied sizes
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#FFFFFF';
    starsLayer3Ref.current.forEach(star => {
      const brightness = star.brightness || 1.0;
      ctx.globalAlpha = brightness;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    
    // Reset alpha for other elements
    ctx.globalAlpha = 1.0;
    
    // Draw planets and celestial objects
    planetsRef.current.forEach(planet => {
      ctx.save();
      
      // Draw planet body
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add planet atmosphere/glow
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size * 1.2, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add planet name label
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(planet.name, planet.x, planet.y + planet.size + 20);
      
      ctx.restore();
    });
    
    // Draw background debris behind the ship (z-index 1)
    const debrisBehind = debrisRef.current.filter(debris => debris.zIndex === Z_INDEX_LAYERS.BACKGROUND_DEBRIS && debris.isActive);
    const debrisGameObjects = debrisRef.current.filter(debris => debris.zIndex === Z_INDEX_LAYERS.GAME_OBJECTS && debris.isActive);
    const debrisFront = debrisRef.current.filter(debris => debris.zIndex === Z_INDEX_LAYERS.FOREGROUND_DEBRIS && debris.isActive);
    
    
    
    // Draw debris behind the ship (z-index 1)
    debrisBehind.forEach(debris => {
      const sprite = debrisSpritesRef.current[debris.type];
      if (sprite) {
        ctx.save();
        ctx.translate(debris.x + debris.width / 2, debris.y + debris.height / 2);
        // Only rotate if rotation speed is not 'none'
        if (debris.rotationSpeed !== 'none') {
          ctx.rotate(debris.rotation * Math.PI / 180);
        }
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
          // Make explosion much larger and more visible (minimum 150px, scales with obstacle)
          const baseSize = Math.max(obstacle.width, obstacle.height);
          const explosionSize = Math.max(baseSize * 4.0, 150);
          
          // Center the explosion sprite on the collision point
          ctx.drawImage(
            sprite,
            obstacle.explosionX - explosionSize / 2,
            obstacle.explosionY - explosionSize / 2,
            explosionSize,
            explosionSize
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
        // Only rotate if rotation speed is not 'none'
        if (debris.rotationSpeed !== 'none') {
          ctx.rotate(debris.rotation * Math.PI / 180);
        }
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
        // Only rotate if rotation speed is not 'none'
        if (debris.rotationSpeed !== 'none') {
          ctx.rotate(debris.rotation * Math.PI / 180);
        }
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
    
    // Draw explosion sprites for debris collisions
    debrisRef.current.forEach(debris => {
      if (debris.collisionState === 'exploding' && explosionSpritesRef.current.length > 0 && debris.explosionFrame !== undefined) {
        const sprite = explosionSpritesRef.current[debris.explosionFrame];
        if (sprite && debris.explosionX !== undefined && debris.explosionY !== undefined) {
          // Make explosion much larger and more visible (minimum 150px, scales with debris)
          const baseSize = Math.max(debris.width, debris.height);
          const explosionSize = Math.max(baseSize * 4.0, 150);
          
          // Center the explosion sprite on the collision point
          ctx.drawImage(
            sprite,
            debris.explosionX - explosionSize / 2,
            debris.explosionY - explosionSize / 2,
            explosionSize,
            explosionSize
          );
        }
      }
    });
    
    // Draw shooting stars
    shootingStarsRef.current.forEach(star => {
      ctx.save();
      ctx.globalAlpha = star.alpha;
      
      // Draw shooting star trail (line with gradient)
      // Trail should extend from current position toward where the star came from
      const endX = star.x - Math.cos(star.angle) * star.length;
      const endY = star.y - Math.sin(star.angle) * star.length;
      
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
    ctx.fillText(`Level: ${levelRef.current}`, 20, 40);
    
    // Collision flash effect applied
  }, [gameState, level, logDebug, collisionFlash, collisionParticles, debrisRef]);
  
  // Monitor game state changes and stop game loop when not playing
  useEffect(() => {
    console.log('[FlutterFocus] Game state changed to:', gameState, {
      questionResponsesCount: Object.keys(questionResponses).length
    });
    logDebug('Game state changed', { newState: gameState });
    
    // Stop game loop when not in playing state, but be careful about level transitions
    if (gameState !== 'playing' && gameLoopRef.current) {
      // Don't stop the game loop immediately for levelComplete state to allow smooth transition
      if (gameState === 'levelComplete') {
        console.log('[FlutterFocus] Level complete - keeping game loop active for transition');
        return;
      }
      
      console.log('[FlutterFocus] Stopping game loop due to state change to:', gameState);
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = undefined;
    }
  }, [gameState, questionResponses, logDebug]);
  
  // Monitor debris state for debugging (only when game is playing) - disabled to reduce console spam
  // useEffect(() => {
  //   if (gameState === 'playing') {
  //     console.log('[FlutterFocus] Debris state changed:', {
  //       count: debrisRef.current.length,
  //       active: debrisRef.current.filter(d => d.isActive).length,
  //       debris: debrisRef.current.map(d => ({ id: d.id, x: d.x, y: d.y, type: d.type, isActive: d.isActive }))
  //     });
  //   }
  // }, [debrisRef, gameState]);
  
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
  
  // Render game based on state using GameStateManager
  return (
    <GameStateManager
      gameState={gameState}
      level={level}
      score={score}
      lives={lives}
      questions={QUESTIONS}
      width={width}
      height={height}
      canvasRef={canvasRef}
      onStartGame={startGame}
      onCancel={onCancel || (() => {})}
      onNextLevel={startNextLevel}
      onPlayAgain={() => setGameState('instructions')}
      onJump={handleJump}
      userId={userId}
      transitionData={transitionData}
      debugData={{
        level,
        debrisHit: levelDebrisHitRef.current,
        debrisAvoided: levelDebrisSpawnedRef.current - levelDebrisHitRef.current,
        reactionTime: levelReactionTimeRef.current,
        reactionCount: reactionTimesRef.current.length,
        spawnTimesCount: obstacleSpawnTimesRef.current.size
      }}
    />
  );
};

export default FlutterFocusGame; 