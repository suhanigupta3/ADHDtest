export interface FlutterFocusGameProps {
  onGameComplete?: (gameData: FlutterFocusGameData) => void;
}

export interface FlutterFocusGameData {
  startTime: number;
  endTime?: number;
  totalPlayTime: number;
  accuracy: number;
  averageReactionTime: number;
  successfulClicks: number;
  missedClicks: number;
  totalClicks: number;
  rhythmConsistency: number;
  focusScore: number;
  finalScore: number;
  gameCompleted: boolean;
  reactionTimes: number[];
  clickPatterns: ClickPattern[];
  selfReportResponses: { [key: string]: number };
}

export interface ClickPattern {
  timestamp: number;
  expectedTime: number;
  actualTime: number;
  accuracy: number;
  wasSuccessful: boolean;
}

export interface RhythmPattern {
  id: string;
  name: string;
  tempo: number;
  difficulty: number;
  description: string;
  pattern: number[]; // Array of milliseconds between clicks
}

export interface Question {
  id: string;
  text: string;
  category: 'attention' | 'rhythm' | 'focus' | 'coordination' | 'persistence';
}

export interface GameState {
  isPlaying: boolean;
  currentPattern: RhythmPattern;
  currentBeat: number;
  lastClickTime: number;
  score: number;
  lives: number;
  gameOver: boolean;
  gameWon: boolean;
} 