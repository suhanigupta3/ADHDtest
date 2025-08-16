import { Question } from '../components/shared';

// Import JSON files - these will be processed by webpack
import flutterFocusQuestions from '../components/FlutterFocus/questions.json';
import patternMatchQuestions from '../components/PatternMatch/questions.json';
import bounceBackQuestions from '../components/BounceBack/questions.json';

// Debug imports
console.log('[questionLoader] patternMatchQuestions import check:', patternMatchQuestions);
console.log('[questionLoader] patternMatchQuestions.questions check:', patternMatchQuestions?.questions);

export interface GameQuestions {
  [gameId: string]: Question[];
}

// Load questions for a specific game
export const loadGameQuestions = (gameId: string): Question[] => {
  console.log('[questionLoader] Loading questions for game:', gameId);
  console.log('[questionLoader] Available games:', Object.keys({
    'flutterFocus': flutterFocusQuestions.questions,
    'patternMatch': patternMatchQuestions.questions,
    'bounceBack': bounceBackQuestions.questions
  }));
  console.log('[questionLoader] patternMatchQuestions import:', patternMatchQuestions);
  console.log('[questionLoader] patternMatchQuestions.questions:', patternMatchQuestions?.questions);
  
  // Handle different game ID formats
  const gameIdMap: { [key: string]: string } = {
    'pattern-match': 'patternMatch',
    'patternMatch': 'patternMatch',
    'flutter-focus': 'flutterFocus',
    'flutterFocus': 'flutterFocus',
    'bounce-back': 'bounceBack',
    'bounceBack': 'bounceBack'
  };
  
  const normalizedGameId = gameIdMap[gameId] || gameId;
  console.log('[questionLoader] Normalized game ID from', gameId, 'to', normalizedGameId);
  
  const questionsMap: GameQuestions = {
    'flutterFocus': flutterFocusQuestions.questions,
    'patternMatch': patternMatchQuestions.questions,
    'bounceBack': bounceBackQuestions.questions
  };

  const questions = questionsMap[normalizedGameId];
  console.log('[questionLoader] Retrieved questions for', normalizedGameId, ':', questions);
  console.log('[questionLoader] Questions length:', questions?.length);
  
  if (!questions) {
    console.warn(`No questions found for game: ${gameId} (normalized: ${normalizedGameId})`);
    return [];
  }

  return questions;
};

// Get all questions for all games
export const getAllGameQuestions = (): GameQuestions => {
  return {
    'flutterFocus': flutterFocusQuestions.questions,
    'patternMatch': patternMatchQuestions.questions,
    'bounceBack': bounceBackQuestions.questions
  };
};

// Validate question structure
export const validateQuestions = (questions: Question[]): boolean => {
  if (!Array.isArray(questions) || questions.length === 0) {
    console.error('Questions must be a non-empty array');
    return false;
  }

  for (const question of questions) {
    if (!question.id || !question.text) {
      console.error('Question missing required fields:', question);
      return false;
    }
  }

  return true;
}; 
