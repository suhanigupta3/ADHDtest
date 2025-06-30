import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { mockUserResults } from '../utils/mockResults';
import type { GameRound } from './PatternMatch/types';

interface SelfReport {
  q1_focusDifficulty?: number;
  q2_forgetfulness?: number;
  q3_restlessness?: number;
  q4_impulsivity?: number;
  q5_followThrough?: number;
}

interface GameScores {
  inattention: number;
  hyperactivity: number;
  impulsivity: number;
  executive_function: number;
  adhd_composite: number;
}

interface GameData {
  rounds: GameRound[];
  selfReport: SelfReport;
  scores: GameScores;
}

interface UserResults {
  berryBlitz?: GameData;
  patternMatch?: GameData;
  kitchenQuest?: GameData;
  [key: string]: GameData | undefined;
}

export type { UserResults, GameData, GameScores, GameRound, SelfReport };

const GameResultsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [userResults, setUserResults] = useState<UserResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>('combined');
  const [showInterpretationGuide, setShowInterpretationGuide] = useState(false);

  useEffect(() => {
    const fetchUserResults = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        console.log('🔍 Fetching real user data for:', currentUser.uid);
        
        const results: UserResults = {};
        
        // Fetch Berry Blitz data
        const berryBlitzDoc = await getDoc(doc(db, 'users', currentUser.uid, 'games', 'BerryBlitz'));
        if (berryBlitzDoc.exists()) {
          const berryBlitzData = berryBlitzDoc.data();
          if (berryBlitzData.scores && berryBlitzData.selfReport) {
            let rounds: GameRound[] = [];
            try {
              const roundsSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'games', 'BerryBlitz', 'rounds'));
              rounds = roundsSnapshot.docs.map(doc => doc.data() as GameRound);
            } catch (roundsError) {
              if (berryBlitzData.rounds && Array.isArray(berryBlitzData.rounds)) {
                rounds = berryBlitzData.rounds;
              }
            }
            results.berryBlitz = {
              scores: berryBlitzData.scores,
              selfReport: berryBlitzData.selfReport,
              rounds: rounds
            };
          }
        }
        // Fetch PatternMatch data
        const patternMatchDoc = await getDoc(doc(db, 'users', currentUser.uid, 'games', 'PatternMatch'));
        if (patternMatchDoc.exists()) {
          const patternMatchData = patternMatchDoc.data();
          if (patternMatchData.scores && patternMatchData.selfReport) {
            let rounds: GameRound[] = [];
            try {
              const roundsSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'games', 'PatternMatch', 'rounds'));
              rounds = roundsSnapshot.docs.map(doc => doc.data() as GameRound);
            } catch (roundsError) {
              if (patternMatchData.rounds && Array.isArray(patternMatchData.rounds)) {
                rounds = patternMatchData.rounds;
              }
            }
            results.patternMatch = {
              scores: patternMatchData.scores,
              selfReport: patternMatchData.selfReport,
              rounds: rounds
            };
          }
        }
        // Fetch Kitchen Quest data
        const kitchenQuestDoc = await getDoc(doc(db, 'users', currentUser.uid, 'games', 'KitchenQuest'));
        if (kitchenQuestDoc.exists()) {
          const kitchenQuestData = kitchenQuestDoc.data();
          if (kitchenQuestData.scores && kitchenQuestData.selfReport) {
            let rounds: GameRound[] = [];
            try {
              const roundsSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'games', 'KitchenQuest', 'rounds'));
              rounds = roundsSnapshot.docs.map(doc => doc.data() as GameRound);
            } catch (roundsError) {
              if (kitchenQuestData.rounds && Array.isArray(kitchenQuestData.rounds)) {
                rounds = kitchenQuestData.rounds;
              }
            }
            results.kitchenQuest = {
              scores: kitchenQuestData.scores,
              selfReport: kitchenQuestData.selfReport,
              rounds: rounds
            };
          }
        }
        if (Object.keys(results).length > 0) {
          setUserResults(results);
        } else {
          setUserResults(mockUserResults);
        }
      } catch (err) {
        setUserResults(mockUserResults);
        setError('Failed to load real data. Showing demonstration data.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserResults();
  }, [currentUser]);

  const calculateCombinedScores = (): GameScores | null => {
    if (!userResults) return null;

    const games = Object.values(userResults).filter(game => game?.scores);
    if (games.length === 0) return null;

    const combinedScores = {
      inattention: 0,
      hyperactivity: 0,
      impulsivity: 0,
      executive_function: 0,
      adhd_composite: 0,
    };

    games.forEach(game => {
      if (game && game.scores) {
        combinedScores.inattention += game.scores.inattention;
        combinedScores.hyperactivity += game.scores.hyperactivity;
        combinedScores.impulsivity += game.scores.impulsivity;
        combinedScores.executive_function += game.scores.executive_function;
        combinedScores.adhd_composite += game.scores.adhd_composite;
      }
    });

    const numGames = games.length;
    Object.keys(combinedScores).forEach(key => {
      combinedScores[key as keyof GameScores] /= numGames;
    });

    return combinedScores;
  };

  const getGameProgress = () => {
    if (!userResults) return { completed: 0, total: 3, percentage: 0, nextGame: null };
    const gameOrder = ['berryBlitz', 'patternMatch', 'kitchenQuest'];
    const completedGames = gameOrder.filter(game => userResults[game]?.scores);
    const completedCount = completedGames.length;
    const totalGames = gameOrder.length;
    const percentage = (completedCount / totalGames) * 100;
    let nextGame = null;
    for (const game of gameOrder) {
      if (!userResults[game]?.scores) {
        nextGame = game;
        break;
      }
    }
    return {
      completed: completedCount,
      total: totalGames,
      percentage,
      nextGame,
      completedGames,
      gameOrder
    };
  };

  const getGameDisplayName = (gameKey: string) => {
    const nameMap: { [key: string]: string } = {
      berryBlitz: 'Berry Blitz',
      patternMatch: 'Pattern Match',
      kitchenQuest: 'Kitchen Quest'
    };
    return nameMap[gameKey] || gameKey;
  };

  const getGameDescription = (gameKey: string) => {
    const descriptions: { [key: string]: string } = {
      berryBlitz: 'Navigate through obstacles to collect fruits while avoiding shurikens',
      patternMatch: 'Match patterns as quickly and accurately as possible',
      kitchenQuest: 'Manage multiple cooking tasks while maintaining focus and organization'
    };
    return descriptions[gameKey] || 'Complete this game to continue your assessment';
  };

  const getScoreInterpretation = (score: number): { level: string; color: string; description: string } => {
    if (score >= 0.0 && score <= 1.9) {
      return { 
        level: 'No Concern', 
        color: 'text-green-600', 
        description: 'No follow-up needed' 
      };
    } else if (score >= 2.0 && score <= 3.9) {
      return { 
        level: 'Low Concern', 
        color: 'text-green-600', 
        description: 'No immediate concern; track over time' 
      };
    } else if (score >= 4.0 && score <= 6.4) {
      return { 
        level: 'Monitor Symptoms', 
        color: 'text-yellow-600', 
        description: 'Suggest monitoring or lifestyle adjustments' 
      };
    } else if (score >= 6.5 && score <= 8.4) {
      return { 
        level: 'Moderate Concern', 
        color: 'text-orange-600', 
        description: 'Recommend structured follow-up or screening' 
      };
    } else if (score >= 8.5 && score <= 10.0) {
      return { 
        level: 'High Concern', 
        color: 'text-red-600', 
        description: 'Strongly recommend professional evaluation' 
      };
    } else {
      return { 
        level: 'Invalid Score', 
        color: 'text-gray-600', 
        description: 'Score outside expected range' 
      };
    }
  };

  const formatTimeToReadable = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = '';
    if (hours > 0) result += `${hours}${hours === 1 ? 'hr' : 'hrs'}, `;
    if (minutes > 0) result += `${minutes}m, `;
    result += `${secs.toFixed(2)}s`;
    
    return result;
  };

  const renderScoreCard = (title: string, score: number, description: string) => {
    const interpretation = getScoreInterpretation(score);
    
    return (
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <div className="flex items-center justify-between mb-3">
          <span 
            className={`text-3xl font-bold ${interpretation.color} cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => setShowInterpretationGuide(true)}
            title="Click to view score interpretation guide"
          >
            {score.toFixed(1)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            interpretation.color.replace('text-', 'bg-').replace('-600', '-100')
          }`}>
            {interpretation.level}
          </span>
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
        <p className={`text-sm mt-2 ${interpretation.color}`}>
          {interpretation.description}
        </p>
      </motion.div>
    );
  };

  const renderGameRoundsTable = (rounds: GameRound[], gameName: string) => {
    console.log(`🔍 Rendering rounds table for ${gameName}:`, rounds);
    
    const gameNameDisplay = gameName === 'berryBlitz' ? 'Berry Blitz' : 
                           gameName === 'patternMatch' ? 'Pattern Match' : 
                           gameName === 'kitchenQuest' ? 'Kitchen Quest' : gameName;

    // Determine which fields to show based on game type
    const isBerryBlitz = gameName === 'berryBlitz';
    const isPatternMatch = gameName === 'patternMatch';

    // If no rounds data, show a message instead of hiding the entire section
    if (!rounds || rounds.length === 0) {
      return (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{gameNameDisplay} Performance Details</h3>
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <p className="text-gray-600 mb-2">No detailed performance data available</p>
            <p className="text-sm text-gray-500">
              Round-by-round performance metrics were not recorded for this session
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{gameNameDisplay} Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Round</th>
                
                {/* Berry Blitz specific columns */}
                {isBerryBlitz && rounds[0]?.timeToTargetFruit !== undefined && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Time to Target</th>
                )}
                {isBerryBlitz && rounds[0]?.totalRoundDuration !== undefined && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Total Duration</th>
                )}
                {isBerryBlitz && rounds[0]?.stepsTaken !== undefined && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Steps</th>
                )}
                {isBerryBlitz && rounds[0]?.optimalSteps !== undefined && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Optimal</th>
                )}
                {isBerryBlitz && rounds[0]?.redundantMoves !== undefined && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Redundant</th>
                )}
                {isBerryBlitz && rounds[0]?.roundScore !== undefined && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Score</th>
                )}

                {/* PatternMatch specific columns */}
                {isPatternMatch && (
                  <>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hits</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">False Positives</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Missed</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (s)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg RT (ms)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rounds.map((round, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    Round {index + 1}
                  </td>
                  
                  {/* Berry Blitz specific data */}
                  {isBerryBlitz && round.timeToTargetFruit !== undefined && (
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {formatTimeToReadable(round.timeToTargetFruit / 1000)}
                    </td>
                  )}
                  {isBerryBlitz && round.totalRoundDuration !== undefined && (
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {formatTimeToReadable(round.totalRoundDuration / 1000)}
                    </td>
                  )}
                  {isBerryBlitz && round.stepsTaken !== undefined && (
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {round.stepsTaken}
                    </td>
                  )}
                  {isBerryBlitz && round.optimalSteps !== undefined && (
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {round.optimalSteps}
                    </td>
                  )}
                  {isBerryBlitz && round.redundantMoves !== undefined && (
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {round.redundantMoves}
                    </td>
                  )}
                  {isBerryBlitz && round.roundScore !== undefined && (
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {round.roundScore}
                    </td>
                  )}

                  {/* PatternMatch specific data */}
                  {isPatternMatch && (
                    <>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{round.correctHits}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{round.falsePositives}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{round.missedTargets}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{round.roundDurationMs ? (round.roundDurationMs / 1000).toFixed(1) : '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{round.averageReactionTimeMs ?? '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{calculatePatternMatchRoundScore(round)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSelfReportTable = (selfReport: SelfReport, gameName: string) => {
    const questions = Object.keys(selfReport).filter(key => selfReport[key as keyof SelfReport] !== undefined);
    if (questions.length === 0) return null;

    // Use different question keys/labels for PatternMatch
    let questionLabels: { [key: string]: string };
    let questionOrder: string[];
    if (gameName === 'patternMatch') {
      questionLabels = {
        q1_focus_difficulty: 'Focus Difficulty',
        q2_careless_mistakes: 'Careless Mistakes',
        q3_act_without_thinking: 'Act Without Thinking',
        q4_rule_following_difficulty: 'Rule Following Difficulty',
        q5_mind_shifting: 'Mind Shifting',
      };
      questionOrder = [
        'q1_focus_difficulty',
        'q2_careless_mistakes',
        'q3_act_without_thinking',
        'q4_rule_following_difficulty',
        'q5_mind_shifting',
      ];
    } else {
      questionLabels = {
        q1_focusDifficulty: 'Focus Difficulty',
        q2_forgetfulness: 'Forgetfulness',
        q3_restlessness: 'Restlessness',
        q4_impulsivity: 'Impulsivity',
        q5_followThrough: 'Follow Through',
      };
      questionOrder = [
        'q1_focusDifficulty',
        'q2_forgetfulness',
        'q3_restlessness',
        'q4_impulsivity',
        'q5_followThrough',
      ];
    }
    const orderedQuestions = questionOrder.filter(question => questions.includes(question));

    const scoreLabels: { [key: number]: string } = {
      1: 'Never',
      2: 'Rarely',
      3: 'Sometimes',
      4: 'Often',
      5: 'Very Often'
    };

    const scoreInterpretations: { [key: number]: string } = {
      1: 'Symptom is essentially absent',
      2: 'Symptom occurs infrequently',
      3: 'Symptom occurs occasionally',
      4: 'Symptom occurs regularly',
      5: 'Symptom is consistently present'
    };

    const gameNameDisplay = gameName === 'berryBlitz' ? 'Berry Blitz' :
                           gameName === 'patternMatch' ? 'Pattern Match' :
                           gameName === 'kitchenQuest' ? 'Kitchen Quest' : gameName;

    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{gameNameDisplay} Self-Report Responses</h3>
        <div className="space-y-4">
          {orderedQuestions.map(question => {
            const score = selfReport[question as keyof SelfReport] || 0;
            return (
              <div key={question} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  {questionLabels[question] || question}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(scoreValue => (
                      <div
                        key={scoreValue}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          score >= scoreValue
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                        title={`${scoreValue}: ${scoreLabels[scoreValue]} - ${scoreInterpretations[scoreValue]}`}
                      >
                        {scoreValue}
                      </div>
                    ))}
                  </div>
                  <span
                    className="text-sm text-gray-600 ml-2 w-20 text-right"
                    title={scoreInterpretations[score] || 'Unknown interpretation'}
                  >
                    {scoreLabels[score] || `Score: ${score}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderGameInsights = (gameData: GameData, gameName: string) => {
    const gameNameDisplay = gameName === 'berryBlitz' ? 'Berry Blitz' : 
                           gameName === 'patternMatch' ? 'Pattern Match' : 
                           gameName === 'kitchenQuest' ? 'Kitchen Quest' : gameName;

    let insights = [];

    if (gameName === 'berryBlitz' && gameData.rounds.length > 0) {
      const avgTime = gameData.rounds.reduce((sum, r) => sum + (r.timeToTargetFruit || 0), 0) / gameData.rounds.length;
      const avgTotalDuration = gameData.rounds.reduce((sum, r) => sum + (r.totalRoundDuration || 0), 0) / gameData.rounds.length;
      const totalRedundant = gameData.rounds.reduce((sum, r) => sum + (r.redundantMoves || 0), 0);
      const totalCollisions = gameData.rounds.reduce((sum, r) => sum + (r.collisionsWithShuriken || 0), 0);
      const avgRoundScore = gameData.rounds.reduce((sum, r) => sum + (r.roundScore || 0), 0) / gameData.rounds.length;
      
      insights.push(
        <div key="time" className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium text-blue-700">Average Time to Target</span>
          <span className="text-sm text-blue-600 font-semibold">{formatTimeToReadable(avgTime / 1000)}</span>
        </div>,
        <div key="totalDuration" className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
          <span className="text-sm font-medium text-purple-700">Average Total Round Duration</span>
          <span className="text-sm text-purple-600 font-semibold">{formatTimeToReadable(avgTotalDuration / 1000)}</span>
        </div>,
        <div key="redundant" className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
          <span className="text-sm font-medium text-yellow-700">Total Redundant Moves</span>
          <span className="text-sm text-yellow-600 font-semibold">{totalRedundant}</span>
        </div>,
        <div key="collisions" className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
          <span className="text-sm font-medium text-red-700">Total Collisions</span>
          <span className="text-sm text-red-600 font-semibold">{totalCollisions}</span>
        </div>,
        <div key="roundScore" className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="text-sm font-medium text-green-700">Average Round Score</span>
          <span className="text-sm text-green-600 font-semibold">{avgRoundScore.toFixed(1)}</span>
        </div>
      );
    }

    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{gameNameDisplay} Performance Insights</h3>
        <div className="space-y-3">
          {insights}
        </div>
      </div>
    );
  };

  const renderProgressSection = () => {
    const progress = getGameProgress();
    
    return (
      <div className="space-y-8">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Assessment Progress</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete all games to get your comprehensive ADHD assessment results
          </p>
        </div>

        {/* Progress Bar */}
        <div className="card p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {progress.completed} of {progress.total} Games Completed
            </h2>
            <div className="text-4xl font-bold text-darkforest-600 mb-2">
              {progress.percentage.toFixed(0)}%
            </div>
            <p className="text-gray-600">
              {progress.completed === progress.total 
                ? 'All games completed! View your combined results below.'
                : `${progress.total - progress.completed} game${progress.total - progress.completed > 1 ? 's' : ''} remaining`
              }
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
            <div 
              className="bg-gradient-to-r from-darkforest-500 to-darkforest-700 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>

          {/* Game Status Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {progress.gameOrder?.map((gameKey, index) => {
              const isCompleted = progress.completedGames?.includes(gameKey) || false;
              const isNext = progress.nextGame === gameKey;
              const isLocked = !isCompleted && !isNext;
              
              return (
                <motion.div
                  key={gameKey}
                  className={`card p-6 relative ${
                    isCompleted 
                      ? 'border-green-300 bg-green-50' 
                      : isNext 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-300 bg-gray-50'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {isCompleted ? (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        ✓ Completed
                      </div>
                    ) : isNext ? (
                      <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Next
                      </div>
                    ) : (
                      <div className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Locked
                      </div>
                    )}
                  </div>

                  {/* Game Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isCompleted 
                      ? 'bg-green-100 text-green-600' 
                      : isNext 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h1a1 1 0 110 2H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-5 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" />
                      </svg>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                    {gameKey === 'berryBlitz' && <span className="mr-2">🍓</span>}
                    {gameKey === 'patternMatch' && <span className="mr-2">🚀</span>}
                    {gameKey === 'kitchenQuest' && <span className="mr-2">👨‍🍳</span>}
                    {getGameDisplayName(gameKey)}
                  </h3>
                  
                  <p className="text-gray-600 text-sm text-center mb-4">
                    {getGameDescription(gameKey)}
                  </p>

                  {isCompleted && userResults && userResults[gameKey] && (
                    <div 
                      className="text-center cursor-pointer hover:bg-green-100 transition-colors duration-200 rounded-lg p-2"
                      onClick={() => setSelectedGame(gameKey)}
                      title={`Click to view detailed ${getGameDisplayName(gameKey)} results`}
                    >
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {userResults[gameKey]?.scores.adhd_composite.toFixed(1)}
                      </div>
                      <p className="text-sm text-gray-600">Composite Score</p>
                      <p className="text-xs text-green-500 mt-1">Click to view details →</p>
                    </div>
                  )}

                  {isNext && (
                    <div className="text-center">
                      <button 
                        onClick={() => window.location.href = '/assessment'}
                        className="btn-primary w-full"
                      >
                        Start {getGameDisplayName(gameKey)}
                      </button>
                    </div>
                  )}

                  {isLocked && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        Complete previous games first
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Combined Results (Only if all games completed) */}
        {progress.completed === progress.total && (() => {
          const combinedScores = calculateCombinedScores();
          if (!combinedScores) return null;
          
          return (
            <>
              <div className="card p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🎉 All Games Completed!</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Congratulations! You've completed all assessment games. Here's your comprehensive ADHD profile:
                </p>
                
                <div className="text-6xl font-bold text-darkforest-600 mb-4">
                  {combinedScores.adhd_composite.toFixed(1)}
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Overall ADHD Composite Score
                </p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                  {renderScoreCard(
                    'Inattention',
                    combinedScores.inattention,
                    'Difficulty sustaining attention and focus'
                  )}
                  {renderScoreCard(
                    'Hyperactivity',
                    combinedScores.hyperactivity,
                    'Excessive movement and restlessness'
                  )}
                  {renderScoreCard(
                    'Impulsivity',
                    combinedScores.impulsivity,
                    'Acting without thinking and poor impulse control'
                  )}
                  {renderScoreCard(
                    'Executive Function',
                    combinedScores.executive_function,
                    'Planning, organization, and task management'
                  )}
                </div>
              </div>
            </>
          );
        })()}

        {/* Progress Summary (When not all games completed) */}
        {progress.completed > 0 && progress.completed < progress.total && userResults && (
          <>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Assessment Progress</h3>
              <p className="text-gray-600 mb-4">
                Complete all {progress.total} games to receive your comprehensive ADHD assessment results and clinical recommendations.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progress.completedGames?.map(gameKey => {
                  const gameData = userResults[gameKey];
                  if (!gameData) return null;
                  
                  return (
                    <div 
                      key={gameKey} 
                      className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setSelectedGame(gameKey)}
                      title={`Click to view detailed ${getGameDisplayName(gameKey)} results`}
                    >
                      <h4 className="font-medium text-gray-800 mb-2">
                        {gameKey === 'berryBlitz' && <span className="mr-2">🍓</span>}
                        {gameKey === 'patternMatch' && <span className="mr-2">🚀</span>}
                        {gameKey === 'kitchenQuest' && <span className="mr-2">👨‍🍳</span>}
                        {getGameDisplayName(gameKey)}
                      </h4>
                      <div className="text-2xl font-bold text-darkforest-600 mb-1">
                        {gameData.scores.adhd_composite.toFixed(1)}
                      </div>
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="text-xs text-darkforest-500 mt-1">Click to view details →</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darkforest-50 via-earth-50 to-darkforest-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-darkforest-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darkforest-50 via-earth-50 to-darkforest-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Results</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userResults || Object.keys(userResults).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darkforest-50 via-earth-50 to-darkforest-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Results Available</h1>
          <p className="text-gray-600 mb-4">Complete some assessments to see your results here.</p>
          <a href="/assessment" className="btn-primary">
            Start Assessment"
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkforest-50 via-earth-50 to-darkforest-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Assessment Results</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive analysis of your ADHD assessment performance across all games
            </p>
          </div>

          {/* Game Selection Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedGame('combined')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedGame === 'combined'
                  ? 'bg-darkforest-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Progress & Results
            </button>
            {userResults && Object.keys(userResults).map(game => (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedGame === game
                    ? 'bg-darkforest-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {game === 'berryBlitz' ? 'Berry Blitz' : 
                 game === 'patternMatch' ? 'Pattern Match' : 
                 game === 'kitchenQuest' ? 'Kitchen Quest' : game}
              </button>
            ))}
          </div>

          {/* Combined Results View */}
          {selectedGame === 'combined' && renderProgressSection()}

          {/* Individual Game Results */}
          {selectedGame !== 'combined' && userResults[selectedGame] && (
            <div className="space-y-8">
              {(() => {
                const gameData = userResults[selectedGame];
                if (!gameData) return null;
                
                return (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        {selectedGame === 'berryBlitz' ? 'Berry Blitz' : 
                         selectedGame === 'patternMatch' ? 'Pattern Match' : 
                         selectedGame === 'kitchenQuest' ? 'Kitchen Quest' : selectedGame} Results
                      </h2>
                    </div>

                    {/* Game Scores */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {renderScoreCard(
                        'Inattention',
                        gameData.scores.inattention,
                        'Difficulty sustaining attention and focus'
                      )}
                      {renderScoreCard(
                        'Hyperactivity',
                        gameData.scores.hyperactivity,
                        'Excessive movement and restlessness'
                      )}
                      {renderScoreCard(
                        'Impulsivity',
                        gameData.scores.impulsivity,
                        'Acting without thinking and poor impulse control'
                      )}
                      {renderScoreCard(
                        'Executive Function',
                        gameData.scores.executive_function,
                        'Planning, organization, and task management'
                      )}
                    </div>

                    {/* Game Performance Details */}
                    <div className="grid lg:grid-cols-2 gap-8">
                      {renderGameRoundsTable(gameData.rounds, selectedGame)}
                      {renderSelfReportTable(gameData.selfReport, selectedGame)}
                    </div>

                    {/* Game-Specific Insights */}
                    {renderGameInsights(gameData, selectedGame)}
                  </>
                );
              })()}
            </div>
          )}
        </motion.div>
      </div>

      {/* ADHD Score Interpretation Guide Modal */}
      {showInterpretationGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">ADHD Score Interpretation Guide</h2>
                <button
                  onClick={() => setShowInterpretationGuide(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score Range</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interpretation</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">0.0–1.9</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">No concern</td>
                      <td className="px-4 py-3 text-sm text-gray-600">No follow-up needed</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">2.0–3.9</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Low concern</td>
                      <td className="px-4 py-3 text-sm text-gray-600">No immediate concern; track over time</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-yellow-600">4.0–6.4</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Monitor symptoms</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Suggest monitoring or lifestyle adjustments</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-orange-600">6.5–8.4</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Moderate concern</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Recommend structured follow-up or screening</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-red-600">8.5–10.0</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">High concern</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Strongly recommend professional evaluation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-xs text-gray-500 mt-4 italic">
                Note: This assessment is for informational purposes only and should not replace professional medical evaluation.
              </p>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowInterpretationGuide(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

function calculatePatternMatchRoundScore(round: GameRound) {
  // Defensive: avoid division by zero
  const correctHits = round.correctHits ?? 0;
  const falsePositives = round.falsePositives ?? 0;
  const missedTargets = round.missedTargets ?? 0;
  // Compute correctSkips from totalTrials if available
  let correctSkips = 0;
  if (typeof round.totalTrials === 'number') {
    correctSkips = round.totalTrials - correctHits - falsePositives - missedTargets;
    if (correctSkips < 0) correctSkips = 0;
  }
  const totalTargets = correctHits + missedTargets;
  const totalNonTargets = correctSkips + falsePositives;
  const avgRT = round.averageReactionTimeMs ?? 0;
  const targetSwitchCount = round.targetSwitchCount ?? 0;
  const hitWeight = 1.0;
  const skipWeight = 0.5;
  const falsePositivePenalty = 0.7;
  const missPenalty = 1.0;
  const reactionTimePenalty = Math.max(0, (avgRT - 500) / 1000); // Example: penalize RT > 500ms
  const switchBonus = Math.min(targetSwitchCount * 0.1, 1.0); // Example: up to +1 bonus
  const difficultyWeight = round.roundDifficultyWeight ?? 1.0;
  const score = (
    (correctHits / (totalTargets || 1)) * hitWeight +
    (correctSkips / (totalNonTargets || 1)) * skipWeight -
    (falsePositives / (totalNonTargets || 1)) * falsePositivePenalty -
    (missedTargets / (totalTargets || 1)) * missPenalty -
    reactionTimePenalty +
    switchBonus
  ) * difficultyWeight;
  return Math.max(0, score).toFixed(2);
}

export default GameResultsPage;