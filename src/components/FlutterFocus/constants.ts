import { FlutterFocusLevel, Question } from './types';

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
    id: 'q1_focus_difficulty',
    text: 'How difficult was it to maintain focus on avoiding obstacles throughout the game?',
    category: 'attention'
  },
  {
    id: 'q2_impulsive_movements',
    text: 'How often did you find yourself jumping or moving without thinking?',
    category: 'impulsivity'
  },
  {
    id: 'q3_frustration_level',
    text: 'How frustrated did you feel when you crashed or lost a life?',
    category: 'frustration'
  },
  {
    id: 'q4_planning_ability',
    text: 'How well were you able to plan your movements in advance?',
    category: 'focus'
  },
  {
    id: 'q5_persistence_motivation',
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