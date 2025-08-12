import { FlutterFocusLevel, Question, DebrisSpeed, DebrisRotationSpeed, DebrisSize, DebrisConfig, ShootingStar, ShootingStarSpeed, ShootingStarLength } from './types';

// Canvas and game dimensions - following BounceBack pattern
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const ALIEN_WIDTH = 40;
export const ALIEN_HEIGHT = 40;
export const GRAVITY = 0.5;
export const JUMP_FORCE = -12;
export const MAX_FALL_SPEED = 15;

// Colors - following BounceBack pattern
export const BG_COLOR = '#0F172A'; // Dark space
export const ALIEN_COLOR = '#10B981'; // Stellar green
export const DEBRIS_COLOR = '#6B7280'; // Gray
export const PLANET_COLOR = '#8B5CF6'; // Cosmic purple
export const ASTEROID_COLOR = '#F97316'; // Orange
export const BLACKHOLE_COLOR = '#000000'; // Black
export const DECOY_COLOR = '#EF4444'; // Meteor red
export const PORTAL_COLOR = '#06B6D4'; // Cyan
export const UI_COLOR = '#F8FAFC'; // Cosmic white

// Game levels - following BounceBack pattern
export const LEVELS: FlutterFocusLevel[] = [
  {
    levelNumber: 1,
    levelName: "Calm Galaxy",
    startTime: 0,
    duration: 60000, // 60 seconds
    livesLost: 0,
    crashes: 0,
    score: 0,
    obstaclesAvoided: 0,
    obstaclesHit: 0,
    reactionTimes: [],
    inputCount: 0,
    excessInputs: 0,
    idleTime: 0,
    levelMetrics: {
      inattentionScore: 0,
      hyperactivityScore: 0,
      impulsivityScore: 0,
      executiveFunctionScore: 0
    }
  },
  {
    levelNumber: 2,
    levelName: "Asteroid Belt",
    startTime: 0,
    duration: 75000, // 75 seconds
    livesLost: 0,
    crashes: 0,
    score: 0,
    obstaclesAvoided: 0,
    obstaclesHit: 0,
    decoyCollisions: 0,
    reactionTimes: [],
    inputCount: 0,
    excessInputs: 0,
    idleTime: 0,
    levelMetrics: {
      inattentionScore: 0,
      hyperactivityScore: 0,
      impulsivityScore: 0,
      executiveFunctionScore: 0
    }
  },
  {
    levelNumber: 3,
    levelName: "Wormhole Maze",
    startTime: 0,
    duration: 90000, // 90 seconds
    livesLost: 0,
    crashes: 0,
    score: 0,
    obstaclesAvoided: 0,
    obstaclesHit: 0,
    wrongPathChoices: 0,
    memoryCueFailures: 0,
    reactionTimes: [],
    inputCount: 0,
    excessInputs: 0,
    idleTime: 0,
    levelMetrics: {
      inattentionScore: 0,
      hyperactivityScore: 0,
      impulsivityScore: 0,
      executiveFunctionScore: 0
    }
  }
];

// Assessment questions - following BounceBack pattern
export const QUESTIONS: Question[] = [
  {
    id: 'q1_flutter_focus_difficulty',
    text: 'How difficult was it to maintain focus on avoiding obstacles throughout the game?',
    category: 'attention'
  },
  {
    id: 'q2_flutter_impulsive_movements',
    text: 'How often did you find yourself jumping or moving without thinking?',
    category: 'impulsivity'
  },
  {
    id: 'q3_flutter_frustration_level',
    text: 'How frustrated did you feel when you crashed or lost a life?',
    category: 'frustration'
  },
  {
    id: 'q4_flutter_planning_ability',
    text: 'How well were you able to plan your movements in advance?',
    category: 'focus'
  },
  {
    id: 'q5_flutter_persistence_motivation',
    text: 'How motivated were you to continue playing after losing a life?',
    category: 'persistence'
  }
];

// Game constants - following PatternMatch pattern
export const TOTAL_LEVELS = 3;
export const LIVES_PER_LEVEL = 3;
export const COUNTDOWN_DURATION = 3000; // 3 seconds
export const INVULNERABILITY_DURATION = 2000; // 2 seconds after crash
export const IDLE_THRESHOLD = 2000; // 2 seconds without input considered idle

// Obstacle generation constants
export const OBSTACLE_SPAWN_INTERVAL_MIN = 1000; // 1 second
export const OBSTACLE_SPAWN_INTERVAL_MAX = 3000; // 3 seconds
export const OBSTACLE_SPEED_MIN = 2;
export const OBSTACLE_SPEED_MAX = 6;

// Scoring constants
export const POINTS_PER_OBSTACLE_AVOIDED = 10;
export const POINTS_PER_SECOND_SURVIVED = 1;
export const BONUS_POINTS_PER_LIFE_REMAINING = 50;

// Debris system constants - Optimized for better playability
// Increased spawn frequency for more engaging background
export const DEBRIS_SPAWN_INTERVAL_MIN = 500; // 0.5 seconds (was 2.0)
export const DEBRIS_SPAWN_INTERVAL_MAX = 1500; // 1.5 seconds (was 4.0)
export const DEBRIS_MAX_ON_SCREEN = 12; // Maximum debris pieces on screen (was 8)

// Debris speed values (pixels per frame) - Increased for more dynamic movement
export const DEBRIS_SPEEDS: Record<DebrisSpeed, number> = {
  slow: 2.0,      // Was 1.0 - doubled for better visibility
  medium: 4.0,    // Was 2.5 - increased for more engaging movement
  fast: 6.0,      // Was 4.0 - increased for dynamic feel
  very_fast: 10.0 // Was 6.0 - increased for exciting movement
};

// Debris rotation speeds (degrees per frame) - Increased for more visual interest
export const DEBRIS_ROTATION_SPEEDS: Record<DebrisRotationSpeed, number> = {
  none: 0.0,
  slow: 1.0,    // Was 0.5 - doubled for better visibility
  medium: 2.5,  // Was 1.5 - increased for more engaging rotation
  fast: 5.0     // Was 3.0 - increased for dynamic feel
};

// Debris configurations with different behaviors - using actual dimensions
export const DEBRIS_CONFIGS: DebrisConfig[] = [
  // Background debris (no collision, visual only) - using b1-b8 sprites
  { type: 'b1', size: 30, speed: 'slow', rotationSpeed: 'slow', hasCollision: false, collisionDamage: 0, zIndex: 1, spawnWeight: 12 },
  { type: 'b2', size: 40, speed: 'medium', rotationSpeed: 'medium', hasCollision: false, collisionDamage: 0, zIndex: 1, spawnWeight: 10 },
  { type: 'b3', size: 50, speed: 'fast', rotationSpeed: 'fast', hasCollision: false, collisionDamage: 0, zIndex: 1, spawnWeight: 8 },
  { type: 'b4', size: 35, speed: 'medium', rotationSpeed: 'slow', hasCollision: false, collisionDamage: 0, zIndex: 1, spawnWeight: 10 },
  { type: 'b5', size: 45, speed: 'fast', rotationSpeed: 'medium', hasCollision: false, collisionDamage: 0, zIndex: 1, spawnWeight: 8 },
  { type: 'b6', size: 60, speed: 'very_fast', rotationSpeed: 'fast', hasCollision: false, collisionDamage: 0, zIndex: 1, spawnWeight: 6 },
  { type: 'b7', size: 55, speed: 'medium', rotationSpeed: 'slow', hasCollision: false, collisionDamage: 0, zIndex: 1, spawnWeight: 6 },
  { type: 'b8', size: 80, speed: 'slow', rotationSpeed: 'medium', hasCollision: false, collisionDamage: 0, zIndex: 1, spawnWeight: 5 },
  
  // Collision debris (with collision, damages player) - using d1-d24 sprites
  { type: 'd1', size: 25, speed: 'slow', rotationSpeed: 'slow', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 2 },
  { type: 'd2', size: 35, speed: 'medium', rotationSpeed: 'medium', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 2 },
  { type: 'd3', size: 45, speed: 'fast', rotationSpeed: 'fast', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 1 },
  { type: 'd4', size: 30, speed: 'medium', rotationSpeed: 'slow', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 2 },
  { type: 'd5', size: 40, speed: 'fast', rotationSpeed: 'medium', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 1 },
  { type: 'd6', size: 55, speed: 'fast', rotationSpeed: 'fast', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 1 },
  { type: 'd7', size: 50, speed: 'medium', rotationSpeed: 'slow', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 1 },
  { type: 'd8', size: 70, speed: 'slow', rotationSpeed: 'medium', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 1 },
  { type: 'd9', size: 20, speed: 'fast', rotationSpeed: 'fast', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 1 },
  { type: 'd10', size: 30, speed: 'fast', rotationSpeed: 'medium', hasCollision: true, collisionDamage: 2, zIndex: 2, spawnWeight: 1 },
  { type: 'd11', size: 40, speed: 'slow', rotationSpeed: 'fast', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 2 },
  { type: 'd12', size: 50, speed: 'medium', rotationSpeed: 'slow', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 1 },
  { type: 'd13', size: 65, speed: 'fast', rotationSpeed: 'fast', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 1 },
  { type: 'd14', size: 25, speed: 'medium', rotationSpeed: 'slow', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 2 },
  { type: 'd15', size: 35, speed: 'fast', rotationSpeed: 'medium', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 1 },
  { type: 'd16', size: 45, speed: 'fast', rotationSpeed: 'fast', hasCollision: true, collisionDamage: 2, zIndex: 2, spawnWeight: 1 },
  { type: 'd17', size: 55, speed: 'slow', rotationSpeed: 'slow', hasCollision: true, collisionDamage: 2, zIndex: 2, spawnWeight: 1 },
  { type: 'd18', size: 75, speed: 'medium', rotationSpeed: 'medium', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 1 },
  { type: 'd19', size: 20, speed: 'fast', rotationSpeed: 'fast', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 1 },
  { type: 'd20', size: 30, speed: 'slow', rotationSpeed: 'slow', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 2 },
  { type: 'd21', size: 40, speed: 'medium', rotationSpeed: 'medium', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 2 },
  { type: 'd22', size: 50, speed: 'fast', rotationSpeed: 'fast', hasCollision: true, collisionDamage: 1, zIndex: 2, spawnWeight: 1 },
  { type: 'd23', size: 70, speed: 'slow', rotationSpeed: 'slow', hasCollision: true, collisionDamage: 3, zIndex: 2, spawnWeight: 1 }
];

// Z-index layers
export const Z_INDEX_LAYERS = {
  BACKGROUND_STARS: 0,
  SHOOTING_STARS: 1,
  BACKGROUND_DEBRIS: 2,
  GAME_OBJECTS: 3,
  FOREGROUND_DEBRIS: 4,
  UI: 5
};

// Shooting star system constants - Optimized for better playability
// Reduced spawn frequency to make the game less overwhelming
export const SHOOTING_STAR_SPAWN_INTERVAL_MIN = 6000; // 6 seconds (was 3)
export const SHOOTING_STAR_SPAWN_INTERVAL_MAX = 15000; // 15 seconds (was 8)
export const SHOOTING_STAR_MAX_ON_SCREEN = 1; // Maximum shooting stars on screen (was 2)

// Shooting star speed values (pixels per frame)
export const SHOOTING_STAR_SPEEDS: Record<ShootingStarSpeed, number> = {
  slow: 2.0,
  medium: 4.0,
  fast: 6.0
};

// Shooting star length values (pixels)
export const SHOOTING_STAR_LENGTHS: Record<ShootingStarLength, number> = {
  short: 40,
  medium: 80,
  long: 120
};

// Shooting star configurations
export const SHOOTING_STAR_CONFIGS = [
  { speed: 'slow' as ShootingStarSpeed, length: 'short' as ShootingStarLength, spawnWeight: 5 },
  { speed: 'medium' as ShootingStarSpeed, length: 'medium' as ShootingStarLength, spawnWeight: 3 },
  { speed: 'fast' as ShootingStarSpeed, length: 'long' as ShootingStarLength, spawnWeight: 2 }
];

// Saturn's Asteroid Belt constants (Level 3)
export const SATURN_BELT_DEBRIS_MAX = 25; // Much more debris for dense asteroid field
export const SATURN_BELT_SPAWN_INTERVAL_MIN = 200; // Faster spawning (0.2 seconds)
export const SATURN_BELT_SPAWN_INTERVAL_MAX = 600; // Faster spawning (0.6 seconds)
export const SATURN_BELT_DEBRIS_SPEED_MULTIPLIER = 1.5; // Debris moves faster
export const SATURN_BELT_ROTATION_MULTIPLIER = 1.8; // Debris rotates faster

// Saturn's Ring particles (Level 3 background effect)
export const SATURN_RING_PARTICLES_MAX = 50;
export const SATURN_RING_SPAWN_INTERVAL = 100; // Spawn every 100ms
export const SATURN_RING_PARTICLE_LIFE = 3000; // 3 seconds
export const SATURN_RING_PARTICLE_SPEED = 0.8; // Pixels per frame 