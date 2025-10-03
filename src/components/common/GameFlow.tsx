import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PreGameInstructions from './PreGameInstructions';
import HowToPlay from './HowToPlay';
import GameFrame from '../GameFrame';
import PostGameSelfReport from './PostGameSelfReport';
import PatternMatchGame from '../PatternMatch/PatternMatchGame';
import BounceBackGame from '../BounceBack/BounceBackGame';
import FlutterFocusGame from '../FlutterFocus/FlutterFocusGame';
import BerryBlitzGame from '../BerryBlitz/BerryBlitzGame';

export type GameFlowState = 'instructions' | 'how-to-play' | 'game' | 'self-report' | 'complete';

interface GameFlowProps {
  gameId: string;
  gameTitle: string;
  gameIcon?: React.ReactNode;
  description: string;
  instructions: string[];
  questions: any[];
  onGameComplete: (gameData: any) => void;
  onFlowComplete: () => void;
  onCancel: () => void;
  userId?: string;
}

const GameFlow: React.FC<GameFlowProps> = ({
  gameId,
  gameTitle,
  gameIcon,
  description,
  instructions,
  questions,
  onGameComplete,
  onFlowComplete,
  onCancel,
  userId
}) => {
  const [currentState, setCurrentState] = useState<GameFlowState>('instructions');
  const [gameData, setGameData] = useState<any>(null);

  const handleInstructionsStart = () => {
    setCurrentState('how-to-play');
  };

  const handleHowToPlayStart = () => {
    setCurrentState('game');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGameComplete = (data: any) => {
    // For PatternMatch, store round metrics for later scoring
    if (gameId === 'pattern-match') {
      const roundMetrics = data;
      
      // Create the game data structure without scores
      const gameData = {
        gameId: 'pattern-match',
        rounds: roundMetrics,
        gameCompleted: true
      };
      
      setGameData(gameData);
    } else {
      setGameData(data);
    }
    setCurrentState('self-report');
  };

  const handleSelfReportComplete = (answers: { [key: string]: number }) => {
    // For PatternMatch, calculate scores with both game data AND self-report
    let scores = {};
    if (gameId === 'pattern-match' && gameData.rounds) {
      console.log('🔍 [GameFlow] Scoring data received:', {
        gameId,
        roundsCount: gameData.rounds.length,
        rounds: gameData.rounds,
        answers
      });
      
      // Convert round metrics to the format expected by scoring
      const rounds = gameData.rounds.map((metrics: any, index: number) => {
        console.log(`🔍 [GameFlow] Round ${index + 1} raw metrics:`, metrics);
        return {
          totalTrials: metrics.totalTrials || 30,
          correctHits: metrics.correctHits || metrics.correctTrials || 0,
          falsePositives: metrics.falsePositives || 0,
          missedTargets: metrics.missedTargets || 0,
          averageReactionTimeMs: metrics.reactionTimeValid || metrics.averageReactionTimeMs || 0,
          targetSwitchCount: 0, // Not tracked in current implementation
          roundDifficultyWeight: index === 0 ? 1.0 : index === 1 ? 1.2 : 1.4
        };
      });
      
      console.log('🔍 [GameFlow] Converted rounds:', rounds);
      
      // Calculate scores using the same logic as in handleGameComplete
      const totalTrialsAll = rounds.reduce((sum: number, r: any) => sum + r.totalTrials, 0);
      const missedTargetsAll = rounds.reduce((sum: number, r: any) => sum + r.missedTargets, 0);
      const falsePositivesAll = rounds.reduce((sum: number, r: any) => sum + r.falsePositives, 0);
      const correctHitsAll = rounds.reduce((sum: number, r: any) => sum + r.correctHits, 0);
      
      // Inattention: Missed targets + false positives (higher = worse performance)
      // Use exponential penalty for false positives - they're much worse than missed targets
      const missedTargetRate = totalTrialsAll > 0 ? missedTargetsAll / totalTrialsAll : 0;
      const inattentionFalsePositiveRate = totalTrialsAll > 0 ? falsePositivesAll / totalTrialsAll : 0;
      const gameInattention = Math.min(10, 
        (missedTargetRate * 10) + // Linear penalty for missed targets
        (inattentionFalsePositiveRate > 0 ? Math.pow(inattentionFalsePositiveRate * 2, 2) * 10 : 0) // Exponential penalty for false positives
      );
      const srInattention = answers.q1_focus_difficulty ? 
        (answers.q1_focus_difficulty / 5) * 10 : 0;
      const inattention = Math.min(10, 0.7 * gameInattention + 0.3 * srInattention);
      
      // Impulsivity: False positive rate + reaction time (higher = worse performance)
      // Use exponential penalty for false positives - they indicate poor impulse control
      const impulsivityFalsePositiveRate = totalTrialsAll > 0 ? (falsePositivesAll / totalTrialsAll) : 0;
      const FA_rate = Math.min(10, impulsivityFalsePositiveRate > 0 ? Math.pow(impulsivityFalsePositiveRate * 3, 2) * 10 : 0); // Exponential penalty
      const avgRT = rounds.reduce((sum: number, r: any) => sum + (r.averageReactionTimeMs || 0), 0) / rounds.length;
      const RT_rate = Math.min(10, Math.max(0, (avgRT - 500) / 200)); // Normalize: 500ms = 0, 2500ms = 10
      const gameImpulsivity = Math.min(10, 0.7 * FA_rate + 0.3 * RT_rate);
      const srImpulsivity = answers.q3_act_without_thinking ? 
        (answers.q3_act_without_thinking / 5) * 10 : 0;
      const impulsivity = Math.min(10, 0.7 * gameImpulsivity + 0.3 * srImpulsivity);
      
      // Executive Function: Rule following difficulty (higher = worse performance)
      // Use false positives and missed targets as proxy for rule following
      // Use exponential penalty for false positives - they indicate poor rule following
      const executiveFalsePositiveRate = totalTrialsAll > 0 ? falsePositivesAll / totalTrialsAll : 0;
      const executiveMissedTargetRate = totalTrialsAll > 0 ? missedTargetsAll / totalTrialsAll : 0;
      const gameExecutive = Math.min(10, 
        (executiveMissedTargetRate * 10) + // Linear penalty for missed targets
        (executiveFalsePositiveRate > 0 ? Math.pow(executiveFalsePositiveRate * 2.5, 2) * 10 : 0) // Exponential penalty for false positives
      );
      const srExecutive = answers.q4_rule_following_difficulty ? 
        (answers.q4_rule_following_difficulty / 5) * 10 : 0;
      const executive_function = Math.min(10, 0.7 * gameExecutive + 0.3 * srExecutive);
      
      // Hyperactivity: Movement and restlessness (higher = worse performance)
      // Use reaction time variability and false positives as proxy for restlessness
      // Use exponential penalty for false positives - they indicate poor impulse control and restlessness
      const hyperactivityFalsePositiveRate = totalTrialsAll > 0 ? (falsePositivesAll / totalTrialsAll) : 0;
      const falsePositiveImpact = Math.min(10, hyperactivityFalsePositiveRate > 0 ? Math.pow(hyperactivityFalsePositiveRate * 4, 2) * 10 : 0); // Exponential penalty
      
      const reactionTimeVariability = rounds.reduce((sum: number, r: any) => {
        const rt = r.averageReactionTimeMs || 0;
        return sum + (rt > 0 ? Math.abs(rt - 800) / 400 : 0); // Compare to baseline 800ms, normalize to 10
      }, 0) / rounds.length;
      const rtImpact = Math.min(10, reactionTimeVariability * 8); // Amplify from 5x to 8x
      
      const hyperactivityProxy = Math.min(10, 0.6 * falsePositiveImpact + 0.4 * rtImpact);
      // Use q5_mind_shifting for hyperactivity (restlessness/constant shifting)
      const srHyperactivity = answers.q5_mind_shifting ? 
        (answers.q5_mind_shifting / 5) * 10 : 0;
      const hyperactivity = Math.min(10, 0.7 * hyperactivityProxy + 0.3 * srHyperactivity);
      
      // Calculate ADHD Composite Score (average of all domains)
      const adhd_composite = Math.round((inattention + impulsivity + executive_function + hyperactivity) / 4 * 100) / 100;
      
      console.log('🔍 [GameFlow] Score calculations:', {
        totalTrialsAll,
        missedTargetsAll,
        falsePositivesAll,
        correctHitsAll,
        gameInattention,
        srInattention,
        inattention,
        gameImpulsivity,
        srImpulsivity,
        impulsivity,
        gameExecutive,
        srExecutive,
        executive_function,
        hyperactivityProxy,
        srHyperactivity,
        hyperactivity,
        adhd_composite
      });
      
      scores = {
        inattention,
        impulsivity,
        executive_function,
        hyperactivity,
        adhd_composite
      };
    }
    
    // Combine game data with self-report answers and calculated scores
    const completeData = {
      ...gameData,
      scores,
      selfReport: answers,
      gameId,
      userId,
      completedAt: new Date().toISOString()
    };
    
    onGameComplete(completeData);
    setCurrentState('complete');
    
    // Small delay before calling onFlowComplete to show completion state
    setTimeout(() => {
      onFlowComplete();
    }, 1000);
  };

  const handleCancel = () => {
    onCancel();
  };

  // Helper functions to get game-specific controls and rules
  const getGameControls = (gameId: string): string[] => {
    switch (gameId) {
      case 'pattern-match':
        return [
          'Click with your mouse to respond to stimuli',
          'Use SPACEBAR as an alternative to clicking',
          'Watch for the target shape and pattern on the left',
          'Respond quickly but accurately'
        ];
      case 'bounce-back':
        return [
          'Use LEFT and RIGHT arrow keys to move the paddle',
          'Press SPACEBAR to launch the ball',
          'Break all bricks to complete each level',
          'Avoid losing the ball - you have 3 lives'
        ];
      case 'flutter-focus':
        return [
          'Use UP and DOWN arrow keys to move the alien',
          'Avoid obstacles and collect power-ups',
          'Navigate through different levels',
          'Stay focused despite distractions'
        ];
      case 'berry-blitz':
        return [
          'Use arrow keys to move the red panda',
          'Collect target fruits while avoiding obstacles',
          'Complete 3 rounds with different targets',
          'Navigate the 5x5 grid carefully'
        ];
      default:
        return ['Use mouse and keyboard controls', 'Follow on-screen instructions'];
    }
  };

  const getGameplayRules = (gameId: string): string[] => {
    switch (gameId) {
      case 'pattern-match':
        return [
          'Round 1: Click if the SHAPE matches the target (ignore pattern)',
          'Round 2: Click if the PATTERN matches the target (ignore shape)',
          'Round 3: Click if BOTH shape AND pattern match (shapes may be rotated)',
          'Some trials have visual distractions - stay focused!',
          'Complete all 3 rounds to finish the game'
        ];
      case 'bounce-back':
        return [
          'Complete 3 levels with increasing difficulty',
          'Level 1: Basic bricks to get familiar with controls',
          'Level 2: Introduces tough bricks and power-ups',
          'Level 3: Maximum challenge with toughest bricks',
          'Answer 5 questions after completing all levels'
        ];
      case 'flutter-focus':
        return [
          'Navigate through 3 increasingly difficult levels',
          'Each level has 3 lives',
          'Avoid obstacles and collect power-ups',
          'Level 2 introduces decoy paths',
          'Level 3 tests memory and focus'
        ];
      case 'berry-blitz':
        return [
          'Collect only the target fruit shown at the top',
          'Avoid moving shurikens and other obstacles',
          'Complete 3 rounds with different target fruits',
          'Non-target fruits don\'t count toward your score',
          'Navigate carefully on the 5x5 grid'
        ];
      default:
        return ['Follow the game objectives', 'Complete all levels to finish'];
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <AnimatePresence mode="wait">
        {currentState === 'instructions' && (
          <div className="flex items-center justify-center w-full h-full">
            <PreGameInstructions
              key="instructions"
              gameTitle={gameTitle}
              gameIcon={gameIcon}
              description={description}
              instructions={instructions}
              onStart={handleInstructionsStart}
              onCancel={handleCancel}
              width="992px"
              height="720px"
            />
          </div>
        )}

        {currentState === 'how-to-play' && (
          <div className="flex items-center justify-center w-full h-full">
            <HowToPlay
              key="how-to-play"
              gameTitle={gameTitle}
              gameIcon={gameIcon}
              controls={getGameControls(gameId)}
              gameplayRules={getGameplayRules(gameId)}
              onStart={handleHowToPlayStart}
              onCancel={handleCancel}
              width="992px"
              height="720px"
            />
          </div>
        )}

        {currentState === 'game' && (
          <GameFrame
            key="game"
            gameTitle={gameTitle}
            gameIcon={gameIcon}
            onClose={handleCancel}
            onCancel={handleCancel}
            showFooter={true}
            footerText="Complete the game to continue"
          >
            {/* Render the actual game based on gameId */}
            {gameId === 'berry-blitz' && (
              <div className="flex items-center justify-center w-full h-full">
                <BerryBlitzGame
                  width="960px"
                  height="540px"
                  onGameComplete={handleGameComplete}
                  onCancel={handleCancel}
                  onError={(error) => console.error('BerryBlitz error:', error)}
                  userId={userId}
                />
              </div>
            )}
            {gameId === 'pattern-match' && (
              <div className="flex items-center justify-center w-full h-full">
                <PatternMatchGame
                  width="960px"
                  height="540px"
                  onGameComplete={handleGameComplete}
                  onError={(error) => console.error('PatternMatch error:', error)}
                  userId={userId}
                />
              </div>
            )}
            {gameId === 'bounce-back' && (
              <BounceBackGame
                width="960px"
                height="540px"
                onGameComplete={handleGameComplete}
                onError={(error) => console.error('BounceBack error:', error)}
                userId={userId}
              />
            )}
            {gameId === 'flutter-focus' && (
              <div className="flex items-center justify-center w-full h-full">
                <FlutterFocusGame
                  width="960px"
                  height="540px"
                  onGameComplete={handleGameComplete}
                  onError={(error) => console.error('FlutterFocus error:', error)}
                  userId={userId}
                />
              </div>
            )}
          </GameFrame>
        )}

        {currentState === 'self-report' && (
          <div className="flex items-center justify-center w-full h-full">
            <PostGameSelfReport
              key="self-report"
              gameTitle={gameTitle}
              gameIcon={gameIcon}
              questions={questions}
              onComplete={handleSelfReportComplete}
              onCancel={handleCancel}
              width="992px"
              height="720px"
            />
          </div>
        )}

        {currentState === 'complete' && (
          <div className="flex items-center justify-center w-full h-full">
            <div
              key="complete"
              className="card-dark max-w-2xl max-h-[60vh] w-[90vw] overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-emerald-500 mb-4">Assessment Complete!</h2>
                <p className="text-sage-200 text-lg">
                  Thank you for completing {gameTitle}. Your responses have been recorded.
                </p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameFlow;
