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
import SelfReportQuestions from './SelfReportQuestions';

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
  const [gameState, setGameState] = useState<'instructions' | 'countdown' | 'playing' | 'gameOver' | 'levelComplete' | 'gameComplete' | 'selfReport'>('instructions');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  // Clean collision feedback - no screen shake for ADHD assessment accuracy
  const [collisionFlash, setCollisionFlash] = useState(false);
  const [collisionParticles, setCollisionParticles] = useState<Array<{x: number, y: number, vx: number, vy: number, life: number}>>([]);
  
  // Self-reporting questions state
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionResponses, setQuestionResponses] = useState<{ [key: string]: number }>({});
  const [questionsCompleted, setQuestionsCompleted] = useState(false);
  
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
    if (score !== validScore) {
      console.log(`[FlutterFocus] Score corrected from ${score} to ${validScore} (cannot be negative)`);
    }
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
      
      console.log('[FlutterFocus] Reaction time recorded:', {
        obstacleId,
        reactionTime,
        averageReactionTime: levelReactionTimeRef.current,
        totalReactions: reactionTimesRef.current.length
      });
      
      // Remove the spawn time after recording
      obstacleSpawnTimesRef.current.delete(obstacleId);
    } else {
      console.warn('[FlutterFocus] No spawn time found for obstacle:', obstacleId);
    }
  }, []);
  
  // Function to mark when obstacles/debris spawn (for reaction time measurement)
  const markObstacleSpawn = useCallback((obstacleId: string) => {
    obstacleSpawnTimesRef.current.set(obstacleId, Date.now());
    console.log('[FlutterFocus] Obstacle spawn marked:', obstacleId, 'Total tracked:', obstacleSpawnTimesRef.current.size);
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
  
  // Debug logging
  // Essential logging for troubleshooting
  const logDebug = useCallback((message: string, data?: any) => {
    console.log(`[FlutterFocus] ${message}`, data || '');
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
    
    console.log('[FlutterFocus] Enhanced star system initialized with varied sizes, twinkling, and planets');
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
    
    console.log('[FlutterFocus] Shooting star spawned:', { 
      type: `${selectedConfig.speed}-${selectedConfig.length}`,
      x: Math.round(startX), 
      y: Math.round(startY),
      angle: Math.round(angle * 180 / Math.PI) + '°'
    });
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
    const collisionDebrisTypes = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'd14', 'd15', 'd16', 'd17', 'd18', 'd19', 'd20', 'd21', 'd22', 'd23'];
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
    
    console.log('[FlutterFocus] Spawning debris:', {
      config: selectedConfig,
      speed: speed,
      rotationSpeed: rotationSpeed,
      debris: newDebris,
      spriteLoaded: !!debrisSpritesRef.current[selectedConfig.type],
      hasCollision: newDebris.hasCollision,
      collisionDamage: newDebris.collisionDamage
    });
    
    // Mark obstacle spawn for reaction time tracking
    markObstacleSpawn(newDebris.id);
    
    // Count collision debris spawns (only debris that can actually hit the player)
    if (newDebris.hasCollision) {
      levelDebrisSpawnedRef.current += 1;
      console.log('[FlutterFocus] Collision debris spawned:', {
        debrisId: newDebris.id,
        type: newDebris.type,
        totalSpawned: levelDebrisSpawnedRef.current
      });
    }
    
    // Debug: log the current state before and after adding debris
    console.log('[FlutterFocus] Before adding debris, count:', debrisRef.current.length);
    debrisRef.current = [...debrisRef.current, newDebris]; // Update ref directly
    setBackgroundDebris([...debrisRef.current]); // Update state for React
    console.log('[FlutterFocus] After adding debris, new count:', debrisRef.current.length);
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
    
    // Debug: log debris count and positions
    if (debrisRef.current.length > 0 && Math.random() < 0.05) { // Log 5% of the time
      console.log('[FlutterFocus] Debris update:', { 
        count: debrisRef.current.length, 
        active: debrisRef.current.filter(d => d.isActive).length,
        collisionDebris: debrisRef.current.filter(d => d.hasCollision).length,
        backgroundDebris: debrisRef.current.filter(d => !d.hasCollision).length,
        firstDebris: debrisRef.current[0] ? { 
          x: Math.round(debrisRef.current[0].x), 
          y: Math.round(debrisRef.current[0].y),
          width: debrisRef.current[0].width,
          speed: debrisRef.current[0].speed,
          isActive: debrisRef.current[0].isActive,
          collisionState: debrisRef.current[0].collisionState,
          hasCollision: debrisRef.current[0].hasCollision
        } : null,
        debrisPositions: debrisRef.current.slice(0, 3).map(d => ({
          id: d.id,
          x: Math.round(d.x),
          width: d.width,
          isActive: d.isActive,
          collisionState: d.collisionState,
          hasCollision: d.hasCollision
        }))
      });
    }
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
    
    console.log('[FlutterFocus] Debris collision tracked:', {
      debrisId: debris.id,
      totalDebrisHit: levelDebrisHitRef.current,
              totalDebrisAvoided: levelDebrisSpawnedRef.current - levelDebrisHitRef.current
    });
    
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
      console.warn(`[FlutterFocus] Game loop called but gameState is '${currentGameState}', not 'playing'`);
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
    
    console.log('[FlutterFocus] Debris spawn check:', { 
      timer: debrisSpawnTimerRef.current, 
      interval: debrisSpawnInterval,
      shouldSpawn: debrisSpawnTimerRef.current > debrisSpawnInterval,
      currentDebris: debrisRef.current.length,
      maxDebris: DEBRIS_MAX_ON_SCREEN
    });
    
    if (debrisSpawnTimerRef.current > debrisSpawnInterval && debrisRef.current.length < DEBRIS_MAX_ON_SCREEN) {
      debrisSpawnTimerRef.current = 0;
      
      // Spawn 2-3 pieces of debris at a time for more engaging background
      // This creates a more dynamic space environment
      const debrisCount = Math.random() < 0.7 ? 2 : 3;
      
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
          
          console.log('[FlutterFocus] Collision detected with debris:', {
            debrisId: debris.id,
            debrisPos: { x: Math.round(debris.x), y: Math.round(debris.y) },
            alienPos: { x: Math.round(alien.x), y: Math.round(alien.y) },
            debrisSize: { width: debris.width, height: debris.height },
            alienSize: { width: alien.width, height: alien.height }
          });
          
          // Collision with debris! Life loss based on collision damage
          const damage = debris.collisionDamage;
          setLives(prev => {
            const newLives = Math.max(0, prev - damage);
            if (newLives <= 0) {
              // Clear all screen effects immediately
              setCollisionFlash(false);
              setCollisionParticles([]);
              
                          // Level complete - post results to Firebase
            console.log('[FlutterFocus] Level complete, calling postLevelResults');
            console.log('[FlutterFocus] Current level:', levelRef.current, 'Lives remaining:', newLives);
            postLevelResults();
            
            if (levelRef.current < 3) {
              // Move to next level (user gets 3 more lives)
              console.log('[FlutterFocus] Moving to next level, setting state to levelComplete');
              setGameState('levelComplete');
            } else {
              // All 3 levels complete - show self-reporting questions
              console.log('[FlutterFocus] All levels complete, showing self-reporting questions');
              console.log('[FlutterFocus] Setting gameState to selfReport and showQuestions to true');
              setGameState('selfReport');
              setShowQuestions(true);
              setCurrentQuestionIndex(0);
              setQuestionResponses({});
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
  }, [lives, logDebug, collisionFlash, collisionParticles, updateStars, updateBackgroundDebris, handleObstacleCollision, updateObstacleAnimations, cleanupInactiveDebris, updateDebrisCollisionAnimations, handleDebrisCollision]);
  
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
    
    // Spawn initial debris
    setTimeout(() => {
      console.log('[FlutterFocus] Spawning initial debris...');
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
  
  // Calculate ADHD assessment scores based on real gameplay performance
  // All functions return ADHD scores: lower = better performance, higher = worse ADHD
  const calculateReactionTime = useCallback(() => {
    // Calculate reaction time score based on aggregated data from all levels
    const allLevels = allLevelsDataRef.current.filter(level => level !== undefined);
    
    // Debug: Log what data we're working with
    console.log('[FlutterFocus] calculateReactionTime - allLevelsDataRef:', allLevelsDataRef.current);
    console.log('[FlutterFocus] calculateReactionTime - filtered levels:', allLevels);
    
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
    
    // Start with base score of 5 (neutral)
    let score = 5;
    
    // Lives lost is not a reliable metric since level changes at 3 lives
    // Focus on debris collision and avoidance instead
    
    // Debris collisions: fewer = better impulse control (lower ADHD score)
    // Much stricter scoring - 9 hits should be penalized as poor performance
    if (totalDebrisHit === 0) score -= 3; // Best case: score = 2
    else if (totalDebrisHit <= 2) score -= 2; // Excellent: score = 3
    else if (totalDebrisHit <= 4) score -= 1; // Good: score = 4
    else if (totalDebrisHit <= 6) score += 0; // Fair: score = 5
    else if (totalDebrisHit <= 8) score += 1; // Below average: score = 6
    else if (totalDebrisHit === 9) score += 2; // Poor: score = 7 (was neutral)
    else if (totalDebrisHit > 9) score += 3; // Very poor: score = 8+
    
    // Debris avoided: more = better impulse control (lower ADHD score)
    // Much stricter scoring for debris avoidance
    if (totalDebrisAvoided >= 30) score -= 2; // Best: score -2
    else if (totalDebrisAvoided >= 25) score -= 1.5; // Excellent: score -1.5
    else if (totalDebrisAvoided >= 20) score -= 1; // Good: score -1
    else if (totalDebrisAvoided >= 15) score -= 0.5; // Fair: score -0.5
    else if (totalDebrisAvoided >= 10) score += 0; // Poor: score +0
    else if (totalDebrisAvoided >= 5) score += 1; // Very poor: score +1
    else score += 2; // Worst: score +2
    

    
    // Ensure score is between 1-10 and not negative
    const finalScore = Math.max(1, Math.min(10, Math.round(score)));
    console.log(`[FlutterFocus] calculateImpulseControl - final score: ${finalScore} (was ${score})`);
    return finalScore;
  }, []);
  
  const calculateSustainedAttention = useCallback(() => {
    // Calculate sustained attention based on aggregated data from all levels
    const allLevels = allLevelsDataRef.current.filter(level => level !== undefined);
    const totalScore = allLevels.reduce((sum, level) => sum + (level?.score || 0), 0);
    const totalDebrisAvoided = allLevels.reduce((sum, level) => sum + (level?.debrisAvoided || 0), 0);
    const totalDuration = allLevels.reduce((sum, level) => sum + (level?.duration || 0), 0);
    const levelsCompleted = allLevels.length;
    
    // Start with base score of 5 (neutral)
    let score = 5;
    
    // Level completion: more levels completed = better sustained attention (lower ADHD score)
    if (levelsCompleted === 3) score -= 2; // Best case: score = 3
    else if (levelsCompleted === 2) score -= 1; // Good: score = 4
    else if (levelsCompleted === 1) score += 0; // Neutral: score = 5
    
    // Score achievement: higher total scores indicate better focus (lower ADHD score)
    // Much stricter scoring - your total score of 4608 should be penalized
    if (totalScore >= 5000) score -= 3; // Best case: score = 2
    else if (totalScore >= 4000) score -= 2; // Excellent: score = 3
    else if (totalScore >= 3000) score -= 1; // Good: score = 4
    else if (totalScore >= 2000) score += 0; // Fair: score = 5
    else if (totalScore >= 1000) score += 1; // Poor: score = 6
    else score += 2; // Very poor: score = 7+
    
    // Debris avoidance: shows sustained attention to obstacles (lower ADHD score)
    // Much stricter scoring - your total of 36 should be penalized
    if (totalDebrisAvoided >= 50) score -= 2; // Best case: score -2
    else if (totalDebrisAvoided >= 40) score -= 1.5; // Excellent: score -1.5
    else if (totalDebrisAvoided >= 30) score -= 1; // Good: score -1
    else if (totalDebrisAvoided >= 20) score -= 0.5; // Fair: score -0.5
    else if (totalDebrisAvoided >= 10) score += 0; // Poor: score +0
    else if (totalDebrisAvoided >= 5) score += 1; // Very poor: score +1
    else score += 2; // Worst: score +2
    
    // Duration: very short total time might indicate lack of focus (higher ADHD score)
    // Much stricter scoring for duration
    if (totalDuration < 25000) score += 2; // Less than 25 seconds total (very poor)
    else if (totalDuration < 35000) score += 1; // Less than 35 seconds total (poor)
    else if (totalDuration < 45000) score += 0.5; // Less than 45 seconds total (below average)
    

    
    // Ensure score is between 1-10 and not negative
    const finalScore = Math.max(1, Math.min(10, Math.round(score)));
    console.log(`[FlutterFocus] calculateSustainedAttention - final score: ${finalScore} (was ${score})`);
    return finalScore;
  }, []);
  
  // Calculate final ADHD scores integrating gameplay and self-assessment (60% gameplay, 40% self-report)
  const calculateFinalADHDScores = useCallback((gameplayScores: any, selfReport: any) => {
    // Convert self-report scores (1-5) to ADHD scores (1-10)
    // Higher self-report scores = higher ADHD scores (worse performance)
    // We want self-report to contribute 4 out of 10 when answer is 5 (40% weight)
    // So map 1→1, 2→3, 3→5, 4→7, 5→10
    // This means: 40% of 10 = 4 points from self-report when answer is 5
    // 
    // IMPORTANT: All questions now follow the same logic:
    // - Higher self-report score = Higher ADHD score (worse performance)
    // - No more inverted logic confusion
    const convertSelfReportToADHD = (selfReportScore: number) => {
      // Map 1-5 to 1-10 so that 40% of 10 = 4 points exactly
      return 1 + (selfReportScore - 1) * 2.25;
    };
    
    // Calculate self-report based ADHD scores
    let selfReportInattention = 5; // Neutral base
    let selfReportHyperactivity = 5;
    let selfReportImpulsivity = 5;
    let selfReportExecutiveFunction = 5;
    
    if (selfReport) {
      // ALL QUESTIONS: Higher self-report score = Higher ADHD score (worse performance)
      // No inverted logic - consistent scoring across all questions
      
      // Focus difficulty (q1_flutter_focus_difficulty: 1-5, higher = more difficulty)
      if (selfReport.q1_flutter_focus_difficulty) {
        const originalScore = selfReport.q1_flutter_focus_difficulty;
        selfReportInattention = convertSelfReportToADHD(originalScore);
      }
      
      // Impulsive movements (q2_flutter_impulsive_movements: 1-5, higher = more impulsive)
      if (selfReport.q2_flutter_impulsive_movements) {
        const originalScore = selfReport.q2_flutter_impulsive_movements;
        const impulsiveScore = convertSelfReportToADHD(originalScore);
        selfReportHyperactivity = impulsiveScore;
        selfReportImpulsivity = impulsiveScore;
      }
      
      // Frustration level (q3_flutter_frustration_level: 1-5, higher = more frustration)
      if (selfReport.q3_flutter_frustration_level) {
        const originalScore = selfReport.q3_flutter_frustration_level;
        const frustrationScore = convertSelfReportToADHD(originalScore);
        // Frustration affects all areas
        selfReportInattention = Math.max(selfReportInattention, frustrationScore);
        selfReportHyperactivity = Math.max(selfReportHyperactivity, frustrationScore);
        selfReportImpulsivity = Math.max(selfReportImpulsivity, frustrationScore);
        selfReportExecutiveFunction = Math.max(selfReportExecutiveFunction, frustrationScore);
      }
      
      // Planning ability (q4_flutter_planning_ability: 1-5, higher = better planning)
      if (selfReport.q4_flutter_planning_ability) {
        const originalScore = selfReport.q4_flutter_planning_ability;
        // For planning ability: 1=excellent (ADHD score 1), 5=poor (ADHD score 5)
        // We want excellent planning (1) to result in low ADHD score (1)
        // Use convertSelfReportToADHD for consistent mapping
        selfReportExecutiveFunction = convertSelfReportToADHD(originalScore);
      }
      
      // Persistence motivation (q5_flutter_persistence_motivation: 1-5, higher = better persistence)
      if (selfReport.q5_flutter_persistence_motivation) {
        const originalScore = selfReport.q5_flutter_persistence_motivation;
        // For persistence: 1=excellent (ADHD score 1), 5=poor (ADHD score 5)
        // We want excellent persistence (1) to result in low ADHD score (1)
        // Persistence affects both inattention AND executive function
        // Use convertSelfReportToADHD for consistent mapping
        const persistenceScore = convertSelfReportToADHD(originalScore);
        selfReportInattention = Math.min(selfReportInattention, persistenceScore); // Take the better score
        selfReportExecutiveFunction = Math.min(selfReportExecutiveFunction, persistenceScore); // Take the better score
      }
    }
    

    
    // Calculate final scores: 70% gameplay + 30% self-report
    // When self-report is 5 (worst), it contributes 4 points (40% weight)
    // When self-report is 1 (best), it contributes 0.4 points
    // 
    // IMPORTANT: gameplayScores.sustainedAttention and gameplayScores.impulseControl are ADHD scores (lower = better)
    // But gameplayScores.overall is a PERFORMANCE score (higher = better) - we need to convert it to ADHD score
    const inattention = (gameplayScores.sustainedAttention * 0.6) + (selfReportInattention * 0.4);
    const hyperactivity = (gameplayScores.impulseControl * 0.6) + (selfReportHyperactivity * 0.4);
    const impulsivity = (gameplayScores.impulseControl * 0.6) + (selfReportImpulsivity * 0.4);
    
    // Convert overall performance score back to ADHD score: 11 - performanceScore
    const overallADHDScore = 11 - gameplayScores.overall;
    const executiveFunction = (overallADHDScore * 0.6) + (selfReportExecutiveFunction * 0.4);
    
    // Debug: Log the calculation breakdown
    console.log('[FlutterFocus] calculateFinalADHDScores - calculation breakdown:', {
      gameplayScores,
      selfReportScores: { selfReportInattention, selfReportHyperactivity, selfReportImpulsivity, selfReportExecutiveFunction },
      overallADHDScore,
      weighting: '60% gameplay + 40% self-report',
      finalScores: { inattention, hyperactivity, impulsivity, executiveFunction }
    });
    
    // Calculate ADHD composite score with proper decimal precision
    const rawSum = inattention + hyperactivity + impulsivity + executiveFunction;
    const rawAverage = rawSum / 4;
    const adhdComposite = Math.round(rawAverage * 10) / 10;
    
    // Log the exact calculation for medical precision
    console.log('[FlutterFocus] Composite calculation details:', {
      individualScores: { inattention, hyperactivity, impulsivity, executiveFunction },
      sum: rawSum,
      average: rawAverage,
      roundedComposite: adhdComposite,
      calculation: `${inattention} + ${hyperactivity} + ${impulsivity} + ${executiveFunction} = ${rawSum} / 4 = ${rawAverage} → ${adhdComposite}`
    });
    

    

    
    // Ensure all ADHD scores are non-negative and within valid range
    const validInattention = Math.max(1, Math.min(10, Math.round(inattention * 10) / 10));
    const validHyperactivity = Math.max(1, Math.min(10, Math.round(hyperactivity * 10) / 10));
    const validImpulsivity = Math.max(1, Math.min(10, Math.round(impulsivity * 10) / 10));
    const validExecutiveFunction = Math.max(1, Math.min(10, Math.round(executiveFunction * 10) / 10));
    const validAdhdComposite = Math.max(1, Math.min(10, Math.round(adhdComposite * 10) / 10));
    
    // Debug: Log the final validation
    console.log('[FlutterFocus] calculateFinalADHDScores - final validation:', {
      raw: { inattention, hyperactivity, impulsivity, executiveFunction, adhdComposite },
      valid: { validInattention, validHyperactivity, validImpulsivity, validExecutiveFunction, validAdhdComposite }
    });
    
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
      
      // Debug: Log what we're calculating
      console.log('[FlutterFocus] calculateAllADHDScores - gameplayScores:', gameplayScores);
      
      const scores = calculateFinalADHDScores(gameplayScores, questionResponses);
      
      // Debug: Log final scores
      console.log('[FlutterFocus] calculateAllADHDScores - final scores:', scores);
      
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
      
      console.log('[FlutterFocus] calculateAllADHDScores - returning:', result);
      return result;
    } catch (error) {
      console.error('[FlutterFocus] Error in calculateAllADHDScores:', error);
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

      
      const levelData = {
        userId,
        level: levelRef.current,
        score: levelScoreRef.current,
        lives: 0, // Level ended with 0 lives
        timestamp: new Date().toISOString(),
        gameType: 'FlutterFocus',
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
          const docRef = doc(db, 'users', userId, 'games', 'FlutterFocus');

          
          // Get existing document to preserve selfReport data
          const existingDoc = await getDoc(docRef);
          const existingData = existingDoc.exists() ? existingDoc.data() : {};
          
          // Store this level's data in our tracking array
          const debrisAvoided = Math.max(0, levelDebrisSpawnedRef.current - levelDebrisHitRef.current);
          const validScore = Math.max(0, levelScoreRef.current);
          const validDuration = Math.max(0, Date.now() - levelStartTimeRef.current);
          const validReactionTime = Math.max(0, levelReactionTimeRef.current);
          
          allLevelsDataRef.current[levelRef.current - 1] = {
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
        const roundsRef = collection(db, 'users', userId, 'games', 'FlutterFocus', 'rounds');
        
        
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
      console.log('[FlutterFocus] postFinalResults called with userId:', userId);
      
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
        gameType: 'FlutterFocus',
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
        const docRef = doc(db, 'users', userId, 'games', 'FlutterFocus');
        
        
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
          
          // Save empty selfReport for now (will be populated when questions are completed)
          selfReport: {},
          
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
        
        
        
        // Post to rounds subcollection for final round
        const roundsRef = collection(db, 'users', userId, 'games', 'FlutterFocus', 'rounds');
        
        
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
            selfReportResponses: { ...questionResponses }
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
  }, [currentQuestionIndex]);

  // Handle questions completion
  const handleQuestionsComplete = useCallback(async () => {

    
    // Calculate real metrics from all levels data
    const allLevels = allLevelsDataRef.current.filter(level => level !== undefined);
    const totalLivesLost = allLevels.reduce((sum, level) => sum + (level?.livesLost || 0), 0);
    const totalDebrisHit = allLevels.reduce((sum, level) => sum + (level?.debrisHit || 0), 0);
    const totalDebrisAvoided = allLevels.reduce((sum, level) => sum + ((level?.debrisSpawned || 0) - (level?.debrisHit || 0)), 0);
    const totalReactionTime = allLevels.reduce((sum, level) => sum + (level?.reactionTime || 0), 0);
    const averageReactionTime = allLevels.length > 0 ? totalReactionTime / allLevels.length : 0;
    
    // Calculate level-specific arrays
    const levelScores = [];
    const levelCompletionTimes = [];
    
    for (let i = 1; i <= 3; i++) {
      const levelData = allLevelsDataRef.current[i - 1];
      if (levelData) {
        levelScores.push(levelData.score);
        levelCompletionTimes.push(levelData.duration);
      } else {
        levelScores.push(0);
        levelCompletionTimes.push(0);
      }
    }
    
    // Ensure all values are non-negative
    const validTotalPlayTime = Math.max(0, Date.now() - gameStartTimeRef.current);
    const validFinalScore = Math.max(0, score);
    const validTotalLivesLost = Math.max(0, totalLivesLost);
    const validTotalDebrisHit = Math.max(0, totalDebrisHit);
    const validTotalDebrisAvoided = Math.max(0, totalDebrisAvoided);
    const validLevelScores = levelScores.map(s => Math.max(0, s));
    const validLevelCompletionTimes = levelCompletionTimes.map(t => Math.max(0, t));
    
    // All questions completed - finish the game
    const finalGameData = {
      startTime: gameStartTimeRef.current,
      endTime: Date.now(),
      totalPlayTime: validTotalPlayTime,
      gameCompleted: true,
      finalScore: validFinalScore,
      livesLost: validTotalLivesLost,
      totalCrashes: validTotalDebrisHit,
      totalObstaclesAvoided: validTotalDebrisAvoided,
      totalObstaclesHit: validTotalDebrisHit,
      currentLevel: 3,
      levelsCompleted: allLevels.length,
      levelScores: validLevelScores,
      levelCompletionTimes: validLevelCompletionTimes,
      adhdScores: calculateAllADHDScores(),
      selfReportResponses: { ...questionResponses }
    };
    
    // Save to Firebase
    try {
      if (userId) {
        // Save to flutterFocusResults collection for historical data
        await addDoc(collection(db, 'flutterFocusResults'), {
          ...finalGameData,
          userId,
          timestamp: new Date().toISOString(),
          finalRound: true
        });
        

        
        // Also update the main game document that GameResultsPage reads from
        const docRef = doc(db, 'users', userId, 'games', 'FlutterFocus');
        
        
        
        // First, completely replace the scores to ensure no old data remains
        // Check if we have the required data to calculate scores
        const allLevels = allLevelsDataRef.current.filter(level => level !== undefined);
        console.log('[FlutterFocus] Available level data for score calculation:', {
          levelCount: allLevels.length,
          levels: allLevels.map(l => ({ level: l.level, score: l.score, debrisHit: l.debrisHit, debrisAvoided: l.debrisAvoided }))
        });
        
        const scoresToSave = calculateAllADHDScores();
        console.log('[FlutterFocus] Saving scores to Firebase:', scoresToSave);
        console.log('[FlutterFocus] Scores validation:', {
          hasInattention: !!scoresToSave.inattention,
          hasHyperactivity: !!scoresToSave.hyperactivity,
          hasImpulsivity: !!scoresToSave.impulsivity,
          hasExecutiveFunction: !!scoresToSave.executive_function,
          hasAdhdComposite: !!scoresToSave.adhd_composite,
          allKeys: Object.keys(scoresToSave)
        });
        
        // Verify the composite calculation manually
        const manualComposite = (scoresToSave.inattention + scoresToSave.hyperactivity + scoresToSave.impulsivity + scoresToSave.executive_function) / 4;
        console.log('[FlutterFocus] Manual composite verification:', {
          individual: [scoresToSave.inattention, scoresToSave.hyperactivity, scoresToSave.impulsivity, scoresToSave.executive_function],
          sum: scoresToSave.inattention + scoresToSave.hyperactivity + scoresToSave.impulsivity + scoresToSave.executive_function,
          average: manualComposite,
          rounded: Math.round(manualComposite * 10) / 10,
          saved: scoresToSave.adhd_composite
        });
        
        await setDoc(docRef, {
          scores: scoresToSave
        }, { merge: false }); // Don't merge - completely replace scores
        
        // Verify the save by reading it back
        const verifyDoc = await getDoc(docRef);
        if (verifyDoc.exists()) {
          const savedData = verifyDoc.data();
          console.log('[FlutterFocus] Verified saved scores:', savedData.scores);
        }
        
        // Then update the rest of the document
        await setDoc(docRef, {
          finalResults: finalGameData,
          gameCompleted: true,
          lastUpdated: new Date().toISOString(),
          
          // Save the self-report data
          selfReport: questionResponses,
          
          // Save individual level data for all levels
          level1Data: allLevelsDataRef.current[0] || null,
          level2Data: allLevelsDataRef.current[1] || null,
          level3Data: allLevelsDataRef.current[2] || {
            level: 3,
            score: score,
            livesLost: totalLivesLost,
            debrisHit: totalDebrisHit,
            debrisSpawned: totalDebrisHit + totalDebrisAvoided,
            debrisAvoided: totalDebrisAvoided,
            duration: Date.now() - gameStartTimeRef.current,
            reactionTime: averageReactionTime,
            startTime: gameStartTimeRef.current,
            timestamp: new Date().toISOString()
          }
        }, { merge: true });
        

        logDebug('Final results and self-report data successfully posted to Firebase');
        
        // Now that Firebase save is complete, we can safely call onGameComplete
        // Close questions modal
        setShowQuestions(false);
        setCurrentQuestionIndex(0);
        setQuestionResponses({});
        setQuestionsCompleted(false);
        
        // Set game to complete state
        setGameState('gameComplete');
        
        // Call the completion callback AFTER Firebase save is complete
        if (onGameComplete) {

          onGameComplete(finalGameData);
        }
      }
    } catch (error) {
      console.error('[FlutterFocus] Failed to save game data to Firebase:', error);
      if (onError) {
        onError(`Failed to save game data: ${error}`);
      }
      
      // Even if Firebase save fails, we should still close the questions and complete the game
      setShowQuestions(false);
      setCurrentQuestionIndex(0);
      setQuestionResponses({});
      setQuestionsCompleted(false);
      setGameState('gameComplete');
      
      if (onGameComplete) {

        onGameComplete(finalGameData);
      }
    }
  }, [score, questionResponses, userId, logDebug, onGameComplete, onError, calculateSustainedAttention, calculateImpulseControl, calculateOverallScore]);
  
  // Start next level
  const startNextLevel = useCallback(() => {
    const nextLevel = levelRef.current + 1;
    logDebug('Starting next level:', nextLevel);

    
    // Safety check - prevent going beyond Level 3
    if (nextLevel > 3) {

      logDebug('Cannot start level beyond 3, showing self-reporting questions');
      setGameState('selfReport');
      setShowQuestions(true);
      setCurrentQuestionIndex(0);
      setQuestionResponses({});
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
    console.log(`[FlutterFocus] All levels data after save:`, allLevelsDataRef.current);
    

    
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
  
  // Monitor game state changes
  useEffect(() => {
    console.log('[FlutterFocus] Game state changed to:', gameState, {
      showQuestions,
      currentQuestionIndex,
      questionResponsesCount: Object.keys(questionResponses).length
    });
    logDebug('Game state changed', { newState: gameState });
  }, [gameState, showQuestions, currentQuestionIndex, questionResponses, logDebug]);
  
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
  
  // Render game based on state using GameStateManager
  return (
    <>
      {/* Render self-report questions outside of height constraints when active */}
      {gameState === 'selfReport' && showQuestions && (
        <>
          {console.log('[FlutterFocus] ✅ Rendering SelfReportQuestions - Conditions met:', { 
            gameState, 
            showQuestions, 
            questionsCount: QUESTIONS.length,
            currentQuestionIndex,
            questionResponses,
            questionResponsesKeys: Object.keys(questionResponses)
          })}
          <SelfReportQuestions
            questions={QUESTIONS}
            currentQuestionIndex={currentQuestionIndex}
            questionResponses={questionResponses}
            onQuestionResponse={handleQuestionResponse}
            onQuestionsComplete={handleQuestionsComplete}
            onPreviousQuestion={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            onNextQuestion={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
          />
        </>
      )}
      
      {/* Debug: Show when conditions are NOT met */}
      {!(gameState === 'selfReport' && showQuestions) && (
        <>
          {console.log('[FlutterFocus] ❌ NOT rendering SelfReportQuestions - Conditions NOT met:', { 
            gameState, 
            showQuestions, 
            gameStateIsSelfReport: gameState === 'selfReport',
            bothConditionsMet: gameState === 'selfReport' && showQuestions
          })}
        </>
      )}
      
      {/* Debug: Show current game state and question status */}
      {console.log('[FlutterFocus] Current game state:', {
        gameState,
        showQuestions,
        currentQuestionIndex,
        questionResponsesCount: Object.keys(questionResponses).length,
        questionResponsesKeys: Object.keys(questionResponses)
      })}
      
      {/* Render main game content */}
      <GameStateManager
        gameState={gameState}
        showQuestions={showQuestions}
        currentQuestionIndex={currentQuestionIndex}
        questionResponses={questionResponses}
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
        debugData={{
          level,
          debrisHit: levelDebrisHitRef.current,
          debrisAvoided: levelDebrisSpawnedRef.current - levelDebrisHitRef.current,
          reactionTime: levelReactionTimeRef.current,
          reactionCount: reactionTimesRef.current.length,
          spawnTimesCount: obstacleSpawnTimesRef.current.size
        }}
      />
    </>
  );
};

export default FlutterFocusGame; 