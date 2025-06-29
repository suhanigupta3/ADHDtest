import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Target, Trial } from '../types';
import { 
  generateRoundTargets, 
  generateStimulus, 
  isStimulusMatch, 
  generateStimulusBlock,
  calculateRoundMetrics 
} from '../utils';
import { SHAPES, PATTERNS, TRIALS_PER_ROUND, TOTAL_ROUNDS, TRIAL_DURATION_MS, ROUND_START_DELAY_MS, DISTRACTION_PROBABILITY, ROTATIONS } from '../constants';
import { db } from '../../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

interface UseGameLogicProps {
  userId?: string;
  onGameComplete?: (roundMetrics: any[]) => void;
  onError?: (error: string) => void;
}

export const useGameLogic = ({ userId, onGameComplete, onError }: UseGameLogicProps) => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    currentRound: 1,
    currentTrial: 1,
    showInstructions: true,
    showRoundStart: false,
    currentTarget: { shape: 'circle', pattern: 'dots' },
    currentStimulus: null,
    trialStartTime: null,
    trials: [],
    roundStartTime: null,
    distractionActive: false,
    isFlickering: false,
    showStimulus: false,
    gameComplete: false
  });

  const targetDisplayTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const roundStartTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const userRespondedRef = useRef<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Add state to track precomputed stimuli for the current block
  const [blockStimuli, setBlockStimuli] = useState<Target[]>([]);
  const [blockIndex, setBlockIndex] = useState(0);

  // Add state for round instructions and rotation
  const [showRoundInstructions, setShowRoundInstructions] = useState(true);
  const [stimulusRotation, setStimulusRotation] = useState(0);

  // Handle user response
  const handleUserResponse = useCallback((clicked: boolean, distractionActive?: boolean) => {
    if (!gameState.isPlaying || !gameState.currentStimulus || !gameState.trialStartTime || userRespondedRef.current) return;

    userRespondedRef.current = true;

    const reactionTime = Date.now() - gameState.trialStartTime;
    const isTarget = isStimulusMatch(gameState.currentStimulus, gameState.currentTarget, gameState.currentRound);

    // If user clicked, pick a new random target (different from current)
    let newTarget = gameState.currentTarget;
    if (clicked) {
      do {
        newTarget = {
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          pattern: PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
        };
      } while (newTarget.shape === gameState.currentTarget.shape && newTarget.pattern === gameState.currentTarget.pattern);
    }

    // For round 3, set a random rotation for the next stimulus
    if (gameState.currentRound === 3) {
      setStimulusRotation(ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)]);
    } else {
      setStimulusRotation(0);
    }

    const trial: Trial = {
      round: gameState.currentRound,
      trialNumber: gameState.currentTrial,
      stimulusShape: gameState.currentStimulus.shape,
      stimulusPattern: gameState.currentStimulus.pattern,
      targetShape: gameState.currentTarget.shape,
      targetPattern: gameState.currentTarget.pattern,
      isTarget,
      userClicked: clicked,
      reactionTimeMs: reactionTime,
      targetChanged: clicked && isTarget, // Only true if user correctly clicked
      distractionActive: distractionActive || false
    };

    setGameState(prev => ({
      ...prev,
      trials: [...prev.trials, trial],
      trialStartTime: null,
      currentStimulus: null,
      showStimulus: false,
      currentTarget: newTarget,
    }));

    // Clear trial timeout
    if (targetDisplayTimeoutRef.current) {
      clearTimeout(targetDisplayTimeoutRef.current);
    }

    // Advance to next trial after a short delay
    setTimeout(() => {
      setGameState(prev => {
        const nextTrial = prev.currentTrial + 1;
        const nextRound = prev.currentRound + (nextTrial > TRIALS_PER_ROUND ? 1 : 0);

        if (nextRound > TOTAL_ROUNDS) {
          return {
            ...prev,
            gameComplete: true,
            isPlaying: false,
            currentStimulus: null,
            showStimulus: false,
            trialStartTime: null,
          };
        }

        if (nextTrial > TRIALS_PER_ROUND) {
          setElapsedTime(0);
          setGameState(prev2 => {
            // Pick a new random target for the new round
            let newTarget = prev2.currentTarget;
            do {
              newTarget = {
                shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
                pattern: PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
              };
            } while (
              newTarget.shape === prev2.currentTarget.shape &&
              newTarget.pattern === prev2.currentTarget.pattern
            );
            return {
              ...prev2,
              isPlaying: false,
              showRoundStart: true,
              currentTrial: 1,
              currentRound: nextRound,
              currentTarget: newTarget,
              roundStartTime: null
            };
          });
          
          // Show round start screen for 3 seconds, then start the new round
          roundStartTimeoutRef.current = setTimeout(() => {
            setGameState(prev3 => ({
              ...prev3,
              showRoundStart: false,
              isPlaying: true,
              roundStartTime: Date.now()
            }));
          }, ROUND_START_DELAY_MS);
          
          return prev;
        }

        return {
          ...prev,
          currentTrial: nextTrial > TRIALS_PER_ROUND ? 1 : nextTrial,
          currentRound: nextRound,
        };
      });
    }, 300);
  }, [gameState, isStimulusMatch]);

  // Handle click anywhere on screen
  const handleScreenClick = useCallback((e: React.MouseEvent) => {
    if (!gameState.showStimulus) return;
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.game-area')) {
      if (gameState.isPlaying && gameState.currentStimulus) {
        handleUserResponse(true);
      }
    }
  }, [gameState.isPlaying, gameState.currentStimulus, gameState.showStimulus, handleUserResponse]);

  // Handle mouse click on stimulus (alternative method)
  const handleStimulusClick = useCallback(() => {
    if (gameState.isPlaying && gameState.currentStimulus && gameState.showStimulus) {
      handleUserResponse(true);
    }
  }, [gameState.isPlaying, gameState.currentStimulus, gameState.showStimulus, handleUserResponse]);

  // When the target changes (on round start or user click), reset the block
  useEffect(() => {
    setBlockStimuli(generateStimulusBlock(gameState.currentTarget));
    setBlockIndex(0);
  }, [gameState.currentTarget]);

  // In startTrial, use the precomputed block
  const startTrial = useCallback(() => {
    if (!gameState.isPlaying) return;
    userRespondedRef.current = false;
    // Use precomputed stimulus from block
    let stimulus = blockStimuli[blockIndex];
    // Fallback to random if block is empty
    if (!stimulus) {
      stimulus = generateStimulus();
    }
    const distractionActive = Math.random() < DISTRACTION_PROBABILITY;
    console.log('[startTrial] New trial:', {
      round: gameState.currentRound,
      trial: gameState.currentTrial,
      stimulus,
      distractionActive
    });
    setGameState(prev => ({
      ...prev,
      currentStimulus: stimulus,
      trialStartTime: Date.now(),
      distractionActive,
      isFlickering: false,
      showStimulus: true
    }));
    setBlockIndex(idx => idx + 1);
    if (distractionActive) {
      const distractionDelay = 200 + Math.random() * 600;
      setTimeout(() => {
        setGameState(prev => ({ ...prev, isFlickering: true }));
        setTimeout(() => {
          setGameState(prev => ({ ...prev, isFlickering: false }));
        }, 200);
      }, distractionDelay);
    }
  }, [gameState.isPlaying, gameState.currentRound, gameState.currentTrial, blockStimuli, blockIndex]);

  // Effect to start the next trial when ready
  useEffect(() => {
    if (
      gameState.isPlaying &&
      !gameState.gameComplete &&
      !gameState.showRoundStart &&
      gameState.currentStimulus === null
    ) {
      console.log('[effect:startTrial] Starting next trial', {
        round: gameState.currentRound,
        trial: gameState.currentTrial
      });
      startTrial();
    }
  }, [
    gameState.isPlaying,
    gameState.showRoundStart,
    gameState.currentStimulus,
    gameState.currentRound,
    gameState.currentTrial,
    startTrial,
    gameState.gameComplete
  ]);

  // Effect to advance the trial every 1.3s
  useEffect(() => {
    if (
      gameState.isPlaying &&
      !gameState.gameComplete &&
      !gameState.showRoundStart &&
      gameState.currentStimulus !== null
    ) {
      const timer = setTimeout(() => {
        console.log('[effect:timer] 1.3s timer fired', {
          round: gameState.currentRound,
          trial: gameState.currentTrial,
          userResponded: userRespondedRef.current
        });
        if (!userRespondedRef.current) {
          handleUserResponse(false, gameState.distractionActive);
        }
      }, TRIAL_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [
    gameState.isPlaying,
    gameState.showRoundStart,
    gameState.currentStimulus,
    gameState.distractionActive,
    gameState.currentRound,
    gameState.currentTrial,
    gameState.gameComplete,
    handleUserResponse
  ]);

  // Start game
  const startGame = useCallback(() => {
    const targets = generateRoundTargets();
    
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      showInstructions: false,
      showRoundStart: true,
      currentRound: 1,
      currentTrial: 1,
      currentTarget: targets[0][0],
      trials: [],
      roundStartTime: null
    }));

    // Show round start screen for 3 seconds, then start the game
    roundStartTimeoutRef.current = setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        showRoundStart: false,
        isPlaying: true,
        roundStartTime: Date.now()
      }));
    }, ROUND_START_DELAY_MS);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.isPlaying || !gameState.currentStimulus) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        handleUserResponse(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.isPlaying, gameState.currentStimulus, handleUserResponse]);

  // Cleanup timeouts
  useEffect(() => {
    const targetTimeout = targetDisplayTimeoutRef.current;
    const roundTimeout = roundStartTimeoutRef.current;
    
    return () => {
      if (targetTimeout) {
        clearTimeout(targetTimeout);
      }
      if (roundTimeout) {
        clearTimeout(roundTimeout);
      }
    };
  }, []);

  // Timer effect: runs when game is playing and not complete
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameComplete) {
      if (gameState.currentTrial === 1) setElapsedTime(0);
      const start = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const base = gameState.roundStartTime || start;
          return ((Date.now() - base) / 1000);
        });
      }, 100);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      setElapsedTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [gameState.isPlaying, gameState.roundStartTime, gameState.gameComplete, gameState.currentTrial]);

  // Add a useEffect to watch for gameState.gameComplete
  useEffect(() => {
    if (gameState.gameComplete) {
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        currentStimulus: null,
        showStimulus: false,
        trialStartTime: null,
      }));
      if (onGameComplete) {
        const roundMetrics = [1, 2, 3].map(round => {
          const roundTrials = gameState.trials.filter((t: any) => t.round === round);
          return calculateRoundMetrics(roundTrials);
        });
        onGameComplete(roundMetrics);
      }
    }
  }, [gameState.gameComplete, onGameComplete, gameState.trials]);

  // When starting a new round, show instructions and wait for user to click Start
  const startRound = () => {
    setShowRoundInstructions(false);
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      showRoundStart: false,
      roundStartTime: Date.now(),
      currentTrial: 1,
      // Optionally reset other state as needed
    }));
    // For round 3, set a random rotation for the first stimulus
    if (gameState.currentRound === 3) {
      setStimulusRotation(ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)]);
    } else {
      setStimulusRotation(0);
    }
  };

  // When a round ends, show instructions for the next round
  useEffect(() => {
    if (!gameState.isPlaying && !gameState.gameComplete && showRoundInstructions) {
      setShowRoundInstructions(true);
    }
  }, [gameState.isPlaying, gameState.gameComplete, showRoundInstructions]);

  // At the end of each round, upload round data to Firestore
  useEffect(() => {
    // Only run after a round completes (not at game end)
    if (!gameState.isPlaying && !gameState.gameComplete && gameState.currentTrial === 1 && gameState.trials.length > 0) {
      const roundNum = gameState.currentRound - 1; // just finished round
      if (roundNum < 1 || roundNum > 3) return;
      const roundTrials = gameState.trials.filter((t: any) => t.round === roundNum);
      if (roundTrials.length === 0) return;
      const roundMetrics = calculateRoundMetrics(roundTrials);
      const rule = roundNum === 1 ? 'shape OR pattern' : (roundNum === 2 ? 'shape AND pattern' : 'shape AND pattern + rotation');
      const rotation = roundNum === 3 ? 'random (0,90,180,270)' : 'none';
      const roundStart = null; // trialStartTime not available on Trial
      const roundEnd = null; // trialStartTime not available on Trial
      const roundStartTime = gameState.roundStartTime; // timestamp when this round started
      const roundData = {
        round: roundNum,
        rule,
        rotation,
        metrics: roundMetrics,
        trials: roundTrials,
        roundStart,
        roundEnd,
        roundStartTime,
        uploadedAt: new Date().toISOString(),
        userId: userId || null
      };
      if (userId) {
        setDoc(doc(db, 'users', userId, 'games', 'PatternMatch', 'rounds', `round${roundNum}`), roundData)
          .catch((err) => {
            if (onError) onError('Failed to upload PatternMatch round data: ' + err.message);
          });
      }
    }
  }, [gameState.isPlaying, gameState.currentTrial, gameState.trials, gameState.currentRound, gameState.gameComplete, userId, onError]);

  return {
    gameState,
    elapsedTime,
    stimulusRotation,
    startGame,
    startRound,
    handleScreenClick,
    handleStimulusClick,
    setShowRoundInstructions
  };
}; 