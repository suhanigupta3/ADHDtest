import { Level } from './types';
import { loadGameQuestions } from '../../utils/questionLoader';

// Canvas and game dimensions
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const PADDLE_WIDTH = 160;
export const PADDLE_HEIGHT = 20;
export const PADDLE_Y_OFFSET = 20;
export const BALL_RADIUS = 10;
export const BRICK_ROWS = 4;
export const BRICK_COLS = 8;
export const BRICK_WIDTH = 80;
export const BRICK_HEIGHT = 25;
export const BRICK_PADDING = 8;
export const BRICK_OFFSET_TOP = 80;
export const BRICK_OFFSET_LEFT = 60;

// Colors
export const PADDLE_COLOR = '#34d399'; // emerald-400
export const BG_COLOR = '#e0e9e0'; // forest-100
export const BALL_COLOR = '#059669'; // emerald-600
export const BRICK_COLORS = [
  '#10b981', // emerald-500
  '#059669', // emerald-600
  '#047857', // emerald-700
  '#065f46', // emerald-800
];

// Game levels
export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Getting Started",
    ballSpeed: 3.5,
    paddleSpeed: 5,
    brickRows: 2,
    description: "",
    toughBrickChance: 0.1, // 10% chance of tough bricks
    powerUpChance: 0.05, // 5% chance of power-up bricks
    multiHitBricks: false // No multi-hit bricks in level 1
  },
  {
    id: 2,
    name: "Building Skills",
    ballSpeed: 4,
    paddleSpeed: 5.5,
    brickRows: 3,
    description: "",
    toughBrickChance: 0.3, // 30% chance of tough bricks
    powerUpChance: 0.1, // 10% chance of power-up bricks
    multiHitBricks: true // Multi-hit bricks introduced
  },
  {
    id: 3,
    name: "Full Challenge",
    ballSpeed: 4.5,
    paddleSpeed: 6.5,
    brickRows: 4,
    description: "",
    toughBrickChance: 0.5, // 50% chance of tough bricks
    powerUpChance: 0.15, // 15% chance of power-up bricks
    multiHitBricks: true // Multi-hit bricks throughout
  }
];

// Assessment questions - loaded from JSON configuration
export const QUESTIONS = loadGameQuestions('bounceBack'); 