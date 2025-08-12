import React, { RefObject } from 'react';

interface GameCanvasProps {
  width: string;
  height: string;
  score: number;
  lives: number;
  onJump: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  width,
  height,
  score,
  lives,
  onJump,
  canvasRef
}) => {
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        onClick={onJump}
        className="cursor-pointer border border-gray-600"
        style={{ width, height }}
      />
      
      {/* Game overlay */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
        <div className="text-center space-y-2">
          <div>
            <div className="text-2xl font-bold text-green-400">{score}</div>
            <div className="text-sm">Score</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-400">{lives}</div>
            <div className="text-sm">Lives</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
