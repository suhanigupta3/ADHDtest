export interface Brick {
  x: number;
  y: number;
  status: number;
  color: string;
  width: number;
  height: number;
  health: number; // New: number of hits required to destroy
  maxHealth: number; // New: maximum health for visual scaling
  crackLevel: number; // New: 0-3 for visual crack states
  brickType: 'normal' | 'tough' | 'indestructible' | 'powerup'; // New: different brick types
  powerUpType?: 'wider_paddle' | 'slower_ball'; // New: power-up type
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  powerUpActive?: boolean; // New: if ball has power-up effect
  powerUpType?: string; // New: type of power-up
  powerUpEndTime?: number; // New: when power-up expires
}

export interface PowerUp {
  x: number;
  y: number;
  type: 'wider_paddle' | 'slower_ball';
  active: boolean;
  endTime?: number;
}

export interface Level {
  id: number;
  name: string;
  ballSpeed: number;
  paddleSpeed: number;
  brickRows: number;
  description: string;
  toughBrickChance: number; // New: probability of tough bricks
  powerUpChance: number; // New: probability of power-up bricks
  multiHitBricks: boolean; // New: whether level has multi-hit bricks
}

export interface Question {
  id: string;
  text: string;
  category: 'attention' | 'impulsivity' | 'frustration' | 'focus' | 'persistence';
}

export interface GameData {
  startTime: number;
  endTime?: number;
  totalPlayTime: number;
  bricksDestroyed: number;
  totalBricks: number;
  accuracy: number;
  averageReactionTime: number;
  paddleHits: number;
  wallHits: number;
  livesLost: number;
  finalScore: number;
  gameCompleted: boolean;
  reactionTimes: number[];
  paddleMovements: number;
  ballSpeed: number;
  currentLevel: number;
  levelScores: number[];
  levelCompletionTimes: number[];
  levelBricksDestroyed?: number[];
  levelLivesLost?: number[];
  levelTotalBricks?: number[];
  selfReportResponses: { [key: string]: number };
  // New metrics for better ADHD assessment
  consecutiveErrors: number;
  maxConsecutiveErrors: number;
  recoveryTimeAfterMistake: number;
  averageRecoveryTime: number;
  paddlePositionAccuracy: number;
  ballSpeedConsistency: number;
  movementPatterns: number[];
  errorPatterns: number[];
  timeBetweenMistakes: number[];
  lastMistakeTime: number;
  totalMistakes: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  ballSpeedHistory: number[];
}

export interface BounceBackGameProps {
  userId?: string;
  onGameComplete?: (gameData: GameData) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
  width?: string;
  height?: string;
} 