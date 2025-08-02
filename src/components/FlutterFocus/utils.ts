import { ClickPattern, RhythmPattern } from './types';
import { CLICK_TOLERANCE, PERFECT_CLICK_BONUS, GOOD_CLICK_BONUS, MISSED_CLICK_PENALTY } from './constants';

// Calculate accuracy of a click
export const calculateClickAccuracy = (expectedTime: number, actualTime: number): number => {
  const difference = Math.abs(expectedTime - actualTime);
  if (difference <= 50) return 1.0; // Perfect
  if (difference <= 100) return 0.8; // Good
  if (difference <= CLICK_TOLERANCE) return 0.5; // Acceptable
  return 0.0; // Miss
};

// Calculate score for a click
export const calculateClickScore = (accuracy: number): number => {
  if (accuracy >= 0.9) return PERFECT_CLICK_BONUS;
  if (accuracy >= 0.7) return GOOD_CLICK_BONUS;
  if (accuracy >= 0.5) return 10;
  return MISSED_CLICK_PENALTY;
};

// Calculate rhythm consistency
export const calculateRhythmConsistency = (clickPatterns: ClickPattern[]): number => {
  if (clickPatterns.length < 2) return 0;
  
  const intervals = clickPatterns.slice(1).map((pattern, index) => {
    const current = pattern.actualTime;
    const previous = clickPatterns[index].actualTime;
    return current - previous;
  });
  
  const expectedInterval = clickPatterns[0].expectedTime;
  const consistencyScores = intervals.map(interval => {
    const difference = Math.abs(interval - expectedInterval);
    return Math.max(0, 1 - (difference / expectedInterval));
  });
  
  return consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
};

// Calculate average reaction time
export const calculateAverageReactionTime = (reactionTimes: number[]): number => {
  if (reactionTimes.length === 0) return 0;
  return reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length;
};

// Calculate focus score based on accuracy and consistency
export const calculateFocusScore = (accuracy: number, consistency: number): number => {
  return (accuracy * 0.6) + (consistency * 0.4);
};

// Generate beat timing for a pattern
export const generateBeatTiming = (pattern: RhythmPattern, startTime: number): number[] => {
  const timings: number[] = [];
  let currentTime = startTime;
  
  for (const interval of pattern.pattern) {
    timings.push(currentTime);
    currentTime += interval;
  }
  
  return timings;
};

// Check if a click is on time
export const isClickOnTime = (expectedTime: number, actualTime: number): boolean => {
  const difference = Math.abs(expectedTime - actualTime);
  return difference <= CLICK_TOLERANCE;
};

// Calculate overall accuracy
export const calculateOverallAccuracy = (clickPatterns: ClickPattern[]): number => {
  if (clickPatterns.length === 0) return 0;
  
  const successfulClicks = clickPatterns.filter(pattern => pattern.wasSuccessful).length;
  return (successfulClicks / clickPatterns.length) * 100;
};

// Format time for display
export const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const remainingMs = milliseconds % 1000;
  return `${seconds}.${remainingMs.toString().padStart(3, '0')}`;
};

// Calculate tempo from pattern
export const calculateTempo = (pattern: RhythmPattern): number => {
  const averageInterval = pattern.pattern.reduce((sum, interval) => sum + interval, 0) / pattern.pattern.length;
  return Math.round(60000 / averageInterval); // BPM
}; 