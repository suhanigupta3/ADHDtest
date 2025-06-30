import { Target, Trial, RoundMetrics } from './types';
import { SHAPES, PATTERNS } from './constants';

// Generate random target sets for all rounds
export const generateRoundTargets = (): Target[][] => {
  const allTargets: Target[][] = [];
  
  for (let round = 0; round < 3; round++) {
    const roundTargets: Target[] = [];
    const usedCombinations = new Set<string>();
    
    for (let targetSet = 0; targetSet < 3; targetSet++) {
      let target: Target;
      do {
        target = {
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          pattern: PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
        };
      } while (usedCombinations.has(`${target.shape}-${target.pattern}`));
      
      usedCombinations.add(`${target.shape}-${target.pattern}`);
      roundTargets.push(target);
    }
    
    allTargets.push(roundTargets);
  }
  
  return allTargets;
};

// Generate random stimulus
export const generateStimulus = (): Target => {
  return {
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    pattern: PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
  };
};

// Check if stimulus matches target
export const isTargetMatch = (stimulus: Target, target: Target): boolean => {
  return stimulus.shape === target.shape && stimulus.pattern === target.pattern;
};

// Calculate round metrics
export const calculateRoundMetrics = (roundTrials: Trial[]): RoundMetrics => {
  const validTargetClicks = roundTrials.filter(t => t.isTarget && t.userClicked);
  const falsePositives = roundTrials.filter(t => !t.isTarget && t.userClicked).length;
  const missedTargets = roundTrials.filter(t => t.isTarget && !t.userClicked).length;
  const correctTrials = roundTrials.filter(t => t.isTarget === t.userClicked).length;
  
  const reactionTimes = validTargetClicks.map(t => t.reactionTimeMs);
  const reactionTimeValid = reactionTimes.length > 0 
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
    : 0;
  
  const reactionTimeVariance = reactionTimes.length > 1
    ? Math.sqrt(reactionTimes.reduce((sum, rt) => sum + Math.pow(rt - reactionTimeValid, 2), 0) / (reactionTimes.length - 1))
    : 0;
  
  // Count errors immediately after target switches (trials 1, 11, 21)
  const switchTrials = roundTrials.filter(t => t.targetChanged);
  const switchErrorCount = switchTrials.filter(t => t.isTarget !== t.userClicked).length;
  
  // Count errors during distraction trials
  const distractionTrials = roundTrials.filter(t => t.distractionActive);
  const distractorErrors = distractionTrials.filter(t => t.isTarget !== t.userClicked).length;
  const distractorErrorRate = distractionTrials.length > 0 
    ? distractorErrors / distractionTrials.length 
    : 0;

  return {
    round: roundTrials[0]?.round || 1,
    falsePositives,
    missedTargets,
    reactionTimeValid,
    reactionTimeVariance,
    switchErrorCount,
    distractorErrorRate,
    totalTrials: roundTrials.length,
    correctTrials
  };
};

// Helper: Get round-specific instructions
export const getRoundInstructions = (round: number) => {
  if (round === 1) {
    return {
      title: 'Round 1: Match Shape OR Pattern',
      text: 'Click if the shape OR the pattern matches the target.',
      example: "Target = Triangle + Stripes. Click for Circle + Stripes or Triangle + Dots. Don't click for Square + Checkers."
    };
  } else if (round === 2) {
    return {
      title: 'Round 2: Match Shape AND Pattern',
      text: 'Click only if BOTH the shape AND the pattern match the target.',
      example: "Target = Square + Dots. Click for Square + Dots. Don't click for Square + Stripes or Triangle + Dots."
    };
  } else {
    return {
      title: 'Round 3: Match Shape AND Pattern (with Rotation)',
      text: 'Click only if BOTH the shape AND the pattern match the target (even if the shape is rotated).',
      example: "Target = Star + Checkered. Click for Star + Checkered at any rotation. Don't click for Star + Dots or Circle + Checkered."
    };
  }
};

// Helper: Get in-round instruction text
export const getInRoundInstruction = (round: number) => {
  if (round === 1) {
    return 'If the shape OR pattern matches the target, Click anywhere or press SPACEBAR.';
  } else if (round === 2) {
    return 'If BOTH the shape AND pattern match the target, Click anywhere or press SPACEBAR.';
  } else {
    return 'If BOTH the shape AND pattern match the target (even if the shape is rotated), Click anywhere or press SPACEBAR.';
  }
};

// Helper: Per-round match logic
export const isStimulusMatch = (stimulus: Target, target: Target, round: number) => {
  if (round === 1) {
    return stimulus.shape === target.shape || stimulus.pattern === target.pattern;
  } else {
    // Round 2 and 3: must match both
    return stimulus.shape === target.shape && stimulus.pattern === target.pattern;
  }
};

// Helper to generate a block of 10 stimuli with at least one target match
export const generateStimulusBlock = (target: Target) => {
  const block: Target[] = [];
  // Pick a random index for the guaranteed match
  const matchIndex = Math.floor(Math.random() * 10);
  for (let i = 0; i < 10; i++) {
    if (i === matchIndex) {
      block.push({ ...target });
    } else {
      let stim: Target;
      do {
        stim = {
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          pattern: PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
        };
      } while (stim.shape === target.shape && stim.pattern === target.pattern);
      block.push(stim);
    }
  }
  // Shuffle the block for more randomness
  for (let i = block.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [block[i], block[j]] = [block[j], block[i]];
  }
  return block;
}; 