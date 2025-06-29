import { Shape, Pattern } from './types';

export const SHAPES: Shape[] = ['circle', 'square', 'triangle', 'star', 'hexagon'];
export const PATTERNS: Pattern[] = ['dots', 'stripes', 'checkered', 'solid', 'zigzag'];

export const TRIALS_PER_ROUND = 30;
export const TOTAL_ROUNDS = 3;
export const TRIAL_DURATION_MS = 1300;
export const ROUND_START_DELAY_MS = 3000;
export const DISTRACTION_PROBABILITY = 0.2;
export const ROTATIONS = [0, 90, 180, 270]; 