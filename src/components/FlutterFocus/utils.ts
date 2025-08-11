import { Obstacle, FlutterFocusLevel, RoundMetrics } from './types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  OBSTACLE_SPAWN_INTERVAL_MIN, 
  OBSTACLE_SPAWN_INTERVAL_MAX,
  OBSTACLE_SPEED_MIN,
  OBSTACLE_SPEED_MAX
} from './constants';

// Obstacle generation utilities
export function generateObstacle(level: number, currentTime: number): Obstacle {
  let types: string[] = [];
  let speed: number;
  let isDecoy = false;
  
  // Level-specific obstacle types and behaviors
  switch (level) {
    case 1: // Inattention Challenge - Calm Galaxy
      types = ['debris', 'planet'];
      speed = OBSTACLE_SPEED_MIN + Math.random() * (OBSTACLE_SPEED_MAX - OBSTACLE_SPEED_MIN);
      break;
      
    case 2: // Hyperactivity/Impulsivity Challenge - Asteroid Belt
      types = ['asteroid', 'debris'];
      speed = (OBSTACLE_SPEED_MIN + Math.random() * (OBSTACLE_SPEED_MAX - OBSTACLE_SPEED_MIN)) * 1.5;
      // 30% chance of decoy obstacles to test inhibition control
      isDecoy = Math.random() < 0.3;
      break;
      
    case 3: // Executive Function Challenge - Wormhole Maze
      types = ['blackhole', 'planet', 'asteroid'];
      speed = (OBSTACLE_SPEED_MIN + Math.random() * (OBSTACLE_SPEED_MAX - OBSTACLE_SPEED_MIN)) * 2.0;
      // Add path choice obstacles for executive function assessment
      if (Math.random() < 0.4) { // 40% chance of path choice
        types = ['portal', 'blackhole']; // Portal (correct path) vs Blackhole (wrong path)
      }
      break;
      
    default:
      types = ['debris'];
      speed = OBSTACLE_SPEED_MIN;
  }
  
  const type = types[Math.floor(Math.random() * types.length)];
  
  // Level-specific size adjustments
  let width: number, height: number;
  switch (type) {
    case 'planet':
      width = level === 1 ? 100 : 80; // Larger in level 1 for inattention challenge
      height = level === 1 ? 100 : 80;
      break;
    case 'asteroid':
      width = level === 2 ? 70 : 60; // Larger in level 2 for impulsivity challenge
      height = level === 2 ? 70 : 60;
      break;
    case 'blackhole':
      width = 60;
      height = 60;
      break;
    case 'portal':
      width = 80;
      height = 80;
      break;
    default:
      width = 40;
      height = 40;
  }
  
  return {
    id: `obstacle_${currentTime}_${Math.random()}`,
    x: CANVAS_WIDTH + 50, // Start off-screen
    y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
    width,
    height,
    type: type as any,
    speed,
    direction: 'left',
    isActive: true,
    isDecoy,
    color: getObstacleColor(type, isDecoy),
    rotation: 0,
    rotationSpeed: Math.random() * 0.1 - 0.05
  };
}

function getObstacleColor(type: string, isDecoy: boolean): string {
  if (isDecoy) return '#EF4444'; // Red for decoys
  
  switch (type) {
    case 'debris': return '#6B7280';
    case 'planet': return '#8B5CF6';
    case 'asteroid': return '#F97316';
    case 'blackhole': return '#000000';
    case 'portal': return '#10B981'; // Green for correct path
    default: return '#6B7280';
  }
}

// Collision detection
export function checkCollision(alien: { x: number; y: number; width: number; height: number }, 
                             obstacle: Obstacle): boolean {
  return alien.x < obstacle.x + obstacle.width &&
         alien.x + alien.width > obstacle.x &&
         alien.y < obstacle.y + obstacle.height &&
         alien.y + alien.height > obstacle.y;
}

// Update obstacle positions
export function updateObstacles(obstacles: Obstacle[], deltaTime: number): Obstacle[] {
  return obstacles
    .map(obstacle => ({
      ...obstacle,
      x: obstacle.x - obstacle.speed * deltaTime,
      rotation: obstacle.rotation + obstacle.rotationSpeed * deltaTime
    }))
    .filter(obstacle => obstacle.x + obstacle.width > -50); // Remove off-screen obstacles
}

// Calculate level score (100 points max)
export function calculateLevelScore(level: FlutterFocusLevel): number {
  let score = 0;
  
  // Reaction Time (25 points)
  if (level.reactionTimes.length > 0) {
    const avgReactionTime = level.reactionTimes.reduce((a, b) => a + b, 0) / level.reactionTimes.length;
    if (avgReactionTime < 300) score += 25;
    else if (avgReactionTime < 500) score += 20;
    else if (avgReactionTime < 700) score += 15;
    else if (avgReactionTime < 900) score += 10;
    else score += 5;
  }
  
  // Accuracy (25 points)
  if (level.crashes <= 1) score += 25;
  else if (level.crashes <= 3) score += 20;
  else if (level.crashes <= 6) score += 15;
  else if (level.crashes <= 10) score += 10;
  else score += 5;
  
  // Control (25 points)
  const inputEfficiency = level.inputCount > 0 ? 
    (level.inputCount - level.excessInputs) / level.inputCount : 1;
  if (inputEfficiency > 0.9) score += 25;
  else if (inputEfficiency > 0.8) score += 20;
  else if (inputEfficiency > 0.7) score += 15;
  else if (inputEfficiency > 0.6) score += 10;
  else score += 5;
  
  // Rule Adherence (25 points)
  let ruleScore = 25;
  if (level.levelNumber === 2 && level.decoyCollisions) {
    ruleScore -= Math.min(15, level.decoyCollisions * 5);
  }
  if (level.levelNumber === 3 && level.wrongPathChoices) {
    ruleScore -= Math.min(15, level.wrongPathChoices * 5);
  }
  score += Math.max(0, ruleScore);
  
  return Math.min(100, score);
}

// Calculate ADHD scores (0-10 scale)
export function calculateADHDScores(levels: FlutterFocusLevel[]): {
  inattention: number;
  hyperactivity: number;
  impulsivity: number;
  executiveFunction: number;
} {
  let totalIdleTime = 0;
  let totalCrashes = 0;
  let totalExcessInputs = 0;
  let totalDecoyCollisions = 0;
  let totalWrongChoices = 0;
  let totalGameTime = 0;
  let totalInputs = 0;
  
  levels.forEach(level => {
    totalIdleTime += level.idleTime;
    totalCrashes += level.crashes;
    totalExcessInputs += level.excessInputs;
    totalInputs += level.inputCount;
    totalGameTime += level.duration;
    
    if (level.decoyCollisions) totalDecoyCollisions += level.decoyCollisions;
    if (level.wrongPathChoices) totalWrongChoices += level.wrongPathChoices;
  });
  
  // Inattention: Based on idle time and crashes
  const inattention = Math.min(10, (totalIdleTime + totalCrashes * 1000) / totalGameTime * 10);
  
  // Hyperactivity: Based on excess inputs
  const hyperactivity = totalInputs > 0 ? Math.min(10, (totalExcessInputs / totalInputs) * 10) : 0;
  
  // Impulsivity: Based on decoy collisions and excess inputs
  const impulsivity = Math.min(10, (totalDecoyCollisions * 2 + totalExcessInputs * 0.5) / Math.max(1, totalInputs) * 10);
  
  // Executive Function: Based on wrong choices and rule violations
  const executiveFunction = Math.min(10, (totalWrongChoices * 3) / Math.max(1, levels.length) * 10);
  
  return {
    inattention: Math.round(inattention * 10) / 10,
    hyperactivity: Math.round(hyperactivity * 10) / 10,
    impulsivity: Math.round(impulsivity * 10) / 10,
    executiveFunction: Math.round(executiveFunction * 10) / 10
  };
}

// Convert level data to round metrics (following PatternMatch pattern)
export function levelToRoundMetrics(level: FlutterFocusLevel, round: number): RoundMetrics {
  return {
    round,
    levelNumber: level.levelNumber,
    levelName: level.levelName,
    score: level.score,
    livesLost: level.livesLost,
    crashes: level.crashes,
    obstaclesAvoided: level.obstaclesAvoided,
    obstaclesHit: level.obstaclesHit,
    decoyCollisions: level.decoyCollisions,
    wrongPathChoices: level.wrongPathChoices,
    memoryCueFailures: level.memoryCueFailures,
    reactionTimes: level.reactionTimes,
    inputCount: level.inputCount,
    excessInputs: level.excessInputs,
    idleTime: level.idleTime,
    levelMetrics: level.levelMetrics,
    totalTrials: level.inputCount,
    roundDurationMs: level.duration
  };
}

// Generate random obstacle spawn time
export function getNextObstacleSpawnTime(level: number): number {
  let minInterval = OBSTACLE_SPAWN_INTERVAL_MIN;
  let maxInterval = OBSTACLE_SPAWN_INTERVAL_MAX;
  
  // Level-specific adjustments
  if (level === 2) {
    minInterval = Math.max(500, minInterval * 0.7);
    maxInterval = Math.max(1000, maxInterval * 0.7);
  } else if (level === 3) {
    minInterval = Math.max(300, minInterval * 0.5);
    maxInterval = Math.max(800, maxInterval * 0.5);
  }
  
  return minInterval + Math.random() * (maxInterval - minInterval);
}

// Calculate input efficiency
export function calculateInputEfficiency(inputCount: number, excessInputs: number): number {
  if (inputCount === 0) return 1;
  return Math.max(0, (inputCount - excessInputs) / inputCount);
}

// Format time for display
export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 