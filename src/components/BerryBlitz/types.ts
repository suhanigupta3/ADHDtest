export interface BerryBlitzGameProps {
  userId?: string;
  onGameComplete: (data: BerryBlitzGameData) => void;
  onCancel: () => void;
  onError: (error: string) => void;
  width?: string;
  height?: string;
}

export interface BerryBlitzGameData {
  // Basic game info - following BounceBack pattern
  startTime: number;
  endTime?: number;
  totalPlayTime: number;
  gameCompleted: boolean;
  finalScore: number;
  
  // Overall metrics - following BounceBack pattern
  livesLost: number;
  totalFruitsCollected: number;
  totalObstaclesHit: number;
  totalMistakes: number;
  
  // Round progression - following BounceBack pattern
  currentRound: number;
  roundsCompleted: number;
  roundScores: number[];
  roundCompletionTimes: number[];
  
  // ADHD assessment data - following PatternMatch pattern
  adhdScores: {
    inattention: number;
    hyperactivity: number;
    impulsivity: number;
    executiveFunction: number;
  };
  
  // Self-report responses
  selfReport: { [key: string]: number };
  
  // Timestamps - following BounceBack pattern
  createdAt?: any;
  updatedAt?: any;
}

export interface BerryBlitzRound {
  roundNumber: number;
  targetFruit: 'lemon' | 'strawberry' | 'orange';
  startTime: number;
  endTime?: number;
  duration: number;
  score: number;
  fruitsCollected: number;
  obstaclesHit: number;
  mistakes: number;
  accuracy: number;
  reactionTimes: number[];
  movementPatterns: number[];
}

export interface GameState {
  currentRound: number;
  score: number;
  lives: number;
  gameStarted: boolean;
  gameOver: boolean;
  gameWon: boolean;
  showQuestions: boolean;
  currentQuestionIndex: number;
  questionResponses: { [key: string]: number };
  rounds: BerryBlitzRound[];
}

export interface Player {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
}

export interface Fruit {
  id: string;
  x: number;
  y: number;
  type: 'lemon' | 'strawberry' | 'orange' | 'apple' | 'grape';
  isTarget: boolean;
  collected: boolean;
  spawnTime: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  type: 'shuriken';
  direction: 'up' | 'down' | 'left' | 'right';
  speed: number;
  spawnTime: number;
}

export interface Question {
  id: string;
  text: string;
  category: 'attention' | 'impulsivity' | 'frustration' | 'focus' | 'persistence';
}





