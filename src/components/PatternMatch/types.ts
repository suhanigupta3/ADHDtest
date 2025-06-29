export type Shape = 'circle' | 'square' | 'triangle' | 'star' | 'hexagon';
export type Pattern = 'dots' | 'stripes' | 'checkered' | 'solid' | 'zigzag';

export interface Target {
  shape: Shape;
  pattern: Pattern;
}

export interface Trial {
  round: number;
  trialNumber: number;
  stimulusShape: Shape;
  stimulusPattern: Pattern;
  targetShape: Shape;
  targetPattern: Pattern;
  isTarget: boolean;
  userClicked: boolean;
  reactionTimeMs: number;
  targetChanged: boolean;
  distractionActive: boolean;
}

export interface RoundMetrics {
  round: number;
  falsePositives: number;
  missedTargets: number;
  reactionTimeValid: number;
  reactionTimeVariance: number;
  switchErrorCount: number;
  distractorErrorRate: number;
  totalTrials: number;
  correctTrials: number;
}

export interface GameState {
  currentRound: number;
  currentTrial: number;
  isPlaying: boolean;
  showInstructions: boolean;
  showRoundStart: boolean;
  currentTarget: Target;
  currentStimulus: Target | null;
  trialStartTime: number | null;
  trials: Trial[];
  roundStartTime: number | null;
  distractionActive: boolean;
  isFlickering: boolean;
  showStimulus: boolean;
  gameComplete: boolean;
}

export interface PatternMatchGameProps {
  onGameComplete?: (roundMetrics: RoundMetrics[]) => void;
  onError?: (error: string) => void;
  width?: string;
  height?: string;
  isStandalone?: boolean;
  userId?: string;
}

export interface RoundInstructions {
  title: string;
  text: string;
  example: string;
} 