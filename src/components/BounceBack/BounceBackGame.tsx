import React, { useRef, useEffect, useCallback, useState } from 'react';
import { BounceBackGameProps } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import { QUESTIONS } from './constants';
import LevelTransition from './LevelTransition';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PADDLE_WIDTH, 
  PADDLE_HEIGHT, 
  PADDLE_Y_OFFSET, 
  BALL_RADIUS,
  BRICK_WIDTH,
  BRICK_HEIGHT,
  PADDLE_COLOR,
  BG_COLOR,
  BALL_COLOR
} from './constants';

// Particle Background Component
const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.floor(window.innerWidth / 20);
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: `rgba(78, 202, 120, ${Math.random() * 0.5 + 0.1})`,
        });
      }
    };
    createParticles();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          const force = (100 - distance) / 1500;
          particle.speedX -= Math.cos(angle) * force;
          particle.speedY -= Math.sin(angle) * force;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
};

// Countdown Component
const Countdown: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [count, setCount] = useState(3);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (count === 0) {
      onCompleteRef.current();
      return;
    }
    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [count]);

  if (count === 0) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div className="text-9xl font-bold text-[#4eca78]">
        {count}
      </div>
    </div>
  );
};

// Start Screen Component
const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [showCountdown, setShowCountdown] = useState(false);

  const handleStartClick = () => {
    setShowCountdown(true);
  };

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    onStart();
  }, [onStart]);

  return (
    <div className="absolute inset-0 bg-[#2a2e29]/80 backdrop-blur-sm flex flex-col items-center justify-center z-40">
      <ParticleBackground />
      {showCountdown ? (
        <Countdown onComplete={handleCountdownComplete} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl font-bold text-[#4eca78] mb-8">
            Bounce Back
          </h1>
          <button
            onClick={handleStartClick}
            className="bg-[#4eca78] text-[#2a2e29] px-8 py-4 rounded-lg text-xl font-bold shadow-lg hover:bg-[#3da965] transition-colors animate-pulse mb-8"
            style={{
              animation: 'pulse 2s infinite',
            }}
          >
            START GAME
          </button>
          <p className="text-[#4eca78]/80 mb-6 max-w-2xl text-center text-sm">
            Break all the bricks to complete each level. New features include tough bricks, power-ups, and visual effects!
          </p>
          
          {/* Game Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-8">
            {/* How to Play */}
            <div className="bg-[#2a2e29]/50 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-[#4eca78] text-xl mb-4 text-center">How to Play</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start">
                  <div className="bg-[#4eca78] text-[#2a2e29] px-3 py-1 rounded mr-3 font-bold text-sm min-w-[80px] text-center">
                    SPACEBAR
                  </div>
                  <span className="text-[#4eca78] text-sm">
                    Launch the ball
                  </span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <div className="bg-[#4eca78] text-[#2a2e29] px-3 py-1 rounded mr-3 font-bold text-sm min-w-[80px] text-center">
                    ← →
                  </div>
                  <span className="text-[#4eca78] text-sm">Move the paddle</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <div className="bg-[#4eca78] text-[#2a2e29] px-3 py-1 rounded mr-3 font-bold text-sm min-w-[80px] text-center">
                    BREAK
                  </div>
                  <span className="text-[#4eca78] text-sm">Destroy all bricks</span>
                </div>
              </div>
            </div>
            
            {/* Game Structure */}
            <div className="bg-[#2a2e29]/50 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-[#4eca78] text-xl mb-4 text-center">Game Structure</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start">
                  <div className="bg-[#4eca78] text-[#2a2e29] px-3 py-1 rounded mr-3 font-bold text-sm min-w-[80px] text-center">
                    3 LEVELS
                  </div>
                  <span className="text-[#4eca78] text-sm">Complete all levels</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <div className="bg-[#4eca78] text-[#2a2e29] px-3 py-1 rounded mr-3 font-bold text-sm min-w-[80px] text-center">
                    QUESTIONS
                  </div>
                  <span className="text-[#4eca78] text-sm">5 questions after completion</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <div className="bg-[#4eca78] text-[#2a2e29] px-3 py-1 rounded mr-3 font-bold text-sm min-w-[80px] text-center">
                    3 LIVES
                  </div>
                  <span className="text-[#4eca78] text-sm">Don't let the ball fall!</span>
                </div>
              </div>
            </div>
          </div>


        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(78, 202, 120, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(78, 202, 120, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(78, 202, 120, 0);
          }
        }
      `}</style>
    </div>
  );
};

// Water Animation Component
const WaterAnimation: React.FC<{ paddleX: number; paddleWidth: number; ballY: number; ballX: number }> = ({ paddleX, paddleWidth, ballY, ballX }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      timeRef.current += 0.05;
      const time = timeRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Water surface position (just above paddle)
      const waterY = CANVAS_HEIGHT - PADDLE_Y_OFFSET + PADDLE_HEIGHT + 5;

      // Draw water background
      const gradient = ctx.createLinearGradient(0, waterY, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)'); // emerald-500 with transparency
      gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.1)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, waterY, CANVAS_WIDTH, CANVAS_HEIGHT - waterY);

      // Draw animated water surface
      ctx.beginPath();
      ctx.moveTo(0, waterY);
      
      // Create wave effect
      for (let x = 0; x <= CANVAS_WIDTH; x += 2) {
        const wave1 = Math.sin(x * 0.02 + time) * 3;
        const wave2 = Math.sin(x * 0.01 + time * 0.7) * 2;
        const wave3 = Math.sin(x * 0.03 + time * 1.3) * 1.5;
        const combinedWave = wave1 + wave2 + wave3;
        
        ctx.lineTo(x, waterY + combinedWave);
      }
      
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.lineTo(0, CANVAS_HEIGHT);
      ctx.closePath();
      
      // Fill water with gradient
      const waterGradient = ctx.createLinearGradient(0, waterY, 0, CANVAS_HEIGHT);
      waterGradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
      waterGradient.addColorStop(0.3, 'rgba(34, 197, 94, 0.2)');
      waterGradient.addColorStop(0.7, 'rgba(34, 197, 94, 0.1)');
      waterGradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
      
      ctx.fillStyle = waterGradient;
      ctx.fill();

      // Draw ripples around paddle
      const paddleCenterX = paddleX + paddleWidth / 2;
      const rippleRadius = 20 + Math.sin(time * 2) * 5;
      
      ctx.beginPath();
      ctx.arc(paddleCenterX, waterY + 10, rippleRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw second ripple
      const ripple2Radius = 15 + Math.sin(time * 2.5) * 3;
      ctx.beginPath();
      ctx.arc(paddleCenterX, waterY + 10, ripple2Radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw paddle shadow/reflection in water
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.fillRect(paddleX, waterY + 5, paddleWidth, 8);
      
      // Draw paddle edge reflections
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(paddleX, waterY + 5);
      ctx.lineTo(paddleX + paddleWidth, waterY + 5);
      ctx.stroke();

      // Draw water droplets/splashes
      for (let i = 0; i < 5; i++) {
        const dropX = paddleCenterX + (Math.sin(time * 3 + i) * 30);
        const dropY = waterY + 5 + Math.sin(time * 4 + i) * 3;
        const dropSize = 2 + Math.sin(time * 5 + i) * 1;
        
        ctx.beginPath();
        ctx.arc(dropX, dropY, dropSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.fill();
      }

      // Draw ball splash effect when ball is near water
      if (ballY > waterY - 20) {
        const splashIntensity = Math.max(0, (waterY - ballY) / 20);
        const splashRadius = 15 + splashIntensity * 10;
        
        ctx.beginPath();
        ctx.arc(ballX, waterY + 5, splashRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 197, 94, ${0.4 * splashIntensity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw splash droplets
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const dropX = ballX + Math.cos(angle) * (splashRadius + 5);
          const dropY = waterY + 5 + Math.sin(angle) * (splashRadius + 5);
          const dropSize = 1 + splashIntensity * 2;
          
          ctx.beginPath();
          ctx.arc(dropX, dropY, dropSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34, 197, 94, ${0.8 * splashIntensity})`;
          ctx.fill();
        }
      }

      // Draw water surface reflection
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= CANVAS_WIDTH; x += 20) {
        const reflectionY = waterY + Math.sin(x * 0.01 + time * 0.5) * 2;
        if (x === 0) {
          ctx.moveTo(x, reflectionY);
        } else {
          ctx.lineTo(x, reflectionY);
        }
      }
      ctx.stroke();

      // Draw depth lines for water effect
      for (let i = 1; i <= 3; i++) {
        const depthY = waterY + (i * 15);
        ctx.strokeStyle = `rgba(34, 197, 94, ${0.1 - i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
          const depthWave = Math.sin(x * 0.005 + time * 0.3) * 1;
          if (x === 0) {
            ctx.moveTo(x, depthY + depthWave);
          } else {
            ctx.lineTo(x, depthY + depthWave);
          }
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [paddleX, paddleWidth]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};

const BounceBackGame: React.FC<BounceBackGameProps> = ({ userId, onGameComplete, onCancel, onError, width = "960px", height = "540px" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [particles, setParticles] = useState<Array<{x: number, y: number, vx: number, vy: number, life: number, color: string}>>([]);
  
  const {
    // Game state
    paddleX,
    ball,
    bricks,
    score,
    lives,
    gameStarted,
    setGameStarted,
    gameOver,
    gameWon,
    currentLevel,
    currentLevelData,
    
    // Power-ups state
    activePowerUps,
    
    // Question modal state
    showQuestions,
    setShowQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    questionResponses,
    setQuestionResponses,
    questionsCompleted,
    setQuestionsCompleted,
    allLevelsCompleted,
    
    // Transition state
    showLevelTransition,
    transitionData,
    handleTransitionContinue,
    
    // Game data
    gameData,
    setGameData,
    
    // Actions
    resetGame,
    getPaddleWidth,
    saveGameDataToFirebase,
  } = useGameLogic({ userId, onGameComplete, onError });

  // Handle question responses
  const handleQuestionResponse = useCallback((response: number) => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    setQuestionResponses(prev => {
      const newResponses = {
        ...prev,
        [currentQuestion.id]: response
      };
      return newResponses;
    });

    // Don't automatically advance to next question
    // User must click "Next" button to proceed
  }, [currentQuestionIndex, setQuestionResponses]);

  // Handle questions completion
  const handleQuestionsComplete = useCallback(async () => {
    
    if (allLevelsCompleted) {
      // All levels completed - finish the game
      const finalGameData = {
        ...gameData,
        selfReportResponses: { ...gameData.selfReportResponses, ...questionResponses },
        endTime: Date.now(),
        finalScore: score + (lives * 50),
        gameCompleted: true
      };
      
      // Save to Firebase
      try {
        await saveGameDataToFirebase(finalGameData);
        console.log('[BounceBack] Game data saved to Firebase successfully');
      } catch (error) {
        console.error('[BounceBack] Failed to save game data to Firebase:', error);
        if (onError) {
          onError(`Failed to save game data: ${error}`);
        }
      }
      
      // Close questions modal
      setShowQuestions(false);
      setCurrentQuestionIndex(0);
      setQuestionResponses({});
      setQuestionsCompleted(false);
      
      // Call the completion callback
      if (onGameComplete) {
        setGameCompleted(true); // Hide the game component
        onGameComplete(finalGameData);
      } else {
        // Fallback: force completion by hiding the component
        setGameCompleted(true);
      }
    } else {
      // Continue to next level (this shouldn't happen since questions only show after all levels)
      setShowQuestions(false);
      setCurrentQuestionIndex(0);
      setQuestionResponses({});
      setQuestionsCompleted(false);
    }
  }, [allLevelsCompleted, gameData, questionResponses, score, lives, onGameComplete, onError, saveGameDataToFirebase, setShowQuestions, setCurrentQuestionIndex, setQuestionResponses, setQuestionsCompleted]);

  // Get current paddle width
  const currentPaddleWidth = getPaddleWidth(currentLevel);
  
  // Create particles when brick is destroyed
  const createBrickParticles = useCallback((x: number, y: number, color: string) => {
    const newParticles: Array<{x: number, y: number, vx: number, vy: number, life: number, color: string}> = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        x: x + Math.random() * 80,
        y: y + Math.random() * 25,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 60,
        color: color
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Render game on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bricks with advanced features
    bricks.forEach(brick => {
      if (brick.status === 1) {
        // Determine brick color based on type and health
        let fillColor = brick.color;
        let strokeColor = '#047857';
        
        if (brick.brickType === 'indestructible') {
          fillColor = '#dc2626'; // Red for boss bricks
          strokeColor = '#b91c1c';
        } else if (brick.brickType === 'tough') {
          fillColor = '#f59e0b'; // Orange for tough bricks
          strokeColor = '#d97706';
        } else if (brick.brickType === 'powerup') {
          fillColor = '#8b5cf6'; // Purple for power-up bricks
          strokeColor = '#7c3aed';
        }
        
        // Draw brick with health-based opacity
        const healthRatio = brick.health / brick.maxHealth;
        ctx.globalAlpha = 0.7 + (healthRatio * 0.3); // 0.7 to 1.0 opacity
        ctx.fillStyle = fillColor;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        
        // Draw border
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        
        // Draw cracks based on crack level
        if (brick.crackLevel > 0) {
          ctx.strokeStyle = '#dc2626'; // Red cracks
          ctx.lineWidth = 1;
          
          // Draw diagonal cracks
          const crackCount = brick.crackLevel;
          for (let i = 0; i < crackCount; i++) {
            const startX = brick.x + (brick.width * 0.2) + (i * brick.width * 0.3);
            const startY = brick.y + (brick.height * 0.2);
            const endX = brick.x + (brick.width * 0.8) - (i * brick.width * 0.2);
            const endY = brick.y + (brick.height * 0.8);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }
        }
        
        // Draw health indicator for multi-hit bricks
        if (brick.maxHealth > 1) {
          const healthBarWidth = brick.width * 0.8;
          const healthBarHeight = 3;
          const healthBarX = brick.x + (brick.width - healthBarWidth) / 2;
          const healthBarY = brick.y + brick.height - 5;
          
          // Background
          ctx.fillStyle = '#374151';
          ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
          
          // Health bar
          const currentHealthWidth = (brick.health / brick.maxHealth) * healthBarWidth;
          ctx.fillStyle = brick.health > brick.maxHealth / 2 ? '#10b981' : '#f59e0b';
          ctx.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);
        }
        
        // Draw power-up indicator
        if (brick.brickType === 'powerup' && brick.powerUpType) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('⚡', brick.x + brick.width / 2, brick.y + brick.height / 2 + 4);
        }
        
        // Draw boss brick indicator
        if (brick.brickType === 'indestructible') {
          ctx.fillStyle = '#ffffff';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('👑', brick.x + brick.width / 2, brick.y + brick.height / 2 + 4);
        }
        
        ctx.globalAlpha = 1.0; // Reset opacity
      }
    });

    // Draw paddle with dynamic width
    ctx.fillStyle = PADDLE_COLOR;
    ctx.fillRect(paddleX, CANVAS_HEIGHT - PADDLE_Y_OFFSET, currentPaddleWidth, PADDLE_HEIGHT);

    // Draw ball with trail effect
    const trailLength = 3;
    for (let i = 0; i < trailLength; i++) {
      const alpha = 0.3 - (i * 0.1);
      const size = BALL_RADIUS - (i * 2);
      if (size > 0) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = BALL_COLOR;
        ctx.beginPath();
        ctx.arc(ball.x - (ball.dx * i * 0.5), ball.y - (ball.dy * i * 0.5), size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;
    
    // Draw main ball
    ctx.fillStyle = BALL_COLOR;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Add subtle shadow/border to make ball more visible
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw particles
    particles.forEach(particle => {
      ctx.globalAlpha = particle.life / 60;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  }, [paddleX, ball, bricks, currentLevelData.name, currentPaddleWidth, particles]);
  
  // Particle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 1
        })).filter(particle => particle.life > 0)
      );
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, []);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  // Hide the game component if it's completed
  if (gameCompleted) {
    return null;
  }

  return (
    <div className="flex w-full justify-center items-start bg-[#2a2e29] p-4 pt-2">
      <div className="w-full max-w-6xl relative">
        <div className="bg-[#2a2e29] rounded-lg shadow-lg overflow-hidden">


          {/* Game Status */}
          <div className="text-center mb-4">
            <div className="text-[#4eca78] text-lg">
              Score: {score} | Lives: {Math.max(0, lives)} | Level: {currentLevel}/3
            </div>
            <p className="text-[#4eca78]/80 text-sm mt-2">
              {currentLevelData.description}
            </p>
            
            {/* Power-up indicators */}
            {Object.keys(activePowerUps).length > 0 && (
              <div className="flex justify-center gap-4 mt-2">
                {Object.entries(activePowerUps).map(([type, powerUp]) => {
                  const timeLeft = Math.max(0, Math.ceil(((powerUp as any).endTime - Date.now()) / 1000));
                  const icon = type === 'wider_paddle' ? '🛡️' : '🐌';
                  
                  return (
                    <div key={type} className="bg-[#4eca78]/20 px-3 py-1 rounded-full text-[#4eca78] text-sm flex items-center gap-1">
                      <span>{icon}</span>
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                      <span>({timeLeft}s)</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Game Board */}
          <div className="mx-auto w-full flex items-center justify-center mb-2 relative">
            <div className="bg-[#e8f0e9] rounded-lg p-4 shadow-md relative" style={{
              width: width,
              height: height,
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 250px)',
              display: 'block',
              margin: '0 auto'
            }}>
              
              {/* Game Canvas */}
              <div className="relative" style={{ width: '100%', height: 'calc(100% - 60px)' }}>
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 12,
                    boxShadow: '0 2px 16px #a7f3d0',
                    background: BG_COLOR,
                    display: 'block',
                    margin: '0 auto',
                    outline: 'none',
                    border: 'none',
                  }}
                  tabIndex={-1}
                />
                
                {/* Water Animation Overlay */}
                <WaterAnimation paddleX={paddleX} paddleWidth={currentPaddleWidth} ballY={ball.y} ballX={ball.x} />
              </div>
              
              {/* Start Screen Overlay */}
              {showInstructions && <StartScreen onStart={() => {
                setShowInstructions(false);
                setGameStarted(true);
                setGameData(prev => ({ ...prev, startTime: Date.now() }));
              }} />}
            </div>
          </div>


        </div>
      </div>

      {/* Questions Modal */}
      {showQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-emerald-700 mb-2">
                {allLevelsCompleted ? 'Final Assessment Questions' : `Level ${currentLevel} Complete!`}
              </h3>
              <p className="text-gray-600 text-sm">
                Question {currentQuestionIndex + 1} of {QUESTIONS.length}
              </p>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-800 font-medium mb-4">
                {currentQuestion.text}
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}-${currentQuestionIndex}`}
                    value="1"
                    checked={questionResponses[currentQuestion.id] === 1}
                    onChange={() => handleQuestionResponse(1)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">1 - Not at all</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}-${currentQuestionIndex}`}
                    value="2"
                    checked={questionResponses[currentQuestion.id] === 2}
                    onChange={() => handleQuestionResponse(2)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">2 - Slightly</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}-${currentQuestionIndex}`}
                    value="3"
                    checked={questionResponses[currentQuestion.id] === 3}
                    onChange={() => handleQuestionResponse(3)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">3 - Moderately</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}-${currentQuestionIndex}`}
                    value="4"
                    checked={questionResponses[currentQuestion.id] === 4}
                    onChange={() => handleQuestionResponse(4)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">4 - Very</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}-${currentQuestionIndex}`}
                    value="5"
                    checked={questionResponses[currentQuestion.id] === 5}
                    onChange={() => handleQuestionResponse(5)}
                    className="text-emerald-600"
                  />
                  <span className="text-gray-700">5 - Extremely</span>
                </label>
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                Previous
              </button>
              
              <button
                onClick={() => {
                  const nextIndex = currentQuestionIndex + 1;
                  if (nextIndex >= QUESTIONS.length) {
                    // Reached the last question, complete the assessment directly
                    handleQuestionsComplete();
                  } else {
                    // Go to next question
                    setCurrentQuestionIndex(nextIndex);
                  }
                }}
                disabled={(() => {
                  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
                  const isAnswered = questionResponses[currentQuestion.id];
                  const shouldBeDisabled = isLastQuestion && !isAnswered;
                  return shouldBeDisabled;
                })()}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  (currentQuestionIndex === QUESTIONS.length - 1 && !questionResponses[currentQuestion.id])
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {currentQuestionIndex === QUESTIONS.length - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
            
            {questionsCompleted && (
              <div className="text-center">
                <p className="text-emerald-600 font-medium mb-4">
                  Thank you for your responses!
                </p>
                <button
                  onClick={handleQuestionsComplete}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  {allLevelsCompleted ? 'Complete Assessment' : 'Continue to Next Level'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Level Transition Screen */}
      {showLevelTransition && transitionData && (
        <LevelTransition
          type={transitionData.type}
          level={transitionData.level}
          score={transitionData.score}
          time={transitionData.time}
          bricksDestroyed={transitionData.bricksDestroyed}
          totalBricks={transitionData.totalBricks}
          livesLost={transitionData.livesLost}
          onContinue={handleTransitionContinue}
        />
      )}



      {/* Game Over/Win Messages */}
      {gameWon && !showQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <h3 className="text-xl font-bold text-emerald-600 mb-4">Congratulations!</h3>
            <p className="text-gray-700 mb-4">You completed all levels! Final Score: {score + (lives * 50)}</p>
            <button
              onClick={resetGame}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BounceBackGame; 