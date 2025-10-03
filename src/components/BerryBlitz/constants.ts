import { loadGameQuestions } from '../../utils/questionLoader';

// Game constants
export const GRID_SIZE = 5;
export const CELL_SIZE = 80;
export const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE;
export const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE;

// Player constants
export const PLAYER_SIZE = 60;
export const PLAYER_SPEED = 1; // cells per move

// Fruit constants
export const FRUIT_SIZE = 50;
export const FRUIT_SPAWN_RATE = 0.02; // probability per frame (much lower for gradual spawning)
export const FRUIT_LIFETIME = 5000; // 5 seconds (longer lifetime)
export const MAX_FRUITS_ON_SCREEN = 8; // Maximum fruits allowed at once

// Obstacle constants
export const OBSTACLE_SIZE = 40;
export const OBSTACLE_SPAWN_RATE = 0.15; // probability per frame (reasonable rate)
export const OBSTACLE_SPEED = 0.1; // cells per frame (slower movement)
export const OBSTACLE_LIFETIME = 5000; // 5 seconds
export const OBSTACLE_SPAWN_DELAY = 5000; // 5 seconds delay before shurikens start spawning

// Game timing
export const ROUND_DURATION = 30000; // 30 seconds per round
export const TOTAL_ROUNDS = 3;

// Scoring
export const TARGET_FRUIT_SCORE = 10;
export const NON_TARGET_FRUIT_PENALTY = -2;
export const OBSTACLE_HIT_PENALTY = -5;
export const MISTAKE_PENALTY = -3;

// Game levels
export const ROUNDS = [
  {
    id: 1,
    name: "Lemon Round",
    targetFruit: 'lemon' as const,
    description: "Collect lemons while avoiding shurikens",
    fruitSpawnRate: 0.3,
    obstacleSpawnRate: 0.1,
    duration: 30000
  },
  {
    id: 2,
    name: "Strawberry Round", 
    targetFruit: 'strawberry' as const,
    description: "Collect strawberries while avoiding shurikens",
    fruitSpawnRate: 0.35,
    obstacleSpawnRate: 0.15,
    duration: 30000
  },
  {
    id: 3,
    name: "Orange Round",
    targetFruit: 'orange' as const,
    description: "Collect oranges while avoiding shurikens",
    fruitSpawnRate: 0.4,
    obstacleSpawnRate: 0.2,
    duration: 30000
  }
];

// Fruit types and colors
export const FRUIT_TYPES = {
  lemon: { color: '#FFD700', emoji: '🍋' },
  strawberry: { color: '#FF6B6B', emoji: '🍓' },
  orange: { color: '#FF8C00', emoji: '🍊' },
  apple: { color: '#FF4444', emoji: '🍎' },
  grape: { color: '#8B5CF6', emoji: '🍇' }
};

// Assessment questions - loaded from JSON configuration
export const QUESTIONS = loadGameQuestions('berryBlitz');
