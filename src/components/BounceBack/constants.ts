import { Level, Question } from './types';

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
    ballSpeed: 4.5,
    paddleSpeed: 6,
    brickRows: 2,
    description: "Take your time and get familiar with the controls"
  },
  {
    id: 2,
    name: "Building Skills",
    ballSpeed: 5.0,
    paddleSpeed: 6,
    brickRows: 3,
    description: "Faster ball, smaller paddle, more bricks"
  },
  {
    id: 3,
    name: "Full Challenge",
    ballSpeed: 6.0,
    paddleSpeed: 7,
    brickRows: 4,
    description: "Maximum challenge with fastest ball and smallest paddle"
  }
];

// Assessment questions
export const QUESTIONS: Question[] = [
  {
    id: 'attention_1',
    text: 'How difficult was it to maintain focus on the ball throughout the game?',
    category: 'attention'
  },
  {
    id: 'impulsivity_1',
    text: 'How often did you find yourself moving the paddle without thinking?',
    category: 'impulsivity'
  },
  {
    id: 'frustration_1',
    text: 'How frustrated did you feel when you lost a life?',
    category: 'frustration'
  },
  {
    id: 'focus_1',
    text: 'How well were you able to plan your paddle movements in advance?',
    category: 'focus'
  },
  {
    id: 'persistence_1',
    text: 'How motivated were you to continue playing after losing a life?',
    category: 'persistence'
  }
]; 