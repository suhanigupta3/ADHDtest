import { Brick, Ball, Level } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_WIDTH, PADDLE_Y_OFFSET, PADDLE_HEIGHT, BALL_RADIUS, BRICK_WIDTH, BRICK_HEIGHT, BRICK_PADDING, BRICK_OFFSET_TOP, BRICK_OFFSET_LEFT, BRICK_COLORS } from './constants';

// Collision detection utilities
export const checkCollision = (ballX: number, ballY: number, brick: Brick): boolean => {
  // More precise collision detection with ball radius
  const ballLeft = ballX - BALL_RADIUS;
  const ballRight = ballX + BALL_RADIUS;
  const ballTop = ballY - BALL_RADIUS;
  const ballBottom = ballY + BALL_RADIUS;
  
  const brickLeft = brick.x;
  const brickRight = brick.x + brick.width;
  const brickTop = brick.y;
  const brickBottom = brick.y + brick.height;
  
  // Check if ball overlaps with brick
  return ballRight > brickLeft && 
         ballLeft < brickRight && 
         ballBottom > brickTop && 
         ballTop < brickBottom;
};

export const checkCollisionWithPath = (ballPath: { x1: number; y1: number; x2: number; y2: number }, brick: Brick): boolean => {
  // Check if the ball's path intersects with the brick
  const ballRadius = BALL_RADIUS;
  
  // Expand brick bounds by ball radius
  const expandedBrick = {
    x: brick.x - ballRadius,
    y: brick.y - ballRadius,
    width: brick.width + 2 * ballRadius,
    height: brick.height + 2 * ballRadius
  };
  
  // Check if line segment (ball path) intersects with expanded rectangle
  return lineIntersectsRect(ballPath, expandedBrick);
};

export const lineIntersectsRect = (line: { x1: number; y1: number; x2: number; y2: number }, rect: { x: number; y: number; width: number; height: number }): boolean => {
  // Check if line segment intersects with rectangle
  const { x1, y1, x2, y2 } = line;
  const { x, y, width, height } = rect;
  
  // Check if either endpoint is inside the rectangle
  if (x1 >= x && x1 <= x + width && y1 >= y && y1 <= y + height) return true;
  if (x2 >= x && x2 <= x + width && y2 >= y && y2 <= y + height) return true;
  
  // Check if line intersects with any of the rectangle's edges
  const edges = [
    { x1: x, y1: y, x2: x + width, y2: y }, // top
    { x1: x + width, y1: y, x2: x + width, y2: y + height }, // right
    { x1: x + width, y1: y + height, x2: x, y2: y + height }, // bottom
    { x1: x, y1: y + height, x2: x, y2: y } // left
  ];
  
  for (const edge of edges) {
    if (linesIntersect(line, edge)) return true;
  }
  
  return false;
};

export const linesIntersect = (line1: { x1: number; y1: number; x2: number; y2: number }, line2: { x1: number; y1: number; x2: number; y2: number }): boolean => {
  const { x1: x1, y1: y1, x2: x2, y2: y2 } = line1;
  const { x1: x3, y1: y3, x2: x4, y2: y4 } = line2;
  
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denom === 0) return false; // parallel lines
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
};

export const handlePaddleCollision = (ballX: number, ballY: number, ballDx: number, ballDy: number, paddleX: number, paddleWidth: number = PADDLE_WIDTH): { dx: number; dy: number } => {
  const hitPos = (ballX - paddleX) / paddleWidth;
  const angle = (hitPos - 0.5) * Math.PI / 4; // -45 to +45 degrees
  const speed = Math.sqrt(ballDx * ballDx + ballDy * ballDy);
  
  return {
    dx: speed * Math.sin(angle),
    dy: -speed * Math.cos(angle)
  };
};

// Ball physics utilities
export const updateBallPosition = (
  ball: Ball,
  paddleX: number,
  bricks: Brick[],
  gameStarted: boolean,
  paddleWidth: number = PADDLE_WIDTH
): { newBall: Ball; bricksDestroyed: number; paddleHit: boolean; wallHit: boolean; outOfBounds: boolean; hitBrickIndex: number | null; brickHealthReduced: boolean } => {
  let newX = ball.x + ball.dx;
  let newY = ball.y + ball.dy;
  let newDx = ball.dx;
  let newDy = ball.dy;
  let bricksDestroyed = 0;
  let paddleHit = false;
  let wallHit = false;
  let outOfBounds = false;
  let hitBrickIndex: number | null = null;

  if (!gameStarted || (ball.dx === 0 && ball.dy === 0)) {
    return {
      newBall: { ...ball, x: paddleX + paddleWidth / 2, y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS },
      bricksDestroyed: 0,
      paddleHit: false,
      wallHit: false,
      outOfBounds: false,
      hitBrickIndex: null,
      brickHealthReduced: false
    };
  }

  // Wall collision
  if (newX + BALL_RADIUS > CANVAS_WIDTH) {
    newDx = -Math.abs(newDx);
    wallHit = true;
  }
  if (newX - BALL_RADIUS < 0) {
    newDx = Math.abs(newDx);
    wallHit = true;
  }
  if (newY - BALL_RADIUS < 0) {
    newDy = Math.abs(newDy);
    wallHit = true;
  }

  // Paddle collision
  if (newY + BALL_RADIUS > CANVAS_HEIGHT - PADDLE_Y_OFFSET &&
      newY + BALL_RADIUS < CANVAS_HEIGHT - PADDLE_Y_OFFSET + PADDLE_HEIGHT &&
      newX > paddleX && newX < paddleX + paddleWidth) {
    
    // Ensure ball doesn't get stuck inside paddle
    newY = CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS;
    
    const collision = handlePaddleCollision(newX, newY, newDx, newDy, paddleX, paddleWidth);
    newDx = collision.dx;
    newDy = collision.dy;
    paddleHit = true;
  }

  // Improved brick collision detection with trajectory checking
  let brickHit = false;
  const ballSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
  
  // If ball is moving fast, check multiple points along the trajectory
  const trajectorySteps = Math.max(1, Math.ceil(ballSpeed / 3)); // Check every 3 pixels for better precision
  
  for (let i = 0; i < bricks.length && !brickHit; i++) {
    const brick = bricks[i];
    if (brick.status === 1) {
      let collisionDetected = false;
      let collisionPoint = { x: newX, y: newY };
      
      // Check multiple points along the ball's trajectory
      for (let step = 0; step <= trajectorySteps; step++) {
        const t = step / trajectorySteps;
        const checkX = ball.x + ball.dx * t;
        const checkY = ball.y + ball.dy * t;
        
        if (checkCollision(checkX, checkY, brick)) {
          collisionDetected = true;
          collisionPoint = { x: checkX, y: checkY };
          break;
        }
      }
      
      if (collisionDetected) {
        brickHit = true;
        hitBrickIndex = i;
        
        // Handle brick health and destruction
        if (brick.health > 1) {
          // Brick has multiple hits - reduce health and update crack level
          brick.health--;
          brick.crackLevel = brick.maxHealth - brick.health;
          bricksDestroyed = 0; // Brick not destroyed yet
        } else {
          // Brick will be destroyed
          bricksDestroyed = 1;
        }
        
        // Determine collision side for proper bounce
        const ballCenterX = collisionPoint.x;
        const ballCenterY = collisionPoint.y;
        const brickCenterX = brick.x + brick.width / 2;
        const brickCenterY = brick.y + brick.height / 2;
        
        // Calculate distances to each side of the brick
        const distToTop = Math.abs(ballCenterY - brick.y);
        const distToBottom = Math.abs(ballCenterY - (brick.y + brick.height));
        const distToLeft = Math.abs(ballCenterX - brick.x);
        const distToRight = Math.abs(ballCenterX - (brick.x + brick.width));
        
        // Find the closest side
        const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight);
        
        if (minDist === distToTop || minDist === distToBottom) {
          // Vertical collision - reverse Y direction
          newDy = -newDy;
        } else {
          // Horizontal collision - reverse X direction
          newDx = -newDx;
        }
        
        // Position ball at collision point to prevent tunneling
        // Add a small offset to ensure ball is outside the brick
        const offsetX = ballCenterX > brickCenterX ? BALL_RADIUS + 1 : -BALL_RADIUS - 1;
        const offsetY = ballCenterY > brickCenterY ? BALL_RADIUS + 1 : -BALL_RADIUS - 1;
        
        // Position ball outside the brick
        if (Math.abs(ballCenterX - brickCenterX) > Math.abs(ballCenterY - brickCenterY)) {
          // Horizontal collision - offset X
          newX = ballCenterX + offsetX;
          newY = ballCenterY;
        } else {
          // Vertical collision - offset Y
          newX = ballCenterX;
          newY = ballCenterY + offsetY;
        }
        
        break; // Only hit one brick per frame
      }
    }
  }

  // Ball out of bounds
  if (newY + BALL_RADIUS > CANVAS_HEIGHT - PADDLE_Y_OFFSET + PADDLE_HEIGHT) {
    outOfBounds = true;
  }

  // Safety check: prevent ball from going into extreme positions
  if (newY > CANVAS_HEIGHT + 100 || newY < -100) {
    outOfBounds = true;
  }

  return {
    newBall: { x: newX, y: newY, dx: newDx, dy: newDy },
    bricksDestroyed,
    paddleHit,
    wallHit,
    outOfBounds,
    hitBrickIndex,
    brickHealthReduced: brickHit && bricksDestroyed === 0
  };
};

// Game state utilities
export const createInitialBricks = (brickRows: number, level: Level): Brick[] => {
  const bricks: Brick[] = [];
  
  // Calculate brick width and spacing to span full canvas width evenly
  const totalBrickWidth = CANVAS_WIDTH - 40; // Leave 20px margin on each side
  const brickPadding = 8; // Increased gap between bricks
  const totalPaddingWidth = 7 * brickPadding; // 7 gaps between 8 bricks
  const brickWidth = (totalBrickWidth - totalPaddingWidth) / 8; // 8 columns
  
  for (let c = 0; c < 8; c++) {
    for (let r = 0; r < brickRows; r++) {
      // Determine brick type based on level configuration
      const random = Math.random();
      let brickType: 'normal' | 'tough' | 'indestructible' | 'powerup' = 'normal';
      let health = 1;
      let maxHealth = 1;
      let powerUpType: 'wider_paddle' | 'slower_ball' | undefined;
      
             // Check for boss brick (very rare, 2% chance)
       if (random < 0.02) {
         brickType = 'indestructible';
         health = 5;
         maxHealth = 5;
       }
       // Check for power-up brick first (highest priority)
       else if (random < level.powerUpChance) {
         brickType = 'powerup';
         health = 1;
         maxHealth = 1;
         // Randomly assign power-up type
         const powerUpTypes: ('wider_paddle' | 'slower_ball')[] = 
           ['wider_paddle', 'slower_ball'];
         powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
       }
       // Check for tough brick
       else if (random < level.powerUpChance + level.toughBrickChance) {
         brickType = 'tough';
         health = level.multiHitBricks ? 3 : 2; // 3 hits for multi-hit levels, 2 for others
         maxHealth = health;
       }
       // Normal brick
       else {
         brickType = 'normal';
         health = 1;
         maxHealth = 1;
       }
      
      bricks.push({
        x: 20 + c * (brickWidth + brickPadding), // Start 20px from left edge
        y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
        status: 1,
        color: BRICK_COLORS[r],
        width: brickWidth,
        height: BRICK_HEIGHT,
        health,
        maxHealth,
        crackLevel: 0, // Start with no cracks
        brickType,
        powerUpType
      });
    }
  }
  return bricks;
};

export const createInitialBall = (ballSpeed: number): Ball => {
  return {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS,
    dx: 0, // Start with zero velocity - ball won't move until spacebar is pressed
    dy: 0,
  };
};

export const calculateAccuracy = (bricksDestroyed: number, totalBricks: number): number => {
  return totalBricks > 0 ? (bricksDestroyed / totalBricks) * 100 : 0;
};

export const calculateAverageReactionTime = (reactionTimes: number[]): number => {
  return reactionTimes.length > 0 
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
    : 0;
}; 