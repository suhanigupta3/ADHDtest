import React, { useState } from 'react';
import { PatternMatchGameProps } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import GameUI from './GameUI';
import { db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const PatternMatchGame: React.FC<PatternMatchGameProps> = ({
  onGameComplete,
  onError,
  width = "960px",
  height = "540px",
  isStandalone = false,
  userId
}) => {
  const {
    gameState,
    elapsedTime,
    stimulusRotation,
    roundMetrics,
    startGame,
    startRound,
    handleScreenClick,
    handleStimulusClick,
    setShowRoundInstructions,
    showQuestions,
    handleQuestionAnswer,
    setCurrentQuestionIndex
  } = useGameLogic({ userId, onGameComplete, onError });

  // Self-report state (legacy - keeping for compatibility)
  const [showSelfReport, setShowSelfReport] = useState(false);
  const [selfReportSubmitted, setSelfReportSubmitted] = useState(false);

  // When game is complete, show self-report after thank you screen (legacy flow)
  React.useEffect(() => {
    if (gameState.gameComplete && !showSelfReport && !gameState.showScores && !gameState.showQuestions) {
      // Show thank you for 2s, then show self-report
      const t = setTimeout(() => setShowSelfReport(true), 2000);
      return () => clearTimeout(t);
    }
  }, [gameState.gameComplete, showSelfReport, gameState.showScores, gameState.showQuestions]);

  // Handle self-report submit (legacy)
  const handleSelfReportSubmit = async (answers: any) => {
    if (!userId) return;
    const selfReport = {
      q1_focus_difficulty: answers[0],
      q2_careless_mistakes: answers[1],
      q3_act_without_thinking: answers[2],
      q4_rule_following_difficulty: answers[3],
      q5_mind_shifting: answers[4]
    };
    try {
      await setDoc(doc(db, 'users', userId, 'games', 'PatternMatch'), { selfReport }, { merge: true });
      setSelfReportSubmitted(true);
    } catch (err: any) {
      if (onError) onError('Failed to upload self-report: ' + err.message);
    }
  };

  // Handler for question navigation (back/next without submit)
  const handleQuestionNav = (newIndex: number) => {
    if (typeof setCurrentQuestionIndex === 'function') {
      setCurrentQuestionIndex(newIndex);
    }
  };

  return (
    <div 
      className={`rounded-lg border border-gray-200 shadow-lg bg-white flex flex-col justify-between game-area ${gameState.isFlickering ? 'animate-pulse' : ''}`}
      style={{ width, height }}
      onClick={handleScreenClick}
    >
      <GameUI
        gameState={gameState}
        elapsedTime={elapsedTime}
        stimulusRotation={stimulusRotation}
        roundMetrics={roundMetrics}
        onStartGame={startGame}
        onStartRound={startRound}
        onStimulusClick={handleStimulusClick}
        onScreenClick={handleScreenClick}
        onShowQuestions={showQuestions}
        onQuestionAnswer={handleQuestionAnswer}
        onQuestionNav={handleQuestionNav}
        showSelfReport={showSelfReport}
        selfReportSubmitted={selfReportSubmitted}
        onSelfReportSubmit={handleSelfReportSubmit}
      />
    </div>
  );
};

export default PatternMatchGame; 