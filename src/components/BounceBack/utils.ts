import { Brick, Ball } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_WIDTH, PADDLE_Y_OFFSET, PADDLE_HEIGHT, BALL_RADIUS, BRICK_WIDTH, BRICK_HEIGHT, BRICK_PADDING, BRICK_OFFSET_TOP, BRICK_OFFSET_LEFT, BRICK_COLORS } from './constants';

// Collision detection utilities
export const checkCollision = (ballX: number, ballY: number, brick: Brick): boolean => {
  return ballX + BALL_RADIUS > brick.x &&
         ballX - BALL_RADIUS < brick.x + brick.width &&
         ballY + BALL_RADIUS > brick.y &&
         ballY - BALL_RADIUS < brick.y + brick.height;
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
): { newBall: Ball; bricksDestroyed: number; paddleHit: boolean; wallHit: boolean; outOfBounds: boolean; hitBrickIndex: number | null } => {
  let newX = ball.x + ball.dx;
  let newY = ball.y + ball.dy;
  let newDx = ball.dx;
  let newDy = ball.dy;
  let bricksDestroyed = 0;
  let paddleHit = false;
  let wallHit = false;
  let outOfBounds = false;
  let hitBrickIndex: number | null = null;

  if (!gameStarted) {
    return {
      newBall: { ...ball, x: paddleX + paddleWidth / 2, y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS },
      bricksDestroyed: 0,
      paddleHit: false,
      wallHit: false,
      outOfBounds: false,
      hitBrickIndex: null
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

  // Brick collision - improved detection
  let brickHit = false;
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];
    if (brick.status === 1 && !brickHit) {
      // Check collision with the ball's path, not just final position
      const ballPath = {
        x1: ball.x,
        y1: ball.y,
        x2: newX,
        y2: newY
      };
      
      // Also try simple collision check as fallback
      const simpleCollision = checkCollision(newX, newY, brick);
      
      if (checkCollisionWithPath(ballPath, brick) || simpleCollision) {
        brickHit = true;
        bricksDestroyed = 1;
        hitBrickIndex = i;
        
        // Determine collision side based on ball's movement direction
        const ballMovingUp = ball.dy < 0;
        const ballMovingDown = ball.dy > 0;
        const ballMovingLeft = ball.dx < 0;
        const ballMovingRight = ball.dx > 0;
        
        // Check which side of the brick was hit
        const ballTop = newY - BALL_RADIUS;
        const ballBottom = newY + BALL_RADIUS;
        const ballLeft = newX - BALL_RADIUS;
        const ballRight = newX + BALL_RADIUS;
        
        const brickTop = brick.y;
        const brickBottom = brick.y + brick.height;
        const brickLeft = brick.x;
        const brickRight = brick.x + brick.width;
        
        // Determine collision side based on ball's previous position and movement
        let hitFromTop = false;
        let hitFromBottom = false;
        let hitFromLeft = false;
        let hitFromRight = false;
        
        if (ballMovingDown && ballTop <= brickTop && ball.y - BALL_RADIUS > brickTop) {
          // Ball hit from above (top of brick)
          hitFromTop = true;
        } else if (ballMovingUp && ballBottom >= brickBottom && ball.y + BALL_RADIUS < brickBottom) {
          // Ball hit from below (bottom of brick)
          hitFromBottom = true;
        } else if (ballMovingRight && ballLeft <= brickLeft && ball.x - BALL_RADIUS > brickLeft) {
          // Ball hit from left side
          hitFromLeft = true;
        } else if (ballMovingLeft && ballRight >= brickRight && ball.x + BALL_RADIUS < brickRight) {
          // Ball hit from right side
          hitFromRight = true;
        }
        
        // Apply appropriate bounce based on collision side
        if (hitFromTop || hitFromBottom) {
          // Vertical collision - reverse Y direction
          newDy = -newDy;
        } else if (hitFromLeft || hitFromRight) {
          // Horizontal collision - reverse X direction
          newDx = -newDx;
        } else {
          // Fallback: use distance-based collision response
          const ballCenterX = newX;
          const ballCenterY = newY;
          const brickCenterX = brick.x + brick.width / 2;
          const brickCenterY = brick.y + brick.height / 2;
          
          const dx = ballCenterX - brickCenterX;
          const dy = ballCenterY - brickCenterY;
          
          if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal collision
            newDx = -newDx;
          } else {
            // Vertical collision
            newDy = -newDy;
          }
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
    hitBrickIndex
  };
};

// Game state utilities
export const createInitialBricks = (brickRows: number): Brick[] => {
  const bricks: Brick[] = [];
  
  // Calculate brick width and spacing to span full canvas width evenly
  const totalBrickWidth = CANVAS_WIDTH - 40; // Leave 20px margin on each side
  const brickPadding = 8; // Increased gap between bricks
  const totalPaddingWidth = 7 * brickPadding; // 7 gaps between 8 bricks
  const brickWidth = (totalBrickWidth - totalPaddingWidth) / 8; // 8 columns
  
  for (let c = 0; c < 8; c++) {
    for (let r = 0; r < brickRows; r++) {
      bricks.push({
        x: 20 + c * (brickWidth + brickPadding), // Start 20px from left edge
        y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
        status: 1,
        color: BRICK_COLORS[r],
        width: brickWidth,
        height: BRICK_HEIGHT
      });
    }
  }
  return bricks;
};

export const createInitialBall = (ballSpeed: number): Ball => {
  return {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS,
    dx: ballSpeed,
    dy: -ballSpeed,
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