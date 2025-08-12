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
  const levelDebrisAvoidedRef = useRef(0);
  const levelReactionTimeRef = useRef(0);
  const levelScoreRef = useRef(0);
  
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
        // Only rotate if rotation speed is not 'none'
        rotation: debris.rotationSpeed === 'none' ? debris.rotation : debris.rotation + DEBRIS_ROTATION_SPEEDS[debris.rotationSpeed]
      }))
      .filter(debris => debris.x > -debris.width && debris.isActive); // Remove debris that's off-screen or inactive
    
    // Update React state to keep it in sync
    setBackgroundDebris([...debrisRef.current]);
    
    // Debug: log debris count and positions
    if (debrisRef.current.length > 0 && Math.random() < 0.05) { // Log 5% of the time
      console.log('[FlutterFocus] Debris update:', { 
        count: debrisRef.current.length, 
        active: debrisRef.current.filter(d => d.isActive).length,
        firstDebris: debrisRef.current[0] ? { 
          x: Math.round(debrisRef.current[0].x), 
          y: Math.round(debrisRef.current[0].y),
          width: debrisRef.current[0].width,
          speed: debrisRef.current[0].speed,
          isActive: debrisRef.current[0].isActive
        } : null 
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
  
  // Post level results to Firebase
  const postLevelResults = useCallback(async () => {
    try {
      console.log('[FlutterFocus] postLevelResults called with userId:', userId);
      
      // Calculate ADHD scores for this level
      const reactionTime = calculateReactionTime();
      const impulseControl = calculateImpulseControl();
      const sustainedAttention = calculateSustainedAttention();
      const overallScore = calculateOverallScore();
      
      console.log('[FlutterFocus] Calculated scores:', {
        reactionTime,
        impulseControl,
        sustainedAttention,
        overallScore
      });
      
      const levelData = {
        userId,
        level: levelRef.current,
        score,
        lives: 0, // Level ended with 0 lives
        timestamp: new Date().toISOString(),
        gameType: 'FlutterFocus',
        levelStats: {
          finalScore: score,
          livesLost: 3, // All 3 lives were lost
          levelDuration: Date.now() - gameStartTimeRef.current,
          debrisHit: 0, // TODO: Track debris collisions
          debrisAvoided: 0, // TODO: Track debris avoided
          shootingStarsSeen: 0, // TODO: Track shooting stars
          accuracy: 0, // TODO: Calculate accuracy
          reactionTime: 0 // TODO: Track reaction time
        }
      };
      
      logDebug('Posting level results to Firebase:', levelData);
      console.log('[FlutterFocus] About to save to Firebase:', levelData);
      
              // Post to main game document with the structure expected by GameResultsPage
        if (userId) {
          const docRef = doc(db, 'users', userId, 'games', 'FlutterFocus');
          console.log('[FlutterFocus] Saving to document:', docRef.path);
          
          // Get existing document to preserve selfReport data
          const existingDoc = await getDoc(docRef);
          const existingData = existingDoc.exists() ? existingDoc.data() : {};
          
          await setDoc(docRef, {
            [`level${levelRef.current}Data`]: levelData,
            lastUpdated: new Date().toISOString(),
            currentLevel: levelRef.current,
            gameCompleted: false,
            
            // Save the scores structure expected by GameResultsPage
            scores: {
              inattention: sustainedAttention,
              hyperactivity: 10 - impulseControl, // Inverse relationship
              impulsivity: 10 - impulseControl,
              executive_function: overallScore,
              adhd_composite: overallScore
            },
            
            // Preserve existing selfReport data if it exists, otherwise save empty object
            selfReport: existingData.selfReport || {},
            
            // Save rounds data
            rounds: [
              {
                roundNumber: levelRef.current,
                roundType: 'level',
                startTime: gameStartTimeRef.current,
                endTime: Date.now(),
                duration: Date.now() - gameStartTimeRef.current,
                score: score,
                livesLost: 3,
                debrisHit: 0,
                debrisAvoided: 0,
                shootingStarsSeen: 0,
                accuracy: 0,
                reactionTime: reactionTime,
                timestamp: new Date().toISOString()
              }
            ]
          }, { merge: true });
        
        console.log('[FlutterFocus] Successfully saved level data to main document');
        
        // Post to rounds subcollection for detailed tracking
        const roundsRef = collection(db, 'users', userId, 'games', 'FlutterFocus', 'rounds');
        console.log('[FlutterFocus] Adding to rounds collection:', roundsRef.path);
        
        await addDoc(roundsRef, {
          roundNumber: levelRef.current,
          roundType: 'level',
          startTime: gameStartTimeRef.current,
          endTime: Date.now(),
          duration: Date.now() - gameStartTimeRef.current,
          score: score,
          livesLost: 3,
          debrisHit: 0,
          debrisAvoided: 0,
          shootingStarsSeen: 0,
          accuracy: 0,
          reactionTime: 0,
          timestamp: new Date().toISOString()
        });
        
        console.log('[FlutterFocus] Successfully added to rounds collection');
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
      
      // Calculate ADHD scores based on game performance
      const reactionTime = calculateReactionTime();
      const impulseControl = calculateImpulseControl();
      const sustainedAttention = calculateSustainedAttention();
      const overallScore = calculateOverallScore();
      
      console.log('[FlutterFocus] Calculated final scores:', {
        reactionTime,
        impulseControl,
        sustainedAttention,
        overallScore
      });
      
      const finalData = {
        userId,
        gameType: 'FlutterFocus',
        assessmentComplete: true,
        finalScore: score,
        totalLivesLost: 9, // 3 lives lost per level * 3 levels
        totalPlayTime: Date.now() - gameStartTimeRef.current,
        completionTimestamp: new Date().toISOString(),
        levelScores: [score], // TODO: Track individual level scores
        levelCompletionTimes: [0], // TODO: Track individual level times
        levelLivesLost: [3, 3, 3], // TODO: Track per-level lives lost
        levelDebrisHit: [0, 0, 0], // TODO: Track per-level debris collisions
        levelDebrisAvoided: [0, 0, 0], // TODO: Track per-level debris avoided
        levelShootingStarsSeen: [0, 0, 0], // TODO: Track per-level shooting stars
        levelAccuracy: [0, 0, 0], // TODO: Track per-level accuracy
        levelReactionTime: [0, 0, 0], // TODO: Track per-level reaction time
        overallAccuracy: 0, // TODO: Calculate overall accuracy
        averageReactionTime: 0, // TODO: Calculate average reaction time
        assessmentMetrics: {
          focusLevel: 0, // TODO: Calculate focus level
          reactionSpeed: 0, // TODO: Calculate reaction speed
          accuracyScore: 0, // TODO: Calculate accuracy score
          consistencyScore: 0, // TODO: Calculate consistency score
          adhdIndicators: [] // TODO: Calculate ADHD indicators
        }
      };
      
      logDebug('Posting final results to Firebase:', finalData);
      console.log('[FlutterFocus] About to save final results to Firebase:', finalData);
      
      // Post to main game document with the structure expected by GameResultsPage
      if (userId) {
        const docRef = doc(db, 'users', userId, 'games', 'FlutterFocus');
        console.log('[FlutterFocus] Saving final results to document:', docRef.path);
        
        await setDoc(docRef, {
          // Save the final results
          finalResults: finalData,
          lastUpdated: new Date().toISOString(),
          currentLevel: 3,
          gameCompleted: true,
          assessmentComplete: true,
          
          // Save the scores structure expected by GameResultsPage
          scores: {
            inattention: sustainedAttention,
            hyperactivity: 10 - impulseControl, // Inverse relationship
            impulsivity: 10 - impulseControl,
            executive_function: overallScore,
            adhd_composite: overallScore
          },
          
          // Save empty selfReport for now (will be populated when questions are completed)
          selfReport: {},
          
          // Save rounds data
          rounds: [
            {
              roundNumber: 1,
              roundType: 'level',
              startTime: gameStartTimeRef.current,
              endTime: Date.now(),
              duration: Date.now() - gameStartTimeRef.current,
              score: score,
              livesLost: 3,
              debrisHit: 0,
              debrisAvoided: 0,
              shootingStarsSeen: 0,
              accuracy: 0,
              reactionTime: reactionTime,
              timestamp: new Date().toISOString()
            }
          ]
        }, { merge: true });
        
        console.log('[FlutterFocus] Successfully saved final results to main document');
        
        // Post to rounds subcollection for final round
        const roundsRef = collection(db, 'users', userId, 'games', 'FlutterFocus', 'rounds');
        console.log('[FlutterFocus] Adding final round to rounds collection:', roundsRef.path);
        
        await addDoc(roundsRef, {
          roundNumber: 3,
          roundType: 'final',
          startTime: gameStartTimeRef.current,
          endTime: Date.now(),
          duration: Date.now() - gameStartTimeRef.current,
          score: score,
          livesLost: 3,
          debrisHit: 0,
          debrisAvoided: 0,
          shootingStarsSeen: 0,
          accuracy: 0,
          reactionTime: 0,
          timestamp: new Date().toISOString(),
          finalRound: true
        });
        
        console.log('[FlutterFocus] Successfully added final round to rounds collection');
        logDebug('Final results successfully posted to Firebase');
        
        // Notify parent component that ADHD assessment is complete
        if (onGameComplete) {
          console.log('[FlutterFocus] Calling onGameComplete callback');
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
              inattention: sustainedAttention,
              hyperactivity: 10 - impulseControl, // Inverse relationship
              impulsivity: 10 - impulseControl,
              executiveFunction: overallScore
            },
            selfReportResponses: { ...questionResponses }

          });
        } else {
          console.log('[FlutterFocus] No onGameComplete callback provided');
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
    console.log('[FlutterFocus] Question response received:', {
      questionId: currentQuestion.id,
      response: response,
      currentIndex: currentQuestionIndex,
      totalQuestions: QUESTIONS.length
    });
    
    setQuestionResponses(prev => {
      const newResponses = {
        ...prev,
        [currentQuestion.id]: response
      };
      console.log('[FlutterFocus] Updated question responses:', newResponses);
      return newResponses;
    });
  }, [currentQuestionIndex]);

  // Handle questions completion
  const handleQuestionsComplete = useCallback(async () => {
    console.log('[FlutterFocus] Questions completed, finalizing game with responses:', questionResponses);
    
    // All questions completed - finish the game
    const finalGameData = {
      startTime: gameStartTimeRef.current,
      endTime: Date.now(),
      totalPlayTime: Date.now() - gameStartTimeRef.current,
      gameCompleted: true,
      finalScore: score,
      livesLost: 9, // 3 lives lost per level * 3 levels
      totalCrashes: 9, // Same as crashes
      totalObstaclesAvoided: 0, // TODO: Track this
      totalObstaclesHit: 9, // Same as crashes
      currentLevel: 3,
      levelsCompleted: 3,
      levelScores: [score], // TODO: Track individual level scores
      levelCompletionTimes: [0], // TODO: Track individual level times
      adhdScores: {
        inattention: calculateSustainedAttention(),
        hyperactivity: 10 - calculateImpulseControl(), // Inverse relationship
        impulsivity: 10 - calculateImpulseControl(),
        executiveFunction: calculateOverallScore()
      },
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
        
        console.log('[FlutterFocus] Game data saved to flutterFocusResults collection successfully');
        
        // Also update the main game document that GameResultsPage reads from
        const docRef = doc(db, 'users', userId, 'games', 'FlutterFocus');
        
        console.log('[FlutterFocus] About to save final game data with selfReport:', {
          questionResponses,
          questionResponsesKeys: Object.keys(questionResponses),
          questionResponsesCount: Object.keys(questionResponses).length
        });
        
        await setDoc(docRef, {
          finalResults: finalGameData,
          gameCompleted: true,
          lastUpdated: new Date().toISOString(),
          
          // Save the scores structure expected by GameResultsPage
          scores: {
            inattention: calculateSustainedAttention(),
            hyperactivity: 10 - calculateImpulseControl(), // Inverse relationship
            impulsivity: 10 - calculateImpulseControl(),
            executive_function: calculateOverallScore(),
            adhd_composite: calculateOverallScore()
          },
          
          // Save the self-report data
          selfReport: questionResponses,
          
          // Save final level data
          level3Data: {
            duration: Date.now() - gameStartTimeRef.current,
            livesLost: 3,
            debrisHit: 0,
            debrisAvoided: 0,
            reactionTime: 0,
            timestamp: new Date().toISOString()
          }
        }, { merge: true });
        
        console.log('[FlutterFocus] Main game document updated with self-report data successfully');
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
          console.log('[FlutterFocus] Firebase save complete, calling onGameComplete');
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
        console.log('[FlutterFocus] Firebase save failed, but calling onGameComplete anyway');
        onGameComplete(finalGameData);
      }
    }
  }, [score, questionResponses, userId, logDebug, onGameComplete, onError, calculateSustainedAttention, calculateImpulseControl, calculateOverallScore]);
  
  // Start next level
  const startNextLevel = useCallback(() => {
    const nextLevel = levelRef.current + 1;
    logDebug('Starting next level:', nextLevel);
    console.log('[FlutterFocus] startNextLevel called with current level:', levelRef.current, 'next level:', nextLevel);
    
    // Safety check - prevent going beyond Level 3
    if (nextLevel > 3) {
      console.log('[FlutterFocus] Cannot start level beyond 3, showing self-reporting questions');
      logDebug('Cannot start level beyond 3, showing self-reporting questions');
      setGameState('selfReport');
      setShowQuestions(true);
      setCurrentQuestionIndex(0);
      setQuestionResponses({});
      return;
    }
    
    // Increment level - update both ref and state
    levelRef.current = nextLevel;
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
      />
    </>
  );
};

export default FlutterFocusGame; 