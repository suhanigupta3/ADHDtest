import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Target, Trial, RoundMetrics } from '../types';
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

// Score Interpretation Table
// 0.0–1.9: No concern (No follow-up needed)
// 2.0–3.9: Low concern (Track over time)
// 4.0–6.4: Monitor symptoms (Recommend lifestyle adjustments)
// 6.5–8.4: Moderate concern (Suggest clinical screening)
// 8.5–10.0: High concern (Strongly recommend professional evaluation)

// --- Domain scoring constants ---
const MAX_SELF_REPORT_SCORE = 5;  // Responses range from 1–5
const DOMAIN_SCALE = 3;           // All domain scores normalized to 0–3 for blending

function average(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function clamp(x: number, min = 0, max = 10): number {
  return Math.max(min, Math.min(max, x));
}

function normalizeSelfReport(value: number) {
  return (value / MAX_SELF_REPORT_SCORE) * DOMAIN_SCALE;
}

// --- New ADHD scoring logic ---
// (Constants removed - no longer needed with simple algorithm)

function clamp10(x: number): number {
  return Math.max(0, Math.min(10, x));
}

function normalizeSR(q: number): number {
  // Fix: Self-report normalization - scale 1-5 to 0-10
  // 1 = best (0), 5 = worst (10)
  return ((q - 1) / 4) * 10;
}

function computeADHDScores(patternMatch: { rounds: any[]; selfReport: any }) {
  const { rounds, selfReport } = patternMatch;

  // Validate input
  if (!rounds || rounds.length < 3) {
    console.error('[PatternMatch] Invalid rounds data:', rounds);
    return { inattention: 0, impulsivity: 0, executive_function: 0, hyperactivity: 0 };
  }

  // Extract round data
  const round1 = rounds[0];
  const round2 = rounds[1]; 
  const round3 = rounds[2];

  // Calculate accuracy for each round
  const round1Accuracy = round1.totalTrials > 0 ? 
    (round1.correctHits / round1.totalTrials) : 0;
  const round2Accuracy = round2.totalTrials > 0 ? 
    (round2.correctHits / round2.totalTrials) : 0;
  const round3Accuracy = round3.totalTrials > 0 ? 
    (round3.correctHits / round3.totalTrials) : 0;

  // Calculate total false positive rate
  const totalTrials = round1.totalTrials + round2.totalTrials + round3.totalTrials;
  const totalFalsePositives = round1.falsePositives + round2.falsePositives + round3.falsePositives;
  const falsePositiveRate = totalTrials > 0 ? (totalFalsePositives / totalTrials) : 0;

  // Calculate total movement (if available)
  const totalMovement = (round1.movementDuringStimulusCount || 0) + 
                       (round2.movementDuringStimulusCount || 0) + 
                       (round3.movementDuringStimulusCount || 0);

  // 1. Game-based scores (0-10)
  // Inattention: Accuracy decline over time (sustained attention)
  const gameInattention = Math.min(10, (round1Accuracy - round3Accuracy) * 10);

  // Impulsivity: False positive rate (inhibition control)
  const gameImpulsivity = Math.min(10, falsePositiveRate * 10);

  // Executive Function: Performance drop with complexity (working memory, task switching)
  const gameExecutive = Math.min(10, (round1Accuracy - round2Accuracy) * 10);

  // Hyperactivity: Movement during task (restlessness)
  const gameHyperactivity = Math.min(10, (totalMovement / totalTrials) * 2);

  // 2. Self-report scores (0-10)
  const srInattention = selfReport && selfReport.q1_focus_difficulty && selfReport.q2_careless_mistakes
    ? normalizeSR((selfReport.q1_focus_difficulty + selfReport.q2_careless_mistakes) / 2)
    : 0;
  const srImpulsivity = selfReport && selfReport.q3_act_without_thinking
    ? normalizeSR(selfReport.q3_act_without_thinking)
    : 0;
  const srExecutive = selfReport && selfReport.q4_rule_following_difficulty && selfReport.q5_mind_shifting
    ? normalizeSR((selfReport.q4_rule_following_difficulty + selfReport.q5_mind_shifting) / 2)
    : 0;
  const srHyperactivity = selfReport ? 
    normalizeSR((selfReport.q3_act_without_thinking + selfReport.q4_rule_following_difficulty) / 2) : 0;

  // Debug logging
  console.log('[PatternMatch][computeADHDScores] Round accuracies:', {
    round1: round1Accuracy.toFixed(3),
    round2: round2Accuracy.toFixed(3), 
    round3: round3Accuracy.toFixed(3)
  });
  
  console.log('[PatternMatch][computeADHDScores] Game scores:', {
    inattention: gameInattention.toFixed(2),
    impulsivity: gameImpulsivity.toFixed(2),
    executive: gameExecutive.toFixed(2),
    hyperactivity: gameHyperactivity.toFixed(2)
  });

  console.log('[PatternMatch][computeADHDScores] Self-report scores:', {
    inattention: srInattention.toFixed(2),
    impulsivity: srImpulsivity.toFixed(2),
    executive: srExecutive.toFixed(2),
    hyperactivity: srHyperactivity.toFixed(2)
  });

  // 3. Combine 70% game + 30% self-report, clamp to [0,10]
  const inattention = clamp10(0.7 * gameInattention + 0.3 * srInattention);
  const impulsivity = clamp10(0.7 * gameImpulsivity + 0.3 * srImpulsivity);
  const executive_function = clamp10(0.7 * gameExecutive + 0.3 * srExecutive);
  const hyperactivity = clamp10(0.7 * gameHyperactivity + 0.3 * srHyperactivity);

  console.log('[PatternMatch][computeADHDScores] Final combined scores:', {
    inattention: inattention.toFixed(2),
    impulsivity: impulsivity.toFixed(2),
    executive_function: executive_function.toFixed(2),
    hyperactivity: hyperactivity.toFixed(2)
  });

  return {
    inattention,
    impulsivity,
    executive_function,
    hyperactivity
  };
}

interface UseGameLogicProps {
  userId?: string;
  onGameComplete?: (roundMetrics: RoundMetrics[]) => void;
  onError?: (error: string) => void;
}

export const useGameLogic = ({ userId, onGameComplete, onError }: UseGameLogicProps) => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    currentRound: 1,
    currentTrial: 1,
    showInstructions: false, // Instructions handled by main app
    showRoundStart: false,
    currentTarget: { shape: 'circle', pattern: 'dots' },
    currentStimulus: null,
    trialStartTime: null,
    trials: [],
    roundStartTime: null,
    distractionActive: false,
    isFlickering: false,
    showStimulus: false,
    gameComplete: false,
    showScores: false,
    showQuestions: false,
    currentQuestionIndex: 0,
    questionAnswers: [],
    showThankYou: false
  });

  const targetDisplayTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const roundStartTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const userRespondedRef = useRef<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // CRITICAL FIX: Store roundMetrics in ref for immediate access
  const roundMetricsRef = useRef<RoundMetrics[]>([]);

  // Add state to track precomputed stimuli for the current block
  const [blockStimuli, setBlockStimuli] = useState<Target[]>([]);
  const [blockIndex, setBlockIndex] = useState(0);

  // Add state for round instructions and rotation
  const [showRoundInstructions, setShowRoundInstructions] = useState(true);
  const [stimulusRotation, setStimulusRotation] = useState(0);
  const [roundMetrics, setRoundMetrics] = useState<RoundMetrics[]>([]);

  // Add mouseMoveCount state
  const [mouseMoveCount, setMouseMoveCount] = useState(0);

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
      // Fix: targetChanged should track when target actually changes, not user response
      targetChanged: false, // Will be set to true when target actually changes
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

    // Fix: Mark the next trial as having a target change if target actually changed
    if (clicked) {
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          trials: prev.trials.map((t, index) => 
            index === prev.trials.length - 1 ? { ...t, targetChanged: true } : t
          )
        }));
      }, 0);
    }

    // Clear trial timeout
    if (targetDisplayTimeoutRef.current) {
      clearTimeout(targetDisplayTimeoutRef.current);
    }

    // Advance to next trial after a short delay
    setTimeout(() => {
      setGameState(prev => {
        const nextTrial = prev.currentTrial + 1;
        const nextRound = prev.currentRound + (nextTrial > TRIALS_PER_ROUND ? 1 : 0);

        if (nextRound > TOTAL_ROUNDS || (prev.currentRound === 3 && nextTrial > TRIALS_PER_ROUND)) {
          // Game is complete - ensure round 3 data is posted before setting gameComplete
          if (gameState.currentRound === 3 && userId && !gameState.gameComplete) {
            uploadRound3IfNeeded(gameState, userId);
          }
          // Calculate and set roundMetrics for all 3 rounds
          const finalRoundMetrics = [1, 2, 3].map(rn => {
            const roundTrials = [...prev.trials, trial].filter((t: any) => t.round === rn);
            return calculateRoundMetrics(roundTrials);
          });
          setRoundMetrics(finalRoundMetrics);
          
            // CRITICAL FIX: Store roundMetrics in a ref so it's immediately available
  roundMetricsRef.current = finalRoundMetrics;
  
            // Game is complete - call onGameComplete immediately
          console.log('[PatternMatch] Game finished, calling onGameComplete');
          
          // Call onGameComplete to let parent component handle self-report
          if (onGameComplete) {
            onGameComplete(finalRoundMetrics);
          }
          
          return {
            ...prev,
            gameComplete: true,
            isPlaying: false,
            currentStimulus: null,
            showStimulus: false,
            trialStartTime: null,
            showScores: true
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
    setBlockStimuli(generateStimulusBlock(gameState.currentTarget, gameState.currentRound));
    setBlockIndex(0);
  }, [gameState.currentTarget, gameState.currentRound]);

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



  // Function to handle question answer
  const handleQuestionAnswer = useCallback(async (questionIndex: number, answer: number) => {
    // Always update the answer array first
    setGameState(prev => {
      const updatedAnswers = [...prev.questionAnswers];
      updatedAnswers[questionIndex] = answer;
      return {
        ...prev,
        questionAnswers: updatedAnswers,
      };
    });
    // Wait for state update to propagate
    await new Promise(res => setTimeout(res, 0));
    if (!userId) return;
    
    // Get the latest answers from state
    const latestAnswers = [
      ...gameState.questionAnswers.slice(0, questionIndex),
      answer,
      ...gameState.questionAnswers.slice(questionIndex + 1)
    ];
    
    // Fix: Only process self-report and calculate scores when ALL questions are answered
    const allAnswered = latestAnswers.length === 5 && latestAnswers.every(a => typeof a === 'number' && !isNaN(a));
    
    if (allAnswered) {
      console.log('[PatternMatch] All questions answered, processing self-report:', latestAnswers);
      
      // FIXED: Use roundMetricsRef for immediate access to round data
      const rounds = roundMetricsRef.current.length > 0 ? roundMetricsRef.current : roundMetrics;
      
      console.log('[PatternMatch] Using roundMetrics for scoring:', {
        roundMetricsRefLength: roundMetricsRef.current.length,
        roundMetricsRef: roundMetricsRef.current,
        roundMetricsStateLength: roundMetrics.length,
        roundMetricsState: roundMetrics,
        rounds: rounds
      });
      
      // CRITICAL FIX: If no round data available, we can't calculate scores
      if (rounds.length === 0) {
        console.log('[PatternMatch] ERROR: No round data available, cannot calculate scores');
        console.log('[PatternMatch] roundMetricsRef.current:', roundMetricsRef.current);
        console.log('[PatternMatch] roundMetrics state:', roundMetrics);
        return; // Don't proceed with score calculation
      }

      // Build selfReport from latestAnswers (if available)
      console.log('[PatternMatch] Debug - latestAnswers:', latestAnswers);
      console.log('[PatternMatch] Debug - latestAnswers length:', latestAnswers?.length);
      console.log('[PatternMatch] Debug - all answers are numbers:', latestAnswers?.every(a => typeof a === 'number' && !isNaN(a)));
      
      const selfReport = latestAnswers && latestAnswers.length === 5 ? {
        q1_focus_difficulty: latestAnswers[0],
        q2_careless_mistakes: latestAnswers[1],
        q3_act_without_thinking: latestAnswers[2],
        q4_rule_following_difficulty: latestAnswers[3],
        q5_mind_shifting: latestAnswers[4]
      } : {};

      console.log('[PatternMatch] Self-report data:', selfReport);
      console.log('[PatternMatch] Self-report keys:', Object.keys(selfReport));
      console.log('[PatternMatch] Self-report values:', Object.values(selfReport));
      console.log('[PatternMatch] Round data for scoring:', rounds);
      console.log('[PatternMatch] Total trials across all rounds:', rounds.reduce((sum, r) => sum + r.totalTrials, 0));
      console.log('[PatternMatch] Total false positives across all rounds:', rounds.reduce((sum, r) => sum + r.falsePositives, 0));
      console.log('[PatternMatch] Total missed targets across all rounds:', rounds.reduce((sum, r) => sum + r.missedTargets, 0));

      // SINGLE PATH: Calculate scores with both game data AND self-report
      console.log('[PatternMatch] Calculating final scores with both game data and self-report');
      
      // Use new aggregate scoring function
      const scores = computeADHDScores({ rounds, selfReport });
      
      // Fix: Composite ADHD score calculation
      // Use weighted average based on clinical importance, not equal weights
      const adhd_composite = clamp10(
        (scores.inattention * 0.4 + scores.impulsivity * 0.3 + scores.executive_function * 0.2 + scores.hyperactivity * 0.1)
      );
      
      const scoresWithComposite = { ...scores, adhd_composite };

      console.log('[PatternMatch][FIREBASE] Posting FINAL scores to Firebase (with self-report):', scoresWithComposite);
      await setDoc(doc(db, 'users', userId, 'games', 'pattern-match'), { scores: scoresWithComposite }, { merge: true });
      console.log('[PatternMatch][FIREBASE] Successfully posted FINAL scores to Firebase');
      
      // Save self-report to Firebase
      try {
        await setDoc(doc(db, 'users', userId, 'games', 'pattern-match'), { selfReport }, { merge: true });
        console.log('[PatternMatch][FIREBASE] Successfully posted self-report to Firebase:', selfReport);
      } catch (err) {
        console.error('[PatternMatch][FIREBASE] Failed to post self-report:', err);
        if (onError) onError('Failed to upload PatternMatch self-report: ' + (err as any).message);
      }
      
      // Mark game2Completed in gameProgress
      try {
        await setDoc(doc(db, 'gameProgress', userId), { game2Completed: true }, { merge: true });
        console.log('[PatternMatch][FIREBASE] Set game2Completed: true in gameProgress for user', userId);
      } catch (err) {
        console.error('[PatternMatch][FIREBASE] Failed to set game2Completed in gameProgress:', err);
      }
      // Always advance the UI to Thank You screen
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: 5,
        showQuestions: false,
        showThankYou: true
      }));
      
      // Call onGameComplete AFTER scores and self-report are calculated and saved
      if (onGameComplete) {
        console.log('[PatternMatch] Calling onGameComplete with final data after self-report completion');
        onGameComplete(roundMetrics);
      }
    }

    // Move to next question or complete
    if (questionIndex < 4) { // 5 questions total (0-4)
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: questionIndex + 1
      }));
    } else {
      // All questions answered - just update UI, don't call onGameComplete yet
      setGameState(prev => ({
        ...prev,
        showQuestions: false
      }));
    }
  }, [userId, onError, roundMetrics, onGameComplete, gameState.questionAnswers, gameState.trials]);

  // Track mouse movement only while a round is active
  useEffect(() => {
    if (gameState.isPlaying) {
      const handleMouseMove = () => setMouseMoveCount(count => count + 1);
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [gameState.isPlaying]);
  
  // REMOVED: Duplicate score calculation logic - keeping only the working version in handleQuestionAnswer

  // Reset mouseMoveCount at the start of each round
  const startRound = () => {
    setMouseMoveCount(0);
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

      // --- Compute required fields ---
      let rule = '';
      let rotationUsed = false;
      let roundDifficultyWeight = 1.0;
      if (roundNum === 1) { rule = 'matchShapeOrPattern'; roundDifficultyWeight = 1.0; }
      else if (roundNum === 2) { rule = 'matchShapeAndPattern'; roundDifficultyWeight = 1.2; }
      else { rule = 'matchShapeAndPatternWithRotation'; rotationUsed = true; roundDifficultyWeight = 1.4; }

      const totalTrials = roundTrials.length;
      const roundDurationMs = totalTrials * 1300;
      const correctHits = roundTrials.filter((t: any) => t.isTarget && t.userClicked).length;
      const falsePositives = roundTrials.filter((t: any) => !t.isTarget && t.userClicked).length;
      const correctSkips = roundTrials.filter((t: any) => !t.isTarget && !t.userClicked).length;
      const missedTargets = roundTrials.filter((t: any) => t.isTarget && !t.userClicked).length;
      const reactionTimes = roundTrials.filter((t: any) => t.isTarget && t.userClicked).map((t: any) => t.reactionTimeMs);
      const averageReactionTimeMs = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a: number, b: number) => a + b, 0) / reactionTimes.length) : null;
      const safeAvgRT = averageReactionTimeMs ?? 0;
      const reactionTimeStdDev = reactionTimes.length > 1 ? Math.round(Math.sqrt(reactionTimes.reduce((sum: number, rt: number) => sum + Math.pow(rt - safeAvgRT, 2), 0) / (reactionTimes.length - 1))) : 0;
      const targetSwitchCount = roundTrials.filter((t: any) => t.targetChanged).length;
      const minimumTargetSwitchExpected = 3;

      // Mouse/cursor movement metrics - use actual tracked data
      const mouseMoveCount = 0; // TODO: Implement proper mouse tracking
      const cursorDistanceTraveledPx = 0; // TODO: Implement distance tracking
      const movementDuringStimulusCount = 0; // TODO: Implement proper movement tracking during stimulus

      const roundData = {
        rule,
        rotationUsed,
        totalTrials,
        roundDurationMs,
        correctHits,
        falsePositives,
        correctSkips,
        missedTargets,
        reactionTimes,
        averageReactionTimeMs,
        reactionTimeStdDev,
        targetSwitchCount,
        minimumTargetSwitchExpected,
        roundDifficultyWeight,
        mouseMoveCount,
        cursorDistanceTraveledPx,
        movementDuringStimulusCount
      };
      if (userId) {
        console.log(`[PatternMatch][FIREBASE] Posting round${roundNum} data to rounds subcollection for user ${userId}:`, roundData);
        setDoc(doc(db, 'users', userId, 'games', 'pattern-match', 'rounds', `round${roundNum}`), roundData)
          .then(() => {
            console.log(`[PatternMatch][FIREBASE] Successfully posted round${roundNum} data to rounds subcollection for user ${userId}`);
          })
          .catch((err) => {
            console.error('[PatternMatch][FIREBASE] Failed to post round data:', err);
            if (onError) onError('Failed to upload PatternMatch round data: ' + err.message);
          });
      } else {
        console.warn('[PatternMatch][FIREBASE] No userId provided, not posting round data.');
      }
    } else if (
      gameState.currentRound === 4 &&
      gameState.gameComplete &&
      gameState.trials.length > 0
    ) {
      // This means round 3 upload was likely skipped
      console.warn('[PatternMatch][FIREBASE][WARNING] Round 3 upload may have been skipped due to gameComplete state.');
    }
  }, [gameState.isPlaying, gameState.currentTrial, gameState.trials, gameState.currentRound, gameState.gameComplete, userId, onError]);

  // Add a setter for currentQuestionIndex for navigation
  const setCurrentQuestionIndex = (newIndex: number) => {
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: newIndex
    }));
  };

  return {
    gameState,
    elapsedTime,
    stimulusRotation,
    roundMetrics,
    startGame,
    startRound,
    handleScreenClick,
    handleStimulusClick,
    setShowRoundInstructions
  };
};

async function uploadRound3IfNeeded(gameState: GameState, userId: string) {
  const roundNum = 3;
  const roundTrials = gameState.trials.filter((t: any) => t.round === roundNum);
  if (roundTrials.length > 0 && userId) {
    let rule = 'matchShapeAndPatternWithRotation';
    let rotationUsed = true;
    let roundDifficultyWeight = 1.4;
    const totalTrials = roundTrials.length;
    const roundDurationMs = totalTrials * 1300;
    const correctHits = roundTrials.filter((t: any) => t.isTarget && t.userClicked).length;
    const falsePositives = roundTrials.filter((t: any) => !t.isTarget && t.userClicked).length;
    const correctSkips = roundTrials.filter((t: any) => !t.isTarget && !t.userClicked).length;
    const missedTargets = roundTrials.filter((t: any) => t.isTarget && !t.userClicked).length;
    const reactionTimes = roundTrials.filter((t: any) => t.isTarget && t.userClicked).map((t: any) => t.reactionTimeMs);
    const averageReactionTimeMs = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a: number, b: number) => a + b, 0) / reactionTimes.length) : null;
    const safeAvgRT = averageReactionTimeMs ?? 0;
    const reactionTimeStdDev = reactionTimes.length > 1 ? Math.round(Math.sqrt(reactionTimes.reduce((sum: number, rt: number) => sum + Math.pow(rt - safeAvgRT, 2), 0) / (reactionTimes.length - 1))) : 0;
    const targetSwitchCount = roundTrials.filter((t: any) => t.targetChanged).length;
    const minimumTargetSwitchExpected = 3;
    const mouseMoveCount = 0; // TODO: Implement proper mouse tracking
    const cursorDistanceTraveledPx = 0; // TODO: Implement distance tracking
    const movementDuringStimulusCount = 0; // TODO: Implement proper movement tracking during stimulus
    const roundData = {
      rule,
      rotationUsed,
      totalTrials,
      roundDurationMs,
      correctHits,
      falsePositives,
      correctSkips,
      missedTargets,
      reactionTimes,
      averageReactionTimeMs,
      reactionTimeStdDev,
      targetSwitchCount,
      minimumTargetSwitchExpected,
      roundDifficultyWeight,
      mouseMoveCount,
      cursorDistanceTraveledPx,
      movementDuringStimulusCount
    };
    console.log(`[PatternMatch][FIREBASE] Posting round3 data to rounds subcollection for user ${userId}:`, roundData);
    await setDoc(doc(db, 'users', userId, 'games', 'pattern-match', 'rounds', `round3`), roundData);
    console.log(`[PatternMatch][FIREBASE] Successfully posted round3 data to rounds subcollection for user ${userId}`);
  }
} 