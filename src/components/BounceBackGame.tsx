import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Brick {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'anxiety' | 'affirmation' | 'depression' | 'trigger' | 'support' | 'mindfulness' | 'normal';
  hits: number;
  maxHits: number;
  active: boolean;
  message?: string;
  effect?: string;
  color: string;
}

interface GameState {
  ball: { x: number; y: number; dx: number; dy: number; radius: number };
  paddle: { x: number; y: number; width: number; height: number };
  bricks: Brick[];
  score: number;
  lives: number;
  level: number;
  gameStarted: boolean;
  gameOver: boolean;
  levelComplete: boolean;
  gamePaused: boolean;
  powerUps: {
    widePaddle: boolean;
    extraBall: boolean;
    slowBall: boolean;
  };
  gameStats: {
    missedHits: number;
    anxietyHits: number;
    powerUpsCollected: number;
    triggerResponses: number;
    focusBreaks: number;
  };
}

interface SelfCheckQuestion {
  id: string;
  question: string;
  trait: string;
  value: number;
}

const BounceBackGame: React.FC<{
  onGameComplete: (data: any) => void;
  onError: (error: string) => void;
  width?: string;
  height?: string;
  isStandalone?: boolean;
  userId?: string;
}> = ({ onGameComplete, onError, width = "100%", height = "600px", isStandalone = true, userId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [gameState, setGameState] = useState<GameState>({
    ball: { x: 400, y: 550, dx: 5, dy: -5, radius: 8 },
    paddle: { x: 350, y: 570, width: 120, height: 12 },
    bricks: [],
    score: 0,
    lives: 3,
    level: 1,
    gameStarted: false,
    gameOver: false,
    levelComplete: false,
    gamePaused: false,
    powerUps: {
      widePaddle: false,
      extraBall: false,
      slowBall: false,
    },
    gameStats: {
      missedHits: 0,
      anxietyHits: 0,
      powerUpsCollected: 0,
      triggerResponses: 0,
      focusBreaks: 0,
    },
  });

  const [selfCheckQuestions, setSelfCheckQuestions] = useState<SelfCheckQuestion[]>([
    { id: '1', question: 'How often did your mind drift while trying to hit the blocks?', trait: 'inattention', value: 3 },
    { id: '2', question: 'How often did you tap or fidget while playing?', trait: 'hyperactivity', value: 3 },
    { id: '3', question: 'How often did you react too quickly and miss the ball?', trait: 'impulsivity', value: 3 },
    { id: '4', question: 'How often did you pause to focus or plan?', trait: 'executive_planning', value: 3 },
    { id: '5', question: 'How often did you give up or zone out before finishing the level?', trait: 'executive_persistence', value: 3 },
  ]);

  const [showSelfCheck, setShowSelfCheck] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [showFocusHelper, setShowFocusHelper] = useState(false);

  // Brick types and their properties
  const brickTypes = {
    anxiety: { color: '#ff6b6b', maxHits: 2, message: 'Persist through challenges' },
    affirmation: { color: '#4ecdc4', maxHits: 1, message: 'Take a breath' },
    depression: { color: '#45b7d1', maxHits: 1, message: 'Keep going' },
    trigger: { color: '#ffa726', maxHits: 1, message: 'Stay calm' },
    support: { color: '#66bb6a', maxHits: 1, message: 'Help available' },
    mindfulness: { color: '#ab47bc', maxHits: 1, message: 'Be present' },
    normal: { color: '#95a5a6', maxHits: 1, message: '' },
  };

  // Generate bricks for current level
  const generateBricks = useCallback((level: number) => {
    const bricks: Brick[] = [];
    const rows = 4 + Math.floor(level / 2);
    const cols = 10;
    const brickWidth = Math.floor(canvasSize.width / cols) - 8;
    const brickHeight = 24;
    const padding = 4;
    const startX = 20;
    const startY = 60;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (brickWidth + padding) + startX;
        const y = row * (brickHeight + padding) + startY;

        // Determine brick type based on level and position
        let type: Brick['type'] = 'normal';
        const random = Math.random();

        if (level >= 2 && random < 0.15) type = 'anxiety';
        else if (random < 0.12) type = 'affirmation';
        else if (level >= 2 && random < 0.18) type = 'depression';
        else if (level >= 3 && random < 0.1) type = 'trigger';
        else if (random < 0.08) type = 'support';
        else if (random < 0.08) type = 'mindfulness';

        bricks.push({
          id: `${row}-${col}`,
          x,
          y,
          width: brickWidth,
          height: brickHeight,
          type,
          hits: 0,
          maxHits: brickTypes[type].maxHits,
          active: true,
          message: brickTypes[type].message,
          color: brickTypes[type].color,
        });
      }
    }

    return bricks;
  }, [canvasSize.width]);

  // Initialize game and update when canvas size changes
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      bricks: generateBricks(prev.level),
      ball: { 
        x: canvasSize.width / 2, 
        y: canvasSize.height - 80, 
        dx: 5, 
        dy: -5, 
        radius: 8 
      },
      paddle: { 
        x: (canvasSize.width - 120) / 2, 
        y: canvasSize.height - 40, 
        width: 120, 
        height: 12 
      },
    }));
  }, [generateBricks, canvasSize]);

  // Show encouragement messages
  const showEncouragementMessage = (message: string) => {
    setEncouragementMessage(message);
    setShowEncouragement(true);
    setTimeout(() => setShowEncouragement(false), 3000);
  };

  // Focus helper timer
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !gameState.gamePaused) {
      const timer = setTimeout(() => {
        setShowFocusHelper(true);
        setTimeout(() => setShowFocusHelper(false), 2000);
      }, 10000); // Show focus helper after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.gamePaused]);

  // Enhanced game loop with ADHD-friendly features
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.gamePaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background gradient with calming pattern
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      const level = gameState.level;
      if (level <= 2) {
        gradient.addColorStop(0, '#1e293b');
        gradient.addColorStop(1, '#334155');
      } else if (level <= 4) {
        gradient.addColorStop(0, '#581c87');
        gradient.addColorStop(1, '#7c3aed');
      } else {
        gradient.addColorStop(0, '#065f46');
        gradient.addColorStop(1, '#059669');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw calming background pattern
      ctx.save();
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < canvas.width; i += 40) {
        for (let j = 0; j < canvas.height; j += 40) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(i, j, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Draw bricks with enhanced visual effects
      gameState.bricks.forEach(brick => {
        if (!brick.active) return;

        // Draw brick with gradient and glow effect
        const brickGradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
        brickGradient.addColorStop(0, brick.color);
        brickGradient.addColorStop(1, adjustBrightness(brick.color, -20));
        ctx.fillStyle = brickGradient;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        
        // Draw border with glow effect
        ctx.strokeStyle = adjustBrightness(brick.color, 30);
        ctx.lineWidth = 2;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);

        // Add subtle glow effect
        ctx.shadowColor = brick.color;
        ctx.shadowBlur = 5;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        ctx.shadowBlur = 0;

        // Draw hit count for anxiety bricks with animation
        if (brick.type === 'anxiety' && brick.hits > 0) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          const remainingHits = brick.maxHits - brick.hits;
          ctx.fillText(`${remainingHits}`, brick.x + brick.width / 2, brick.y + brick.height / 2 + 4);
          
          // Add pulsing effect for remaining hits
          if (remainingHits === 1) {
            ctx.shadowColor = '#ff6b6b';
            ctx.shadowBlur = 10;
            ctx.fillText(`${remainingHits}`, brick.x + brick.width / 2, brick.y + brick.height / 2 + 4);
            ctx.shadowBlur = 0;
          }
        }

        // Special effects for different brick types
        if (brick.type === 'mindfulness') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(brick.x + brick.width / 2, brick.y + brick.height / 2, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw paddle with enhanced effects
      const paddleGradient = ctx.createLinearGradient(
        gameState.paddle.x, gameState.paddle.y, 
        gameState.paddle.x, gameState.paddle.y + gameState.paddle.height
      );
      paddleGradient.addColorStop(0, '#3b82f6');
      paddleGradient.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = paddleGradient;
      ctx.fillRect(gameState.paddle.x, gameState.paddle.y, gameState.paddle.width, gameState.paddle.height);
      
      // Paddle border with glow
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.strokeRect(gameState.paddle.x, gameState.paddle.y, gameState.paddle.width, gameState.paddle.height);
      
      // Add paddle glow effect
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.strokeRect(gameState.paddle.x, gameState.paddle.y, gameState.paddle.width, gameState.paddle.height);
      ctx.shadowBlur = 0;

      // Draw ball with enhanced effects
      const ballGradient = ctx.createRadialGradient(
        gameState.ball.x - 3, gameState.ball.y - 3, 0,
        gameState.ball.x, gameState.ball.y, gameState.ball.radius
      );
      ballGradient.addColorStop(0, '#ef4444');
      ballGradient.addColorStop(1, '#dc2626');
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Ball glow effect
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Ball highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(gameState.ball.x - 2, gameState.ball.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw enhanced UI
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${gameState.score}`, 20, 35);
      ctx.fillText(`Lives: ${gameState.lives}`, 20, 65);
      ctx.fillText(`Level: ${gameState.level}`, 20, 95);

      // Draw game stats with icons
      ctx.font = '14px Arial';
      ctx.fillText(`Missed: ${gameState.gameStats.missedHits}`, canvas.width - 150, 35);
      ctx.fillText(`Power-ups: ${gameState.gameStats.powerUpsCollected}`, canvas.width - 150, 55);

      // Draw focus indicator
      if (showFocusHelper) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Stay Focused!', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px Arial';
        ctx.fillText('You\'re doing great!', canvas.width / 2, canvas.height / 2 + 30);
      }

      // Update ball position
      setGameState(prev => {
        const newBall = {
          ...prev.ball,
          x: prev.ball.x + prev.ball.dx,
          y: prev.ball.y + prev.ball.dy,
        };

        // Ball collision with walls
        if (newBall.x <= newBall.radius || newBall.x >= canvas.width - newBall.radius) {
          newBall.dx = -newBall.dx;
        }
        if (newBall.y <= newBall.radius) {
          newBall.dy = -newBall.dy;
        }

        // Ball collision with paddle
        if (newBall.y >= prev.paddle.y - newBall.radius &&
            newBall.x >= prev.paddle.x &&
            newBall.x <= prev.paddle.x + prev.paddle.width) {
          newBall.dy = -Math.abs(newBall.dy);
          // Adjust ball direction based on where it hits the paddle
          const hitPos = (newBall.x - prev.paddle.x) / prev.paddle.width;
          newBall.dx = (hitPos - 0.5) * 10;
        }

        // Ball falls below paddle
        if (newBall.y > canvas.height) {
          return {
            ...prev,
            lives: prev.lives - 1,
            ball: { x: canvas.width / 2, y: canvas.height - 80, dx: 5, dy: -5, radius: 8 },
            gameStats: {
              ...prev.gameStats,
              missedHits: prev.gameStats.missedHits + 1,
            },
            gameOver: prev.lives <= 1,
          };
        }

        // Check brick collisions
        let newBricks = [...prev.bricks];
        let newScore = prev.score;
        let newGameStats = { ...prev.gameStats };

        newBricks.forEach(brick => {
          if (brick.active &&
              newBall.x >= brick.x &&
              newBall.x <= brick.x + brick.width &&
              newBall.y >= brick.y &&
              newBall.y <= brick.y + brick.height) {
            
            brick.hits++;
            newBall.dy = -newBall.dy;
            newScore += 10;

            if (brick.hits >= brick.maxHits) {
              brick.active = false;
              
              // Handle special brick effects
              switch (brick.type) {
                case 'anxiety':
                  newGameStats.anxietyHits++;
                  break;
                case 'support':
                  newGameStats.powerUpsCollected++;
                  break;
                case 'trigger':
                  newGameStats.triggerResponses++;
                  break;
              }
            }
          }
        });

        // Check if level is complete
        const activeBricks = newBricks.filter(brick => brick.active);
        if (activeBricks.length === 0) {
          return {
            ...prev,
            ball: newBall,
            bricks: newBricks,
            score: newScore,
            gameStats: newGameStats,
            levelComplete: true,
          };
        }

        return {
          ...prev,
          ball: newBall,
          bricks: newBricks,
          score: newScore,
          gameStats: newGameStats,
        };
      });
    };

    const interval = setInterval(gameLoop, 16); // ~60 FPS
    return () => clearInterval(interval);
  }, [gameState.gameStarted, gameState.gameOver, gameState.gamePaused, canvasSize, showFocusHelper]);

  // Handle paddle movement with improved controls
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gameState.gameStarted || gameState.gameOver || gameState.gamePaused) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const scaleX = canvas.width / rect.width;
      const scaledMouseX = mouseX * scaleX;
      
      setGameState(prev => ({
        ...prev,
        paddle: {
          ...prev.paddle,
          x: Math.max(0, Math.min(canvas.width - prev.paddle.width, scaledMouseX - prev.paddle.width / 2)),
        },
      }));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.gameStarted || gameState.gameOver || gameState.gamePaused) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const moveAmount = 25;
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setGameState(prev => ({
          ...prev,
          paddle: {
            ...prev.paddle,
            x: Math.max(0, prev.paddle.x - moveAmount)
          }
        }));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setGameState(prev => ({
          ...prev,
          paddle: {
            ...prev.paddle,
            x: Math.min(canvas.width - prev.paddle.width, prev.paddle.x + moveAmount)
          }
        }));
      } else if (e.key === ' ') {
        e.preventDefault();
        setGameState(prev => ({ ...prev, gamePaused: !prev.gamePaused }));
      }
    };

    // Add touch support for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (!gameState.gameStarted || gameState.gameOver || gameState.gamePaused) return;
      e.preventDefault();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const scaleX = canvas.width / rect.width;
      const scaledTouchX = touchX * scaleX;
      
      setGameState(prev => ({
        ...prev,
        paddle: {
          ...prev.paddle,
          x: Math.max(0, Math.min(canvas.width - prev.paddle.width, scaledTouchX - prev.paddle.width / 2)),
        },
      }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.gamePaused]);

  // Update canvas size when component mounts or window resizes
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = Math.min(container.clientHeight, window.innerHeight * 0.7);
      
      // Maintain aspect ratio (4:3)
      const aspectRatio = 4 / 3;
      let newWidth = containerWidth - 40; // Account for padding
      let newHeight = newWidth / aspectRatio;
      
      if (newHeight > containerHeight) {
        newHeight = containerHeight;
        newWidth = newHeight * aspectRatio;
      }
      
      setCanvasSize({ width: newWidth, height: newHeight });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Handle level completion
  useEffect(() => {
    if (gameState.levelComplete) {
      setShowSelfCheck(true);
    }
  }, [gameState.levelComplete]);

  // Handle self-check completion
  const handleSelfCheckComplete = () => {
    setShowSelfCheck(false);
    
    if (gameState.level >= 3) {
      // Game complete after 3 levels
      setGameComplete(true);
      const gameData = {
        rounds: [{
          level: gameState.level,
          score: gameState.score,
          lives: gameState.lives,
          gameStats: gameState.gameStats,
        }],
        selfReport: selfCheckQuestions.reduce((acc, q) => {
          acc[q.trait] = q.value;
          return acc;
        }, {} as any),
        scores: {
          inattention: 10 - selfCheckQuestions.find(q => q.trait === 'inattention')!.value * 2,
          hyperactivity: selfCheckQuestions.find(q => q.trait === 'hyperactivity')!.value * 2,
          impulsivity: selfCheckQuestions.find(q => q.trait === 'impulsivity')!.value * 2,
          executive_function: (10 - selfCheckQuestions.find(q => q.trait === 'executive_planning')!.value) + 
                            (10 - selfCheckQuestions.find(q => q.trait === 'executive_persistence')!.value),
          adhd_composite: 0, // Will be calculated
        },
      };
      
      // Calculate composite score
      gameData.scores.adhd_composite = (
        gameData.scores.inattention + 
        gameData.scores.hyperactivity + 
        gameData.scores.impulsivity + 
        gameData.scores.executive_function
      ) / 4;
      
      onGameComplete(gameData);
    } else {
      // Next level
      setGameState(prev => ({
        ...prev,
        level: prev.level + 1,
        levelComplete: false,
        bricks: generateBricks(prev.level + 1),
        ball: { x: canvasSize.width / 2, y: canvasSize.height - 80, dx: 5, dy: -5, radius: 8 },
      }));
    }
  };

  // Start game
  const startGame = () => {
    setShowInstructions(false);
    setGameState(prev => ({ ...prev, gameStarted: true }));
  };

  // Restart game
  const restartGame = () => {
    setGameState({
      ball: { x: canvasSize.width / 2, y: canvasSize.height - 80, dx: 5, dy: -5, radius: 8 },
      paddle: { x: (canvasSize.width - 120) / 2, y: canvasSize.height - 40, width: 120, height: 12 },
      bricks: generateBricks(1),
      score: 0,
      lives: 3,
      level: 1,
      gameStarted: true,
      gameOver: false,
      levelComplete: false,
      gamePaused: false,
      powerUps: {
        widePaddle: false,
        extraBall: false,
        slowBall: false,
      },
      gameStats: {
        missedHits: 0,
        anxietyHits: 0,
        powerUpsCollected: 0,
        triggerResponses: 0,
        focusBreaks: 0,
      },
    });
    setGameComplete(false);
    setShowSelfCheck(false);
  };

  // Utility function to adjust color brightness
  const adjustBrightness = (color: string, percent: number) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sage-950 to-sleek-950 p-4 calm-pattern">
      <div className="w-full max-w-6xl h-full flex flex-col">
        <div className="bg-sage-900/30 rounded-xl p-6 border border-sage-700 shadow-xl flex-1 flex flex-col">
          <motion.h2 
            className="text-3xl font-bold text-white mb-6 text-center breathe"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Bounce Back
          </motion.h2>
          
          {showInstructions && !gameComplete && (
            <motion.div 
              className="text-center mb-6 flex-1 flex flex-col justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.p 
                className="text-sage-200 mb-4 text-lg text-adhd-friendly-large"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Control the paddle to bounce the ball and break bricks. Each brick type represents different mental states and challenges.<br />
                <span className="block mt-2 text-base text-sleek-300 font-semibold">Use your mouse to move the paddle, or press A/D or arrow keys for keyboard control.</span>
              </motion.p>
              
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, staggerChildren: 0.1 }}
              >
                <motion.div 
                  className="bg-red-500/20 p-3 rounded border border-red-500 focus-helper"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-red-400 font-semibold">Anxiety Bricks</div>
                  <div className="text-red-300 text-sm">Need 2 hits to break</div>
                </motion.div>
                <motion.div 
                  className="bg-blue-500/20 p-3 rounded border border-blue-500 focus-helper"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-blue-400 font-semibold">Affirmation Bricks</div>
                  <div className="text-blue-300 text-sm">Show calming messages</div>
                </motion.div>
                <motion.div 
                  className="bg-sage-500/20 p-3 rounded border border-sage-500 focus-helper"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-sage-400 font-semibold">Mindfulness Bricks</div>
                  <div className="text-sage-300 text-sm">Slow the game briefly</div>
                </motion.div>
                <motion.div 
                  className="bg-green-500/20 p-3 rounded border border-green-500 focus-helper"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-green-400 font-semibold">Support Tiles</div>
                  <div className="text-green-300 text-sm">Provide power-ups</div>
                </motion.div>
                <motion.div 
                  className="bg-amber-500/20 p-3 rounded border border-amber-500 focus-helper"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-amber-400 font-semibold">Trigger Blocks</div>
                  <div className="text-amber-300 text-sm">Create challenges</div>
                </motion.div>
                <motion.div 
                  className="bg-cyan-500/20 p-3 rounded border border-cyan-500 focus-helper"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-cyan-400 font-semibold">Depression Walls</div>
                  <div className="text-cyan-300 text-sm">Clear nearby blocks</div>
                </motion.div>
              </motion.div>
              
              <motion.button
                onClick={startGame}
                className="px-8 py-3 bg-gradient-to-r from-sleek-600 to-emerald-600 text-white rounded-lg hover:from-sleek-700 hover:to-emerald-700 transition-all duration-300 text-lg font-semibold focus-helper"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                Start Game
              </motion.button>
            </motion.div>
          )}

          {gameState.gameStarted && !gameComplete && (
            <motion.div 
              className="flex-1 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="mb-4 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-sage-200 text-lg">
                  Score: {gameState.score} | Lives: {gameState.lives} | Level: {gameState.level}
                </div>
                <div className="text-sleek-300 text-sm mt-1">
                  Use mouse or A/D keys to move paddle | Space to pause
                </div>
              </motion.div>
              
              <motion.div 
                className="relative"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  className="border-2 border-sage-600 rounded-lg shadow-lg focus-helper"
                  style={{
                    width: `${canvasSize.width}px`,
                    height: `${canvasSize.height}px`,
                    display: 'block',
                    backgroundColor: '#1e293b',
                    cursor: 'crosshair'
                  }}
                />
                {gameState.gamePaused && (
                  <motion.div 
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-white text-2xl font-bold">PAUSED</div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {gameState.gameOver && (
            <motion.div 
              className="text-center flex-1 flex flex-col justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-red-400 mb-4">Game Over</h3>
              <p className="text-sage-200 mb-4">Final Score: {gameState.score}</p>
              <motion.button
                onClick={restartGame}
                className="px-6 py-2 bg-sage-700 text-sage-200 rounded-lg hover:bg-sage-600 transition-colors focus-helper"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </motion.div>
          )}

          <AnimatePresence>
            {showSelfCheck && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
              >
                <motion.div 
                  className="bg-sage-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <motion.h3 
                    className="text-2xl font-bold text-white mb-6 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Level {gameState.level} Complete!
                  </motion.h3>
                  <motion.p 
                    className="text-sage-200 mb-6 text-center text-adhd-friendly-large"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Please answer these questions about your experience:
                  </motion.p>
                  
                  <div className="space-y-6">
                    {selfCheckQuestions.map((question, index) => (
                      <motion.div 
                        key={question.id} 
                        className="bg-sage-800/50 p-4 rounded-lg focus-helper"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <p className="text-sage-100 mb-3 text-adhd-friendly">{question.question}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sage-300 text-sm">Never</span>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <motion.button
                                key={value}
                                onClick={() => setSelfCheckQuestions(prev => 
                                  prev.map(q => q.id === question.id ? { ...q, value } : q)
                                )}
                                className={`w-8 h-8 rounded-full border-2 transition-colors focus-helper ${
                                  question.value === value
                                    ? 'bg-sleek-600 border-sleek-400 text-white'
                                    : 'bg-sage-700 border-sage-600 text-sage-300 hover:border-sage-500'
                                }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {value}
                              </motion.button>
                            ))}
                          </div>
                          <span className="text-sage-300 text-sm">Always</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div 
                    className="flex justify-center mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.button
                      onClick={handleSelfCheckComplete}
                      className="px-6 py-2 bg-gradient-to-r from-sleek-600 to-emerald-600 text-white rounded-lg hover:from-sleek-700 hover:to-emerald-700 transition-all duration-300 focus-helper"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Continue
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showEncouragement && (
              <motion.div
                className="fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🌟
                  </motion.div>
                  <span className="font-semibold">{encouragementMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {gameComplete && (
            <motion.div 
              className="text-center flex-1 flex flex-col justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h3 
                className="text-2xl font-bold text-emerald-400 mb-4"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Game Complete!
              </motion.h3>
              <p className="text-sage-200 mb-4">Final Score: {gameState.score}</p>
              <p className="text-sage-200 mb-6 text-adhd-friendly-large">Thank you for playing Bounce Back!</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BounceBackGame; 