import React from 'react';
import { GameState, Target } from './types';
import { getRoundInstructions, getInRoundInstruction } from './utils';
import ShapeRenderer from './ShapeRenderer';

interface GameUIProps {
  gameState: GameState;
  elapsedTime: number;
  stimulusRotation: number;
  onStartGame: () => void;
  onStartRound: () => void;
  onStimulusClick: () => void;
  onScreenClick: (e: React.MouseEvent) => void;
}

const GameUI: React.FC<GameUIProps> = ({
  gameState,
  elapsedTime,
  stimulusRotation,
  onStartGame,
  onStartRound,
  onStimulusClick,
  onScreenClick
}) => {
  // Show initial instructions
  if (gameState.showInstructions) {
    return (
      <div className="flex items-center justify-center" style={{ width: '960px', height: '540px', background: 'linear-gradient(to bottom right, #f5f3ff, #e0e7ff)' }}>
        <div className="rounded-2xl border border-gray-200 shadow-2xl bg-white flex flex-col items-center justify-center" style={{ width: '820px', minHeight: '440px', padding: '40px 32px 24px 32px' }}>
          {/* Instructions Box */}
          <div className="w-full flex flex-col items-center">
            <h2 className="font-extrabold text-2xl text-purple-700 mb-6 tracking-wide text-center">How to Play</h2>
            <ul className="text-gray-800 space-y-4 text-lg w-full max-w-2xl mx-auto list-none px-0">
              <li className="flex items-start gap-3"><span className="mt-1">🎯</span><span>Watch for the <b>target shape and pattern</b> shown on the left</span></li>
              <li className="flex items-start gap-3"><span className="mt-1">➡️</span><span>When a stimulus appears on the right, decide if it matches the target</span></li>
              <li className="flex items-start gap-3"><span className="mt-1">1️⃣</span><span><b>Round 1:</b> Click if <b>shape OR pattern</b> matches</span></li>
              <li className="flex items-start gap-3"><span className="mt-1">2️⃣</span><span><b>Round 2:</b> Click if <b>BOTH shape AND pattern</b> match</span></li>
              <li className="flex items-start gap-3"><span className="mt-1">3️⃣</span><span><b>Round 3:</b> Click if <b>BOTH match</b> (shapes may be rotated)</span></li>
              <li className="flex items-start gap-3"><span className="mt-1">✨</span><span>Some trials may have <b>distractions</b> (visual effects) – stay focused!</span></li>
              <li className="flex items-start gap-3"><span className="mt-1">🏁</span><span>Complete all <b>3 rounds</b> to finish the assessment</span></li>
            </ul>
          </div>
          {/* Start Button */}
          <div className="w-full flex justify-center items-center mt-10">
            <button
              onClick={onStartGame}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl px-12 py-4 rounded-full font-bold shadow hover:from-purple-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show round start screen
  if (gameState.showRoundStart) {
    return (
      <div className="flex items-center justify-center" style={{ width: '960px', height: '540px', background: '#fff', borderRadius: '1.25rem', boxShadow: '0 8px 32px rgba(60,60,120,0.10)' }}>
        <div className="flex flex-col items-center justify-center w-full h-full">
          <h1 className="text-5xl font-extrabold text-purple-700 mb-4 tracking-wide">
            Starting Round {gameState.currentRound}
          </h1>
          <p className="text-xl text-gray-600">Get ready...</p>
        </div>
      </div>
    );
  }

  // Show round instructions
  if (!gameState.isPlaying && !gameState.gameComplete) {
    const instructions = getRoundInstructions(gameState.currentRound);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="rounded-2xl border border-gray-200 shadow-2xl bg-white flex flex-col justify-between" style={{ width: '960px', height: '540px' }}>
          <div className="flex flex-col items-center justify-center h-full px-8">
            <h1 className="text-3xl font-extrabold text-purple-700 mb-6 tracking-wide">
              {instructions.title}
            </h1>
            <div className="text-lg text-gray-700 space-y-4 max-w-2xl text-center">
              <p className="font-semibold">
                {instructions.text}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h3 className="font-bold text-blue-800 mb-2">Example:</h3>
                <p className="text-blue-700 text-sm">{instructions.example}</p>
              </div>
            </div>
          </div>
          {/* Start Round Button */}
          <div className="w-full flex justify-center items-center pb-4 pt-2">
            <button
              onClick={onStartRound}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg px-10 py-3 rounded-full font-bold shadow hover:from-purple-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Start Round
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show game complete screen
  if (gameState.gameComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="rounded-2xl border border-gray-200 shadow-2xl bg-white flex flex-col justify-center items-center" style={{ width: '960px', height: '540px' }}>
          <h1 className="text-4xl font-extrabold text-purple-700 mb-4 tracking-wide">
            Game Complete!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Thank you for completing the Pattern Match assessment.
          </p>
          <div className="text-center text-gray-700">
            <p>Your results have been recorded.</p>
            <p>You can view your detailed results in the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show main game interface
  return (
    <div className="flex items-center justify-center" style={{ width: '960px', height: '540px', background: '#fff', borderRadius: '1.25rem', boxShadow: '0 8px 32px rgba(60,60,120,0.10)' }}>
      <div className="rounded-2xl border border-gray-200 shadow-2xl bg-white flex flex-col justify-between game-area" style={{ width: '960px', height: '540px', overflow: 'hidden', background: '#fff' }}>
        {/* Simple Centered Header */}
        <div className="w-full flex justify-between items-center pt-4 pb-2">
          <div style={{ width: 80 }} /> {/* Spacer for left */}
          <div className="flex gap-8 text-lg font-semibold">
            <span className="text-gray-700">Round: <span className="text-purple-600 font-bold">{gameState.currentRound}/3</span></span>
            <span className="text-gray-700">Trial: <span className="text-blue-600 font-bold">{gameState.currentTrial}/30</span></span>
          </div>
          <div className="text-right pr-4 min-w-[80px]">
            <span className="text-gray-500 text-base">Timer:</span>
            <span className="ml-2 text-xl font-mono text-gray-800">{elapsedTime.toFixed(1)}s</span>
          </div>
        </div>
        {/* Main Content Row */}
        <div className="flex flex-1 flex-row items-center justify-between px-8 py-4 gap-6">
          {/* Left: Current Target (40%) */}
          <div className="flex flex-col items-center justify-center" style={{ flexBasis: '40%', maxWidth: '40%' }}>
            <h3 className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-2">🎯 Current Target</h3>
            <div className="mb-2">
              <ShapeRenderer 
                shape={gameState.currentTarget.shape} 
                pattern={gameState.currentTarget.pattern} 
                size="w-24 h-24" 
              />
            </div>
            <p className="text-center text-gray-800 text-lg font-semibold">
              {gameState.currentTarget.shape.charAt(0).toUpperCase() + gameState.currentTarget.shape.slice(1)}
            </p>
            <p className="text-center text-blue-500 text-base font-medium">
              {gameState.currentTarget.pattern.charAt(0).toUpperCase() + gameState.currentTarget.pattern.slice(1)}
            </p>
          </div>
          {/* Right: Current Stimulus (60%) */}
          <div className="flex flex-col items-center justify-center" style={{ flexBasis: '60%', maxWidth: '60%' }}>
            <h3 className="text-xl font-bold text-gray-700 mb-2 flex items-center gap-2">👁️ Current Stimulus</h3>
            <div className={`flex justify-center items-center mb-4 transition-all duration-300 ${gameState.showStimulus ? 'animate-pulse' : ''}`} style={{ minHeight: '200px' }}>
              {gameState.showStimulus && gameState.currentStimulus ? (
                <button
                  onClick={onStimulusClick}
                  className="cursor-pointer hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  title="Click if this matches the target"
                >
                  <ShapeRenderer 
                    shape={gameState.currentStimulus.shape} 
                    pattern={gameState.currentStimulus.pattern} 
                    size="w-40 h-40"
                    rotation={stimulusRotation}
                  />
                </button>
              ) : (
                <div className="w-40 h-40 border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 rounded-xl text-2xl text-gray-400 font-semibold">
                  Waiting...
                </div>
              )}
            </div>
            {gameState.currentStimulus && (
              <p className="text-xl text-gray-700 font-bold mb-2 tracking-wide">
                {gameState.currentStimulus.shape.charAt(0).toUpperCase() + gameState.currentStimulus.shape.slice(1)} + {gameState.currentStimulus.pattern.charAt(0).toUpperCase() + gameState.currentStimulus.pattern.slice(1)}
              </p>
            )}
          </div>
        </div>
        {/* Add the instruction tile just above the progress bar */}
        <div className="w-full flex justify-center items-center pb-2">
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-0 py-3 shadow text-center w-full">
            <span className="text-base text-gray-700 font-medium">
              {getInRoundInstruction(gameState.currentRound)}
            </span>
          </div>
        </div>
        {/* Progress Bar (bottom) */}
        <div className="px-8 pb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Round Progress</span>
            <span>{gameState.currentTrial}/30</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(gameState.currentTrial / 30) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI; 