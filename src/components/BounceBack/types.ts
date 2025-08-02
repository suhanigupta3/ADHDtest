export interface Brick {
  x: number;
  y: number;
  status: number;
  color: string;
  width: number;
  height: number;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface Level {
  id: number;
  name: string;
  ballSpeed: number;
  paddleSpeed: number;
  brickRows: number;
  description: string;
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
  selfReportResponses: { [key: string]: number };
}

export interface BounceBackGameProps {
  userId?: string;
  onGameComplete?: (gameData: GameData) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
  width?: string;
  height?: string;
} 