import { useState, useCallback, useRef, useEffect } from 'react';
import { FlutterFocusGameData, ClickPattern, RhythmPattern, GameState, Question } from '../types';
import { RHYTHM_PATTERNS, QUESTIONS, GAME_DURATION, CLICK_TOLERANCE } from '../constants';
import { 
  calculateClickAccuracy, 
  calculateClickScore, 
  calculateRhythmConsistency, 
  calculateAverageReactionTime,
  calculateFocusScore,
  generateBeatTiming,
  isClickOnTime,
  calculateOverallAccuracy
} from '../utils';

export const useGameLogic = () => {
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const beatTimerRef = useRef<NodeJS.Timeout>();
  const audioContextRef = useRef<AudioContext>();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    currentPattern: RHYTHM_PATTERNS[0],
    currentBeat: 0,
    lastClickTime: 0,
    score: 0,
    lives: 3,
    gameOver: false,
    gameWon: false
  });

  // Question modal states
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionResponses, setQuestionResponses] = useState<{ [key: string]: number }>({});
  const [questionsCompleted, setQuestionsCompleted] = useState(false);

  // Game data collection
  const [gameData, setGameData] = useState<FlutterFocusGameData>(() => ({
    startTime: Date.now(),
    totalPlayTime: 0,
    accuracy: 0,
    averageReactionTime: 0,
    successfulClicks: 0,
    missedClicks: 0,
    totalClicks: 0,
    rhythmConsistency: 0,
    focusScore: 0,
    finalScore: 0,
    gameCompleted: false,
    reactionTimes: [],
    clickPatterns: [],
    selfReportResponses: {},
  }));

  // Beat timing
  const [beatTiming, setBeatTiming] = useState<number[]>([]);
  const [gameStartTime, setGameStartTime] = useState(0);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Start game
  const startGame = useCallback(() => {
    const startTime = Date.now();
    setGameStartTime(startTime);
    setGameData(prev => ({ ...prev, startTime }));
    
    const timing = generateBeatTiming(gameState.currentPattern, startTime);
    setBeatTiming(timing);
    
    setGameState(prev => ({ ...prev, isPlaying: true, currentBeat: 0, score: 0, lives: 3 }));
    
    // Set game timer
    gameTimerRef.current = setTimeout(() => {
      endGame();
    }, GAME_DURATION);
  }, [gameState.currentPattern]);

  // End game
  const endGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
    
    if (gameTimerRef.current) {
      clearTimeout(gameTimerRef.current);
    }
    if (beatTimerRef.current) {
      clearTimeout(beatTimerRef.current);
    }
    
    // Calculate final metrics
    const finalData = {
      ...gameData,
      endTime: Date.now(),
      totalPlayTime: Date.now() - gameData.startTime,
      accuracy: calculateOverallAccuracy(gameData.clickPatterns),
      rhythmConsistency: calculateRhythmConsistency(gameData.clickPatterns),
      averageReactionTime: calculateAverageReactionTime(gameData.reactionTimes),
      focusScore: calculateFocusScore(
        calculateOverallAccuracy(gameData.clickPatterns) / 100,
        calculateRhythmConsistency(gameData.clickPatterns)
      ),
      finalScore: gameState.score,
      gameCompleted: true
    };
    
    setGameData(finalData);
    setShowQuestions(true);
  }, [gameData, gameState.score]);

  // Handle click
  const handleClick = useCallback(() => {
    if (!gameState.isPlaying) return;
    
    const currentTime = Date.now();
    const expectedTime = beatTiming[gameState.currentBeat];
    
    if (expectedTime !== undefined) {
      const accuracy = calculateClickAccuracy(expectedTime, currentTime);
      const score = calculateClickScore(accuracy);
      const wasSuccessful = isClickOnTime(expectedTime, currentTime);
      
      const clickPattern: ClickPattern = {
        timestamp: currentTime,
        expectedTime,
        actualTime: currentTime,
        accuracy,
        wasSuccessful
      };
      
      setGameData(prev => ({
        ...prev,
        clickPatterns: [...prev.clickPatterns, clickPattern],
        successfulClicks: prev.successfulClicks + (wasSuccessful ? 1 : 0),
        missedClicks: prev.missedClicks + (wasSuccessful ? 0 : 1),
        totalClicks: prev.totalClicks + 1,
        reactionTimes: [...prev.reactionTimes, currentTime - prev.startTime]
      }));
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + score,
        currentBeat: prev.currentBeat + 1,
        lastClickTime: currentTime
      }));
      
      // Play sound effect
      if (audioContextRef.current) {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.frequency.setValueAtTime(wasSuccessful ? 800 : 400, audioContextRef.current.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);
        
        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 0.1);
      }
    }
  }, [gameState.isPlaying, gameState.currentBeat, beatTiming]);

  // Handle question responses
  const handleQuestionResponse = useCallback((response: number) => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    setQuestionResponses(prev => ({
      ...prev,
      [currentQuestion.id]: response
    }));

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuestionsCompleted(true);
      setGameData(prev => ({
        ...prev,
        selfReportResponses: { ...prev.selfReportResponses, ...questionResponses, [currentQuestion.id]: response }
      }));
    }
  }, [currentQuestionIndex, questionResponses]);

  // Handle questions completion
  const handleQuestionsComplete = useCallback(() => {
    setShowQuestions(false);
    setCurrentQuestionIndex(0);
    setQuestionResponses({});
    setQuestionsCompleted(false);
    
    const finalGameData = {
      ...gameData,
      selfReportResponses: { ...gameData.selfReportResponses, ...questionResponses },
      endTime: Date.now(),
      finalScore: gameState.score,
      gameCompleted: true
    };
    
    console.log('Flutter Focus Game Completed with Data:', finalGameData);
  }, [gameData, questionResponses, gameState.score, setShowQuestions, setCurrentQuestionIndex, setQuestionResponses, setQuestionsCompleted]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState({
      isPlaying: false,
      currentPattern: RHYTHM_PATTERNS[0],
      currentBeat: 0,
      lastClickTime: 0,
      score: 0,
      lives: 3,
      gameOver: false,
      gameWon: false
    });
    
    setGameData({
      startTime: Date.now(),
      totalPlayTime: 0,
      accuracy: 0,
      averageReactionTime: 0,
      successfulClicks: 0,
      missedClicks: 0,
      totalClicks: 0,
      rhythmConsistency: 0,
      focusScore: 0,
      finalScore: 0,
      gameCompleted: false,
      reactionTimes: [],
      clickPatterns: [],
      selfReportResponses: {},
    });
    
    setShowQuestions(false);
    setCurrentQuestionIndex(0);
    setQuestionResponses({});
    setQuestionsCompleted(false);
    setBeatTiming([]);
  }, []);

  // Change pattern
  const changePattern = useCallback((pattern: RhythmPattern) => {
    setGameState(prev => ({ ...prev, currentPattern: pattern }));
  }, []);

  return {
    // Game state
    gameState,
    gameData,
    beatTiming,
    gameStartTime,
    
    // Question modal state
    showQuestions,
    setShowQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    questionResponses,
    setQuestionResponses,
    questionsCompleted,
    setQuestionsCompleted,
    
    // Actions
    startGame,
    endGame,
    handleClick,
    handleQuestionResponse,
    handleQuestionsComplete,
    resetGame,
    changePattern,
  };
}; 