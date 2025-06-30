import React from 'react';
import { GameState, Target, RoundMetrics } from './types';
import { getRoundInstructions, getInRoundInstruction } from './utils';
import ShapeRenderer from './ShapeRenderer';

interface GameUIProps {
  gameState: GameState;
  elapsedTime: number;
  stimulusRotation: number;
  roundMetrics?: RoundMetrics[];
  onStartGame: () => void;
  onStartRound: () => void;
  onStimulusClick: () => void;
  onScreenClick: (e: React.MouseEvent) => void;
  onShowQuestions: () => void;
  onQuestionAnswer: (questionIndex: number, answer: number) => void;
  onQuestionNav: (newIndex: number) => void;
  showSelfReport?: boolean;
  selfReportSubmitted?: boolean;
  onSelfReportSubmit?: (answers: number[]) => void;
}

const selfReportQuestions = [
  "How often do you find it difficult to focus on tasks that require sustained mental effort?",
  "How often do you make careless mistakes in work or school tasks due to inattention?",
  "How often do you feel the urge to act quickly without thinking through the consequences?",
  "How often do you find it difficult to stick to rules or instructions when they change?",
  "How often do you feel like you're constantly shifting between thoughts or actions?"
];
const selfReportLabels = [
  "Never",
  "Rarely",
  "Sometimes",
  "Often",
  "Very Often"
];

const GameUI: React.FC<GameUIProps> = ({
  gameState,
  elapsedTime,
  stimulusRotation,
  roundMetrics = [],
  onStartGame,
  onStartRound,
  onStimulusClick,
  onScreenClick,
  onShowQuestions,
  onQuestionAnswer,
  onQuestionNav,
  showSelfReport = false,
  selfReportSubmitted = false,
  onSelfReportSubmit
}) => {
  // Self-report state (must be top-level for hooks order)
  const [answers, setAnswers] = React.useState<number[]>([0, 0, 0, 0, 0]);
  const [submitted, setSubmitted] = React.useState(false);

  // --- Add localAnswer state for question slider ---
  const currentQuestionIndex = gameState.currentQuestionIndex;
  const currentAnswer = gameState.questionAnswers[currentQuestionIndex];
  const [localAnswer, setLocalAnswer] = React.useState<number>(currentAnswer || 3);
  React.useEffect(() => {
    setLocalAnswer(currentAnswer || 3);
  }, [currentQuestionIndex, currentAnswer]);

  // Show initial instructions
  if (gameState.showInstructions) {
    return (
      <div className="flex items-center justify-center" style={{ width: '960px', height: '540px', background: 'linear-gradient(to bottom right, #f5f3ff, #e0e7ff)' }}>
        <div className="rounded-2xl border border-gray-200 shadow-2xl bg-white flex flex-col items-center justify-center" style={{ width: '860px', maxHeight: '440px', padding: '32px 32px 32px 32px' }}>
          {/* Instructions Box */}
          <div className="w-full flex flex-col items-center">
            <h2 className="font-extrabold text-3xl md:text-4xl text-purple-700 mb-8 tracking-wide text-center">How to Play</h2>
            <ul className="text-gray-800 space-y-4 text-lg w-full max-w-2xl mx-auto list-disc list-inside px-0">
              <li>Watch for the <b>target shape and pattern</b> shown on the left</li>
              <li>When a stimulus appears on the right, decide if it matches the target</li>
              <li><b>Round 1:</b> Click if <b>shape OR pattern</b> matches</li>
              <li><b>Round 2:</b> Click if <b>BOTH shape AND pattern</b> match</li>
              <li><b>Round 3:</b> Click if <b>BOTH match</b> (shapes may be rotated)</li>
              <li>Some trials may have <b>distractions</b> (visual effects) – stay focused!</li>
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
    const instructions = getRoundInstructions(gameState.currentRound);
    return (
      <div className="flex items-center justify-center" style={{ width: '960px', height: '540px', background: '#fff', borderRadius: '1.25rem', boxShadow: '0 8px 32px rgba(60,60,120,0.10)' }}>
        <div className="flex flex-col items-center justify-center w-full h-full px-8">
          <h1 className="text-4xl font-extrabold text-purple-700 mb-6 tracking-wide">
            Round {gameState.currentRound}
          </h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{instructions.title}</h2>
          <p className="text-lg text-gray-700 mb-4 text-center max-w-2xl">{instructions.text}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-8 max-w-xl w-full">
            <h3 className="font-bold text-blue-800 mb-2">Example:</h3>
            <p className="text-blue-700 text-base">{instructions.example}</p>
          </div>
          <button
            onClick={onStartRound}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl px-12 py-4 rounded-full font-bold shadow hover:from-purple-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Start Round
          </button>
        </div>
      </div>
    );
  }

  // Show scores screen after 3rd round
  if (gameState.showScores) {
    return (
      <div className="flex items-center justify-center" style={{ width: '960px', height: '540px', background: 'linear-gradient(to bottom right, #f5f3ff, #e0e7ff)' }}>
        <div className="rounded-2xl border border-gray-200 shadow-2xl bg-white flex flex-col items-center justify-center p-8" style={{ width: '900px', maxHeight: '500px' }}>
          <h1 className="text-4xl font-extrabold text-purple-700 mb-8 tracking-wide text-center">Game Complete!</h1>
          
          {/* Scores Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8 w-full">
            {roundMetrics.map((metrics, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 text-center">
                <h3 className="text-2xl font-bold text-purple-700 mb-4">Round {index + 1}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accuracy:</span>
                    <span className="font-semibold text-blue-600">
                      {metrics.totalTrials > 0 ? Math.round((metrics.correctTrials / metrics.totalTrials) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Correct Hits:</span>
                    <span className="font-semibold text-green-600">{metrics.correctTrials}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">False Alarms:</span>
                    <span className="font-semibold text-red-600">{metrics.falsePositives}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Missed Targets:</span>
                    <span className="font-semibold text-orange-600">{metrics.missedTargets}</span>
                  </div>
                  {metrics.reactionTimeValid > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg RT:</span>
                      <span className="font-semibold text-purple-600">{Math.round(metrics.reactionTimeValid)}ms</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={onShowQuestions}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl px-12 py-4 rounded-full font-bold shadow hover:from-purple-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Answer Questions
          </button>
        </div>
      </div>
    );
  }

  // Show Thank You screen if flagged
  if (gameState.showThankYou) {
    return (
      <div className="flex items-center justify-center" style={{ width: '960px', height: '540px', background: '#fff' }}>
        <div className="rounded-2xl border border-gray-200 shadow-2xl bg-white flex flex-col items-center justify-center p-12" style={{ width: '700px' }}>
          <h2 className="text-3xl font-extrabold text-purple-700 mb-6">Thank you!</h2>
          <p className="text-lg text-gray-700 mb-2 text-center">Your responses have been recorded.</p>
          <p className="text-gray-500 text-center">You may now close this window.</p>
        </div>
      </div>
    );
  }

  // Show questions screen
  if (gameState.showQuestions) {
    if (currentQuestionIndex >= selfReportQuestions.length) {
      // All questions answered
      return (
        <div className="flex items-center justify-center" style={{ width: '960px', height: '540px', background: '#fff' }}>
          <div className="rounded-2xl border border-gray-200 shadow-2xl bg-white flex flex-col items-center justify-center p-12" style={{ width: '700px' }}>
            <h2 className="text-3xl font-extrabold text-purple-700 mb-6">Thank you!</h2>
            <p className="text-lg text-gray-700 mb-2 text-center">Your responses have been recorded.</p>
            <p className="text-gray-500 text-center">You may now close this window.</p>
          </div>
        </div>
      );
    }

    const currentQuestion = selfReportQuestions[currentQuestionIndex];

    const handleSliderChange = (val: number) => {
      setLocalAnswer(val);
    };
    const handleLabelClick = (val: number) => {
      setLocalAnswer(val);
    };
    const handleNext = () => {
      if (localAnswer) {
        onQuestionAnswer(currentQuestionIndex, localAnswer);
      }
    };
    const handleBack = () => {
      if (currentQuestionIndex > 0) {
        onQuestionNav(currentQuestionIndex - 1);
      }
    };

    return (
      <div className="flex items-center justify-center" style={{ width: '960px', height: '540px', background: '#fff' }}>
        <div className="rounded-2xl border border-gray-200 shadow-2xl bg-white flex flex-col items-center justify-center p-8" style={{ width: '800px' }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">Question {currentQuestionIndex + 1} of {selfReportQuestions.length}</h2>
            <p className="text-lg text-gray-700">{currentQuestion}</p>
          </div>
          {/* Slider with labels */}
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full flex flex-col items-center">
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={localAnswer}
                onChange={e => handleSliderChange(Number(e.target.value))}
                className="w-full max-w-lg accent-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{ WebkitAppearance: 'none', appearance: 'none', height: '6px', borderRadius: '3px', background: '#e0e7ff', outline: 'none', marginBottom: '24px' }}
              />
              <div className="w-full max-w-lg flex flex-row justify-between mt-[-18px]">
                {selfReportLabels.map((label, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLabelClick(idx + 1)}
                    className={`text-xs md:text-base px-2 py-1 rounded transition-colors duration-150 font-medium focus:outline-none ${
                      localAnswer === idx + 1
                        ? 'bg-purple-100 text-purple-700 border border-purple-400'
                        : 'text-gray-700 hover:bg-purple-50 border border-transparent'
                    }`}
                    style={{ minWidth: 60 }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Back/Next buttons */}
          <div className="flex flex-row gap-4 mt-8">
            <button
              className={`px-8 py-3 rounded-full font-bold text-lg shadow transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300 ${
                currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gray-400 to-purple-400 text-white hover:from-gray-500 hover:to-purple-500'
              }`}
              disabled={currentQuestionIndex === 0}
              onClick={handleBack}
            >
              Back
            </button>
            <button
              className={`px-8 py-3 rounded-full font-bold text-lg shadow transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300 ${
                localAnswer
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!localAnswer}
              onClick={handleNext}
            >
              Next
            </button>
          </div>
          {/* Progress dots */}
          <div className="mt-8 text-center">
            <div className="flex justify-center space-x-2">
              {selfReportQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index < currentQuestionIndex
                      ? 'bg-green-500'
                      : index === currentQuestionIndex
                      ? 'bg-purple-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show round instructions
  if (!gameState.isPlaying && !gameState.gameComplete && !gameState.showScores && !gameState.showQuestions) {
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

  // Show self-report form after thank you screen (legacy - keeping for compatibility)
  if (showSelfReport) {
    const handleChange = (qIdx: number, value: number) => {
      setAnswers(prev => prev.map((a, i) => (i === qIdx ? value : a)));
    };
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onSelfReportSubmit) onSelfReportSubmit(answers);
      setSubmitted(true);
    };
    if (selfReportSubmitted || submitted) {
      return (
        <div className="flex items-center justify-center" style={{ width: '960px', height: '540px', background: '#fff' }}>
          <div className="rounded-2xl border border-gray-200 shadow-2xl bg-white flex flex-col items-center justify-center p-12" style={{ width: '700px' }}>
            <h2 className="text-3xl font-extrabold text-purple-700 mb-6">Thank you!</h2>
            <p className="text-lg text-gray-700 mb-2 text-center">Your responses have been recorded.</p>
            <p className="text-gray-500 text-center">You may now close this window.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center" style={{ width: '960px', height: '540px', background: '#fff' }}>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 shadow-2xl bg-white flex flex-col items-center justify-center p-8 gap-6" style={{ width: '800px' }}>
          <h2 className="text-2xl font-bold text-purple-700 mb-2">Self-Report Questionnaire</h2>
          <p className="text-gray-700 mb-4 text-center">Please answer the following questions about your experience and attention during the game.</p>
          <div className="flex flex-col gap-6 w-full">
            {selfReportQuestions.map((q, i) => (
              <div key={i} className="w-full">
                <label className="block text-lg font-medium text-gray-800 mb-2">{q}</label>
                <div className="flex flex-row gap-4 justify-center">
                  {selfReportLabels.map((label, v) => (
                    <label key={v} className="flex flex-col items-center">
                      <input
                        type="radio"
                        name={`q${i}`}
                        value={v + 1}
                        checked={answers[i] === v + 1}
                        onChange={() => handleChange(i, v + 1)}
                        required
                      />
                      <span className="text-xs mt-1">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg px-10 py-3 rounded-full font-bold shadow hover:from-purple-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
            disabled={answers.some(a => a === 0)}
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  // Show game complete screen (legacy - keeping for compatibility)
  if (gameState.gameComplete && !gameState.showScores && !gameState.showQuestions) {
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