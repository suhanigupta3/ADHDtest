import { 
  GRID_SIZE, 
  CELL_SIZE, 
  FRUIT_SIZE, 
  OBSTACLE_SIZE, 
  TARGET_FRUIT_SCORE, 
  NON_TARGET_FRUIT_PENALTY, 
  OBSTACLE_HIT_PENALTY,
  MISTAKE_PENALTY,
  FRUIT_TYPES
} from './constants';
import { Player, Fruit, Obstacle, BerryBlitzRound } from './types';

// Utility functions for Berry Blitz game

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const getRandomPosition = (): { x: number; y: number } => {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE)
  };
};

export const getRandomFruitType = (): 'lemon' | 'strawberry' | 'orange' | 'apple' | 'grape' => {
  const types = ['lemon', 'strawberry', 'orange', 'apple', 'grape'] as const;
  return types[Math.floor(Math.random() * types.length)];
};

export const isPositionOccupied = (
  x: number, 
  y: number, 
  player: Player, 
  fruits: Fruit[], 
  obstacles: Obstacle[]
): boolean => {
  // Check if position is occupied by player
  if (player.x === x && player.y === y) return true;
  
  // Check if position is occupied by any fruit
  if (fruits.some(fruit => fruit.x === x && fruit.y === y && !fruit.collected)) return true;
  
  // Check if position is occupied by any obstacle
  if (obstacles.some(obstacle => obstacle.x === x && obstacle.y === y)) return true;
  
  return false;
};

export const getEmptyPosition = (
  player: Player, 
  fruits: Fruit[], 
  obstacles: Obstacle[]
): { x: number; y: number } => {
  let attempts = 0;
  let position = getRandomPosition();
  
  while (isPositionOccupied(position.x, position.y, player, fruits, obstacles) && attempts < 50) {
    position = getRandomPosition();
    attempts++;
  }
  
  return position;
};

export const createFruit = (
  targetFruit: 'lemon' | 'strawberry' | 'orange',
  player: Player,
  existingFruits: Fruit[],
  existingObstacles: Obstacle[]
): Fruit => {
  const position = getEmptyPosition(player, existingFruits, existingObstacles);
  const fruitType = getRandomFruitType();
  
  return {
    id: `fruit_${Date.now()}_${Math.random()}`,
    x: position.x,
    y: position.y,
    type: fruitType,
    isTarget: fruitType === targetFruit,
    collected: false,
    spawnTime: Date.now()
  };
};

export const createObstacle = (
  player: Player,
  existingFruits: Fruit[],
  existingObstacles: Obstacle[]
): Obstacle => {
  const position = getEmptyPosition(player, existingFruits, existingObstacles);
  const directions = ['up', 'down', 'left', 'right'] as const;
  const direction = directions[Math.floor(Math.random() * directions.length)];
  
  return {
    id: `obstacle_${Date.now()}_${Math.random()}`,
    x: position.x,
    y: position.y,
    type: 'shuriken',
    direction,
    speed: 0.5,
    spawnTime: Date.now()
  };
};

export const moveObstacle = (obstacle: Obstacle): Obstacle => {
  let newX = obstacle.x;
  let newY = obstacle.y;
  
  // Use slower, more gradual movement
  const moveAmount = 0.1; // Very slow movement
  
  switch (obstacle.direction) {
    case 'up':
      newY = Math.max(0, obstacle.y - moveAmount);
      break;
    case 'down':
      newY = Math.min(GRID_SIZE - 1, obstacle.y + moveAmount);
      break;
    case 'left':
      newX = Math.max(0, obstacle.x - moveAmount);
      break;
    case 'right':
      newX = Math.min(GRID_SIZE - 1, obstacle.x + moveAmount);
      break;
  }
  
  return {
    ...obstacle,
    x: newX,
    y: newY
  };
};

export const checkCollisions = (
  player: Player,
  fruits: Fruit[],
  obstacles: Obstacle[]
): { 
  fruitCollected: Fruit | null; 
  obstacleHit: Obstacle | null; 
  newFruits: Fruit[]; 
  newObstacles: Obstacle[] 
} => {
  let fruitCollected: Fruit | null = null;
  let obstacleHit: Obstacle | null = null;
  
  // Check fruit collisions
  const newFruits = fruits.map(fruit => {
    if (!fruit.collected && fruit.x === player.x && fruit.y === player.y) {
      fruitCollected = fruit;
      return { ...fruit, collected: true };
    }
    return fruit;
  });
  
  // Check obstacle collisions
  const newObstacles = obstacles.map(obstacle => {
    if (obstacle.x === player.x && obstacle.y === player.y) {
      obstacleHit = obstacle;
    }
    return obstacle;
  });
  
  return { fruitCollected, obstacleHit, newFruits, newObstacles };
};

export const calculateScore = (
  targetFruitsCollected: number,
  nonTargetFruitsCollected: number,
  obstaclesHit: number,
  mistakes: number
): number => {
  return (
    targetFruitsCollected * TARGET_FRUIT_SCORE +
    nonTargetFruitsCollected * NON_TARGET_FRUIT_PENALTY +
    obstaclesHit * OBSTACLE_HIT_PENALTY +
    mistakes * MISTAKE_PENALTY
  );
};

export const calculateAccuracy = (targetFruitsCollected: number, totalFruitsCollected: number): number => {
  if (totalFruitsCollected === 0) return 100;
  return Math.round((targetFruitsCollected / totalFruitsCollected) * 100);
};

export const calculateADHDScores = (rounds: BerryBlitzRound[]): {
  inattention: number;
  hyperactivity: number;
  impulsivity: number;
  executiveFunction: number;
} => {
  if (rounds.length === 0) {
    return { inattention: 5, hyperactivity: 5, impulsivity: 5, executiveFunction: 5 };
  }
  
  // Calculate aggregate metrics
  const totalFruitsCollected = rounds.reduce((sum, round) => sum + round.fruitsCollected, 0);
  const totalObstaclesHit = rounds.reduce((sum, round) => sum + round.obstaclesHit, 0);
  const totalMistakes = rounds.reduce((sum, round) => sum + round.mistakes, 0);
  const totalAccuracy = rounds.reduce((sum, round) => sum + round.accuracy, 0) / rounds.length;
  const totalReactionTime = rounds.reduce((sum, round) => 
    sum + (round.reactionTimes.length > 0 ? round.reactionTimes.reduce((a, b) => a + b, 0) / round.reactionTimes.length : 0), 0
  ) / rounds.length;
  
  // Inattention: Based on accuracy and obstacles hit
  const inattention = Math.max(1, Math.min(10, 
    10 - (totalAccuracy / 10) + (totalObstaclesHit * 0.5)
  ));
  
  // Hyperactivity: Based on movement patterns and reaction time
  const hyperactivity = Math.max(1, Math.min(10, 
    Math.min(10, totalReactionTime / 100) + (totalMistakes * 0.3)
  ));
  
  // Impulsivity: Based on mistakes and non-target fruit collection
  const impulsivity = Math.max(1, Math.min(10, 
    (totalMistakes * 0.4) + (totalObstaclesHit * 0.3)
  ));
  
  // Executive Function: Based on overall performance and planning
  const executiveFunction = Math.max(1, Math.min(10, 
    10 - (totalAccuracy / 10) + (totalMistakes * 0.2)
  ));
  
  return {
    inattention: Math.round(inattention * 10) / 10,
    hyperactivity: Math.round(hyperactivity * 10) / 10,
    impulsivity: Math.round(impulsivity * 10) / 10,
    executiveFunction: Math.round(executiveFunction * 10) / 10
  };
};

export const getFruitEmoji = (type: string): string => {
  return FRUIT_TYPES[type as keyof typeof FRUIT_TYPES]?.emoji || '🍎';
};

export const getFruitColor = (type: string): string => {
  return FRUIT_TYPES[type as keyof typeof FRUIT_TYPES]?.color || '#FF4444';
};
