export interface FlutterFocusGameProps {
  userId?: string;
  onGameComplete?: (gameData: FlutterFocusGameData) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
  width?: string;
  height?: string;
}

export interface FlutterFocusGameData {
  // Basic game info - following BounceBack pattern
  startTime: number;
  endTime?: number;
  totalPlayTime: number;
  gameCompleted: boolean;
  finalScore: number;
  
  // Overall metrics - following BounceBack pattern
  livesLost: number;
  totalCrashes: number;
  totalObstaclesAvoided: number;
  totalObstaclesHit: number;
  
  // Level progression - following BounceBack pattern
  currentLevel: number;
  levelsCompleted: number;
  levelScores: number[];
  levelCompletionTimes: number[];
  
  // ADHD assessment data - following PatternMatch pattern
  adhdScores: {
    inattention: number;
    hyperactivity: number;
    impulsivity: number;
    executiveFunction: number;
  };
  
  // Self-report responses - following BounceBack pattern
  selfReportResponses: { [key: string]: number };
  
  // Timestamps - following BounceBack pattern
  createdAt?: any;
  updatedAt?: any;
}

export interface FlutterFocusLevel {
  levelNumber: number;
  levelName: string;
  startTime: number;
  endTime?: number;
  duration: number;
  
  // Performance metrics - following BounceBack pattern
  livesLost: number;
  crashes: number;
  score: number;
  obstaclesAvoided: number;
  obstaclesHit: number;
  
  // Level-specific metrics
  decoyCollisions?: number;        // Level 2
  wrongPathChoices?: number;       // Level 3
  memoryCueFailures?: number;      // Level 3
  
  // Input analysis - following PatternMatch pattern
  reactionTimes: number[];
  inputCount: number;
  excessInputs: number;
  idleTime: number;
  
  // ADHD scoring - following PatternMatch pattern
  levelMetrics: {
    inattentionScore: number;
    hyperactivityScore: number;
    impulsivityScore: number;
    executiveFunctionScore: number;
  };
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'debris' | 'planet' | 'asteroid' | 'blackhole' | 'decoy' | 'portal';
  speed: number;
  direction: 'left' | 'right' | 'up' | 'down';
  isActive: boolean;
  isDecoy: boolean;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export interface Alien {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isAlive: boolean;
  lives: number;
  invulnerable: boolean;
  invulnerabilityTimer: number;
}

export interface GameState {
  // Following PatternMatch pattern
  currentLevel: number;
  isPlaying: boolean;
  showInstructions: boolean;
  showCountdown: boolean;
  countdownValue: number;
  gameComplete: boolean;
  showScores: boolean;
  showQuestions: boolean;
  currentQuestionIndex: number;
  questionAnswers: number[];
  showThankYou: boolean;
  
  // Game-specific states
  alien: Alien;
  obstacles: Obstacle[];
  score: number;
  levelStartTime: number;
  gameStartTime: number;
  lastInputTime: number;
  inputCount: number;
  excessInputs: number;
  idleTime: number;
  reactionTimes: number[];
}

export interface Question {
  id: string;
  text: string;
  category: 'attention' | 'impulsivity' | 'frustration' | 'focus' | 'persistence';
}

export interface QuestionAnswer {
  questionId: string;
  answer: number;
  timestamp: number;
}

// Following PatternMatch pattern for round metrics
export interface RoundMetrics {
  round: number;
  levelNumber: number;
  levelName: string;
  score: number;
  livesLost: number;
  crashes: number;
  obstaclesAvoided: number;
  obstaclesHit: number;
  decoyCollisions?: number;
  wrongPathChoices?: number;
  memoryCueFailures?: number;
  reactionTimes: number[];
  inputCount: number;
  excessInputs: number;
  idleTime: number;
  levelMetrics: {
    inattentionScore: number;
    hyperactivityScore: number;
    impulsivityScore: number;
    executiveFunctionScore: number;
  };
  totalTrials?: number;
  roundDurationMs?: number;
} 

export interface Debris {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: DebrisType;
  speed: DebrisSpeed;
  rotationSpeed: DebrisRotationSpeed;
  rotation: number;
  zIndex: number;
  isActive: boolean;
  hasCollision: boolean;
  collisionDamage: number;
  // Collision animation properties
  collisionState?: 'normal' | 'exploding' | 'removing';
  collisionTimer?: number;
  explosionFrame?: number;
  explosionX?: number;
  explosionY?: number;
}

export type DebrisType = 
  | 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6' | 'b7' | 'b8' // Background debris (no collision)
  | 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6' | 'd7' | 'd8' | 'd9' | 'd10' | 'd11' | 'd12' | 'd13' | 'd14' | 'd15' | 'd16' | 'd17' | 'd18' | 'd19' | 'd20' | 'd21' | 'd22' | 'd23' | 'd24'; // Collision debris

export type DebrisSpeed = 'slow' | 'medium' | 'fast' | 'very_fast';

export type DebrisRotationSpeed = 'none' | 'slow' | 'medium' | 'fast';

export type DebrisSize = number; // Actual width/height in pixels

export interface DebrisConfig {
  type: DebrisType;
  size: DebrisSize;
  speed: DebrisSpeed;
  rotationSpeed: DebrisRotationSpeed;
  hasCollision: boolean;
  collisionDamage: number;
  zIndex: number;
  spawnWeight: number; // Higher weight = more likely to spawn
} 

export interface ShootingStar {
  id: string;
  x: number;
  y: number;
  length: number;
  angle: number;
  speed: number;
  life: number;
  maxLife: number;
  alpha: number;
  isActive: boolean;
}

export type ShootingStarSpeed = 'slow' | 'medium' | 'fast';
export type ShootingStarLength = 'short' | 'medium' | 'long'; 