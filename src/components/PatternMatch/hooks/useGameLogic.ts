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
const RT_MIN = 200;    // ms (fastest plausible RT)
const RT_MAX = 1000;   // ms (slowest plausible RT)

function clamp10(x: number): number {
  return Math.max(0, Math.min(10, x));
}

function normalizeSR(q: number): number {
  return ((q - 1) / 4) * 10;
}

function computeADHDScores(patternMatch: { rounds: any[]; selfReport: any }) {
  const { rounds, selfReport } = patternMatch;

  // 1. Aggregate weighted sums
  let totalTrialsAll = 0;
  let missedTargetsAll = 0;
  let falsePositivesAll = 0;
  let correctHitsAll = 0;
  let sumRTbyHits = 0;
  let weightHits = 0;
  let targetSwitchAll = 0;
  let minSwitchAll = 0;
  let moveDuringStimAll = 0;

  for (const r of rounds) {
    const w = r.roundDifficultyWeight ?? 1;
    totalTrialsAll     += w * (r.totalTrials ?? 0);
    missedTargetsAll   += w * (r.missedTargets ?? 0);
    falsePositivesAll  += w * (r.falsePositives ?? 0);
    correctHitsAll     += w * (r.correctHits ?? 0);
    sumRTbyHits        += w * (r.correctHits ?? 0) * (r.averageReactionTimeMs ?? 0);
    weightHits         += w * (r.correctHits ?? 0);
    targetSwitchAll    += w * (r.targetSwitchCount ?? 0);
    minSwitchAll       += w * (r.minimumTargetSwitchExpected ?? 0);
    // Support both r.mouseTracking.movementDuringStimulusCount and r.movementDuringStimulusCount
    let moveStim = 0;
    if (r.mouseTracking && typeof r.mouseTracking.movementDuringStimulusCount === 'number') {
      moveStim = r.mouseTracking.movementDuringStimulusCount;
    } else if (typeof r.movementDuringStimulusCount === 'number') {
      moveStim = r.movementDuringStimulusCount;
    }
    moveDuringStimAll  += w * moveStim;
  }

  const avgRT_weighted = weightHits > 0 ? sumRTbyHits / weightHits : RT_MAX;

  // 2. Game‐based scores (0–10)
  const gameInattention = totalTrialsAll > 0 ? ((missedTargetsAll + falsePositivesAll) / totalTrialsAll) * 10 : 0;

  const FA_rate = totalTrialsAll > 0 ? (falsePositivesAll / totalTrialsAll) * 10 : 0;
  const RT_rate = clamp10(((RT_MAX - avgRT_weighted) / (RT_MAX - RT_MIN)) * 10);
  const gameImpulsivity = 0.5 * FA_rate + 0.5 * RT_rate;

  const switchDeficit = minSwitchAll > 0 ? Math.max(0, minSwitchAll - targetSwitchAll) : 0;
  const gameExecutive = minSwitchAll > 0 ? clamp10((switchDeficit / minSwitchAll) * 10) : 0;

  const gameHyperactivity = totalTrialsAll > 0 ? (moveDuringStimAll / totalTrialsAll) * 10 : 0;

  // 3. Self‐report scores (0–10)
  const srInattention = selfReport && selfReport.q1_focus_difficulty && selfReport.q2_careless_mistakes
    ? normalizeSR((selfReport.q1_focus_difficulty + selfReport.q2_careless_mistakes) / 2)
    : 0;
  const srImpulsivity = selfReport && selfReport.q3_act_without_thinking
    ? normalizeSR(selfReport.q3_act_without_thinking)
    : 0;
  const srExecutive = selfReport && selfReport.q4_rule_following_difficulty && selfReport.q5_mind_shifting
    ? normalizeSR((selfReport.q4_rule_following_difficulty + selfReport.q5_mind_shifting) / 2)
    : 0;
  // If you have hyperactivity SR items, compute similarly; otherwise set to 0
  const srHyperactivity = 0;

  // 4. Combine 60% game + 40% self‐report, clamp to [0,10]
  const inattention        = clamp10(0.6 * gameInattention   + 0.4 * srInattention);
  const impulsivity        = clamp10(0.6 * gameImpulsivity   + 0.4 * srImpulsivity);
  const executive_function = clamp10(0.6 * gameExecutive     + 0.4 * srExecutive);
  const hyperactivity      = clamp10(0.6 * gameHyperactivity + 0.4 * srHyperactivity);

  return {
    inattention,
    impulsivity,
    executive_function,
    hyperactivity
  };
}

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
          // Game is complete - ensure round 3 data is posted before setting gameComplete
          if (gameState.currentRound === 3 && userId) {
            uploadRound3IfNeeded(gameState, userId);
          }
          // Calculate and set roundMetrics for all 3 rounds
          const finalRoundMetrics = [1, 2, 3].map(rn => {
            const roundTrials = [...prev.trials, trial].filter((t: any) => t.round === rn);
            return calculateRoundMetrics(roundTrials);
          });
          setRoundMetrics(finalRoundMetrics);
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

  // Function to show questions
  const showQuestions = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showScores: false,
      showQuestions: true,
      currentQuestionIndex: 0,
      questionAnswers: []
    }));
  }, []);

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
    const allAnswered = latestAnswers.length === 5 && latestAnswers.every(a => typeof a === 'number' && !isNaN(a));
    if (allAnswered) {
      // --- Calculate scores using all three rounds ---
      const rounds = [1, 2, 3].map(rn => {
        const r = gameState.trials.filter((t: any) => t.round === rn);
        const totalTrials = r.length;
        const correctHits = r.filter((t: any) => t.isTarget && t.userClicked).length;
        const falsePositives = r.filter((t: any) => !t.isTarget && t.userClicked).length;
        const correctSkips = r.filter((t: any) => !t.isTarget && !t.userClicked).length;
        const missedTargets = r.filter((t: any) => t.isTarget && !t.userClicked).length;
        const reactionTimes = r.filter((t: any) => t.isTarget && t.userClicked).map((t: any) => t.reactionTimeMs);
        const averageReactionTimeMs = reactionTimes.length > 0 ? reactionTimes.reduce((a: number, b: number) => a + b, 0) / reactionTimes.length : 1000;
        let roundDifficultyWeight = 1.0;
        let targetSwitchCount = r.filter((t: any) => t.targetChanged).length;
        let minimumTargetSwitchExpected = 3;
        let roundMouseMoveCount = (gameState.currentRound === rn && gameState.isPlaying) ? mouseMoveCount : 0;
        let movementDuringStimulusCount = 0; // set to 0 if not tracked
        let cursorDistanceTraveledPx = 0; // set to 0 if not tracked
        if (rn === 2) roundDifficultyWeight = 1.2;
        if (rn === 3) roundDifficultyWeight = 1.4;
        return {
          totalTrials,
          correctHits,
          falsePositives,
          correctSkips,
          missedTargets,
          averageReactionTimeMs,
          roundDifficultyWeight,
          targetSwitchCount,
          minimumTargetSwitchExpected,
          mouseMoveCount: roundMouseMoveCount,
          movementDuringStimulusCount,
          cursorDistanceTraveledPx
        };
      });

      // Build selfReport from latestAnswers (if available)
      const selfReport = latestAnswers && latestAnswers.length === 5 ? {
        q1_focus_difficulty: latestAnswers[0],
        q2_careless_mistakes: latestAnswers[1],
        q3_act_without_thinking: latestAnswers[2],
        q4_rule_following_difficulty: latestAnswers[3],
        q5_mind_shifting: latestAnswers[4]
      } : {};

      // Use new aggregate scoring function
      const scores = computeADHDScores({ rounds, selfReport });
      const adhd_composite = clamp10(
        scores.inattention * 0.35 +
        scores.executive_function * 0.35 +
        scores.impulsivity * 0.25 +
        scores.hyperactivity * 0.05
      );
      const scoresWithComposite = { ...scores, adhd_composite };

      console.log('[PatternMatch][FIREBASE] Posting scores to Firebase (final formulas):', scoresWithComposite);
      await setDoc(doc(db, 'users', userId, 'games', 'PatternMatch'), { scores: scoresWithComposite }, { merge: true });
      console.log('[PatternMatch][FIREBASE] Successfully posted scores to Firebase');
      // --- NEW: Mark game2Completed in gameProgress ---
      try {
        await setDoc(doc(db, 'gameProgress', userId), { game2Completed: true }, { merge: true });
        console.log('[PatternMatch][FIREBASE] Set game2Completed: true in gameProgress for user', userId);
      } catch (err) {
        console.error('[PatternMatch][FIREBASE] Failed to set game2Completed in gameProgress:', err);
      }
      // Post self-report answers to Firebase
      const allValid = latestAnswers.length === 5 && latestAnswers.every(a => typeof a === 'number' && !isNaN(a));
      if (allValid) {
        try {
          await setDoc(doc(db, 'users', userId, 'games', 'PatternMatch'), { selfReport }, { merge: true });
          console.log('[PatternMatch][FIREBASE] Successfully posted self-report to Firebase:', selfReport);
        } catch (err) {
          console.error('[PatternMatch][FIREBASE] Failed to post self-report:', err);
          if (onError) onError('Failed to upload PatternMatch self-report: ' + (err as any).message);
        }
      } else {
        console.error('[PatternMatch][FIREBASE] Not posting self-report: answers incomplete or invalid', latestAnswers);
        if (onError) onError('Self-report answers are incomplete or invalid.');
      }
      // Always advance the UI to Thank You screen
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: 5,
        showQuestions: false,
        showThankYou: true
      }));
    }

    // Move to next question or complete
    if (questionIndex < 4) { // 5 questions total (0-4)
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: questionIndex + 1
      }));
    } else {
      // All questions answered - now call onGameComplete to close the modal
      if (onGameComplete) {
        // Calculate final round metrics if not already done
        const finalRoundMetrics = roundMetrics.length > 0 ? roundMetrics : [1, 2, 3].map(round => {
          const roundTrials = gameState.trials.filter((t: any) => t.round === round);
          return calculateRoundMetrics(roundTrials);
        });
        onGameComplete(finalRoundMetrics);
      }
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

      // Mouse/cursor movement metrics (set to 0 if not tracked)
      const mouseMoveCount = 0;
      const cursorDistanceTraveledPx = 0;
      const movementDuringStimulusCount = 0;

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
        setDoc(doc(db, 'users', userId, 'games', 'PatternMatch', 'rounds', `round${roundNum}`), roundData)
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
    setShowRoundInstructions,
    showQuestions,
    handleQuestionAnswer,
    setCurrentQuestionIndex
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
    const mouseMoveCount = 0;
    const cursorDistanceTraveledPx = 0;
    const movementDuringStimulusCount = 0;
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
    await setDoc(doc(db, 'users', userId, 'games', 'PatternMatch', 'rounds', `round3`), roundData);
    console.log(`[PatternMatch][FIREBASE] Successfully posted round3 data to rounds subcollection for user ${userId}`);
  }
} 