import { RhythmPattern, Question } from './types';

// Game constants
export const GAME_DURATION = 60000; // 60 seconds
export const CLICK_TOLERANCE = 200; // milliseconds
export const PERFECT_CLICK_BONUS = 50;
export const GOOD_CLICK_BONUS = 25;
export const MISSED_CLICK_PENALTY = -10;
export const LIFE_LOSS_THRESHOLD = 3; // consecutive misses

// Visual constants
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 320;
export const BEAT_CIRCLE_RADIUS = 40;
export const BEAT_CIRCLE_SPACING = 80;

// Colors
export const PRIMARY_COLOR = '#3B82F6'; // blue-500
export const SECONDARY_COLOR = '#10B981'; // emerald-500
export const ACCENT_COLOR = '#F59E0B'; // amber-500
export const SUCCESS_COLOR = '#10B981'; // emerald-500
export const ERROR_COLOR = '#EF4444'; // red-500
export const BG_COLOR = '#F8FAFC'; // slate-50

// Rhythm patterns
export const RHYTHM_PATTERNS: RhythmPattern[] = [
  {
    id: 'basic-4-4',
    name: 'Basic 4/4 Rhythm',
    tempo: 120,
    difficulty: 1,
    description: 'Simple quarter note pattern',
    pattern: [500, 500, 500, 500] // 4 beats at 120 BPM
  },
  {
    id: 'syncopated',
    name: 'Syncopated Rhythm',
    tempo: 100,
    difficulty: 2,
    description: 'Off-beat emphasis pattern',
    pattern: [400, 600, 400, 600] // Syncopated pattern
  },
  {
    id: 'complex-8-8',
    name: 'Complex 8/8 Rhythm',
    tempo: 140,
    difficulty: 3,
    description: 'Fast eighth note pattern',
    pattern: [250, 250, 250, 250, 250, 250, 250, 250] // 8 beats at 140 BPM
  }
];

// Assessment questions
export const QUESTIONS: Question[] = [
  {
    id: 'attention_1',
    text: 'How difficult was it to maintain focus on the rhythm throughout the game?',
    category: 'attention'
  },
  {
    id: 'rhythm_1',
    text: 'How well were you able to maintain consistent timing with the beat?',
    category: 'rhythm'
  },
  {
    id: 'focus_1',
    text: 'How easily did you get distracted from the rhythm pattern?',
    category: 'focus'
  },
  {
    id: 'coordination_1',
    text: 'How well did your hand-eye coordination perform during the game?',
    category: 'coordination'
  },
  {
    id: 'persistence_1',
    text: 'How motivated were you to continue when you missed a beat?',
    category: 'persistence'
  }
];

// Sound effects (placeholder URLs)
export const SOUND_EFFECTS = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  beat: '/sounds/beat.mp3'
}; 