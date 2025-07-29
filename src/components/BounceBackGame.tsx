import React, { useRef, useEffect, useState } from 'react';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 320;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const PADDLE_Y_OFFSET = 30;
const PADDLE_COLOR = '#34d399'; // emerald-400
const BG_COLOR = '#e0e9e0'; // forest-100

const BounceBackGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paddleX, setPaddleX] = useState((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
  const [rightPressed, setRightPressed] = useState(false);
  const [leftPressed, setLeftPressed] = useState(false);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') setRightPressed(true);
      if (e.key === 'Left' || e.key === 'ArrowLeft') setLeftPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') setRightPressed(false);
      if (e.key === 'Left' || e.key === 'ArrowLeft') setLeftPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Paddle movement
  useEffect(() => {
    let animationFrameId: number;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // Clear
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      // Draw paddle
      ctx.fillStyle = PADDLE_COLOR;
      ctx.fillRect(paddleX, CANVAS_HEIGHT - PADDLE_Y_OFFSET, PADDLE_WIDTH, PADDLE_HEIGHT);
    };
    // Move paddle
    setPaddleX(prev => {
      let next = prev;
      if (rightPressed) next = Math.min(prev + 6, CANVAS_WIDTH - PADDLE_WIDTH);
      if (leftPressed) next = Math.max(prev - 6, 0);
      return next;
    });
    draw();
    animationFrameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameId);
  }, [paddleX, rightPressed, leftPressed]);

  // Responsive canvas
  const style = {
    width: '100%',
    maxWidth: CANVAS_WIDTH,
    height: 'auto',
    borderRadius: 12,
    boxShadow: '0 2px 16px #a7f3d0',
    background: BG_COLOR,
    display: 'block',
    margin: '0 auto',
  } as React.CSSProperties;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={style}
        tabIndex={0}
      />
      <div className="mt-4 text-emerald-700 font-semibold">Use Left/Right Arrow Keys to Move the Paddle</div>
    </div>
  );
};

export default BounceBackGame; 