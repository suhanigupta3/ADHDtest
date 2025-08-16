import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';

import type { GameRound } from './PatternMatch/types';

interface SelfReport {
  // BerryBlitz fields
  q1_focusDifficulty?: number;
  q2_forgetfulness?: number;
  q3_restlessness?: number;
  q4_impulsivity?: number;
  q5_followThrough?: number;
  // PatternMatch fields
  q1_focus_difficulty?: number;
  q2_careless_mistakes?: number;
  q3_act_without_thinking?: number;
  q4_rule_following_difficulty?: number;
  q5_mind_shifting?: number;
  // BounceBack fields (standardized)
  q2_impulsive_movements?: number;
  q3_frustration_level?: number;
  q4_planning_ability?: number;
  q5_persistence_motivation?: number;
  // FlutterFocus fields
  q1_flutter_focus_difficulty?: number;
  q2_flutter_impulsive_movements?: number;
  q3_flutter_frustration_level?: number;
  q4_flutter_planning_ability?: number;
  q5_flutter_persistence_motivation?: number;
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
  gameData?: any; // For BounceBack's additional game data
}

interface UserResults {
  berryBlitz?: GameData;
  patternMatch?: GameData;
  bounceBack?: GameData;
  flutterFocus?: GameData;
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);



  // Manual refresh function to clear cached data and re-fetch
  const handleManualRefresh = () => {

    setUserResults(null);
    setLoading(true);
    setError(null);
    setRefreshTrigger(prev => prev + 1); // This will trigger useEffect
  };

  // IMPORTANT MEDICAL DISCLAIMER
  const MedicalDisclaimer = () => (
    <div className="bg-forest-300/80 border border-forest-700 rounded-lg p-6 mb-8">
      <div className="flex items-start gap-3">
        <svg className="w-6 h-6 text-forest-900 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <h3 className="text-forest-900 font-bold text-lg mb-2 tracking-tight">Results Disclaimer</h3>
          <div className="text-forest-800 text-professional space-y-2">
            <p><strong>These results are for educational purposes only.</strong> They are not a medical diagnosis and should not be used to self-diagnose ADHD or any other condition.</p>
            <p><strong>The scores and interpretations provided are based on game performance, not clinical assessments.</strong> They do not constitute medical advice, diagnosis, or treatment recommendations.</p>
            <p><strong>If you have concerns about ADHD or other health conditions, please consult with qualified healthcare professionals.</strong> Only licensed medical professionals can provide proper diagnosis and treatment.</p>
            <p><strong>Never make medical decisions based on these results alone.</strong> Always seek professional medical guidance for health concerns.</p>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (!currentUser) {
      setError('Please log in to view your results.');
      setLoading(false);
      return;
    }

    const fetchUserResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
        const patternMatchDoc = await getDoc(doc(db, 'users', currentUser.uid, 'games', 'pattern-match'));
        if (patternMatchDoc.exists()) {
          const patternMatchData = patternMatchDoc.data();
          if (patternMatchData.scores && patternMatchData.selfReport) {
            let rounds: GameRound[] = [];
            try {
              const roundsSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'games', 'pattern-match', 'rounds'));
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
        // Fetch Bounce Back data
        const bounceBackDoc = await getDoc(doc(db, 'users', currentUser.uid, 'games', 'bounce-back'));
        if (bounceBackDoc.exists()) {
          const bounceBackData = bounceBackDoc.data();
          
          // Check for both old and new data structures
          const hasScores = bounceBackData.scores;
          const hasSelfReport = bounceBackData.selfReport;
          
          if (hasScores && hasSelfReport) {
            let rounds: GameRound[] = [];
            try {
              const roundsSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'games', 'bounce-back', 'rounds'));
              rounds = roundsSnapshot.docs.map(doc => doc.data() as GameRound);
            } catch (roundsError) {
              if (bounceBackData.rounds && Array.isArray(bounceBackData.rounds)) {
                rounds = bounceBackData.rounds;
              }
            }
            
            // Handle both data structures
            const scores = bounceBackData.scores || bounceBackData.gameData?.scores;
            const selfReport = bounceBackData.selfReport || bounceBackData.gameData?.selfReportResponses;
            const gameData = bounceBackData.gameData || bounceBackData;
            
            results.bounceBack = {
              scores: scores,
              selfReport: selfReport,
              rounds: rounds,
              gameData: gameData
            };
          }
        }
        
        // Fetch Flutter Focus data
        const flutterFocusDoc = await getDoc(doc(db, 'users', currentUser.uid, 'games', 'FlutterFocus'));
        if (flutterFocusDoc.exists()) {
          const flutterFocusData = flutterFocusDoc.data();
          
          // Check for selfReport in both possible locations
          const flutterSelfReport = flutterFocusData.selfReport || flutterFocusData.selfReportResponses;
          
          if (flutterFocusData.scores && flutterSelfReport) {
            // For FlutterFocus, we only want to show the 3 main levels, not all individual rounds
            // Create a simplified rounds array with just the 3 levels using real data
            const levelRounds: GameRound[] = [];
            
            // Try to get data from individual level documents first, then fall back to finalResults
            for (let i = 1; i <= 3; i++) {
              const levelData = flutterFocusData[`level${i}Data`];
              const finalLevelData = flutterFocusData.finalResults;
              
              levelRounds.push({
                roundScore: levelData?.score || finalLevelData?.levelScores?.[i-1] || 0,
                timeToComplete: levelData?.duration || 0,
                asteroidsHit: levelData?.livesLost || 0,
                asteroidsAvoided: levelData?.debrisAvoided || 0,
                aliensDefeated: 0,
                questionsAnswered: 0,
                questionsCorrect: 0,
                reactionTime: levelData?.reactionTime || 0,
                focusBreaks: 0,
                navigationErrors: 0,
                optimalPathDeviation: 0
              });
            }
            
            results.flutterFocus = {
              scores: flutterFocusData.scores,
              selfReport: flutterSelfReport,
              rounds: levelRounds
            };
          }
        }
        
        if (Object.keys(results).length > 0) {
          setUserResults(results);
        } else {
          setUserResults({});
          setError('No game data found for your account. Please play some games first.');
        }
      } catch (err) {
        setUserResults({});
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserResults();
  }, [currentUser, refreshTrigger]);

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
        // Ensure all scores are valid numbers before adding
        const inattention = Number(game.scores.inattention) || 0;
        const hyperactivity = Number(game.scores.hyperactivity) || 0;
        const impulsivity = Number(game.scores.impulsivity) || 0;
        const executive_function = Number(game.scores.executive_function) || 0;
        const adhd_composite = Number(game.scores.adhd_composite) || 0;
        
        combinedScores.inattention += inattention;
        combinedScores.hyperactivity += hyperactivity;
        combinedScores.impulsivity += impulsivity;
        combinedScores.executive_function += executive_function;
        combinedScores.adhd_composite += adhd_composite;
      }
    });

    const numGames = games.length;
    Object.keys(combinedScores).forEach(key => {
      combinedScores[key as keyof GameScores] /= numGames;
    });

    // Ensure all final scores are valid numbers
    Object.keys(combinedScores).forEach(key => {
      const score = combinedScores[key as keyof GameScores];
      if (isNaN(score) || !isFinite(score)) {
        console.warn(`Invalid combined score for ${key}:`, score);
        combinedScores[key as keyof GameScores] = 0;
      }
    });

    return combinedScores;
  };

  const getGameProgress = () => {
    if (!userResults) return { completed: 0, total: 4, percentage: 0, nextGame: null };
    const gameOrder = ['berryBlitz', 'patternMatch', 'bounceBack', 'flutterFocus'];
    
    gameOrder.forEach(game => {
      const gameData = userResults[game];
    });
    
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
      patternMatch: 'Signal Snap',
      bounceBack: 'Bounce Back',
      flutterFocus: 'Flutter Focus'
    };
    return nameMap[gameKey] || gameKey;
  };

  const getGameDescription = (gameKey: string) => {
    const descriptions: { [key: string]: string } = {
      berryBlitz: 'Navigate through obstacles to collect fruits while avoiding shurikens',
      patternMatch: 'Match patterns as quickly and accurately as possible',
      bounceBack: 'Break bricks with a bouncing ball while managing different mental states and challenges',
      flutterFocus: 'A fast-paced rhythm and timing challenge that tests your focus and coordination'
    };
    return descriptions[gameKey] || 'Complete this game to continue your assessment';
  };

  const getScoreInterpretation = (score: number): { level: string; color: string; description: string } => {
    // Handle edge cases and invalid scores
    if (score === null || score === undefined || isNaN(score) || !isFinite(score)) {
      console.warn('Invalid score detected:', score);
      return { 
        level: 'Invalid Score', 
        color: 'text-gray-600', 
        description: 'Score data unavailable' 
      };
    }

    // Clamp score to valid range and log if out of bounds
    const clampedScore = Math.max(0, Math.min(10, score));
    if (score !== clampedScore) {
      console.warn(`Score ${score} clamped to ${clampedScore} for Executive Function`);
    }

    if (clampedScore >= 0.0 && clampedScore <= 1.9) {
      return { 
        level: 'No Concern', 
        color: 'text-green-600', 
        description: 'No follow-up needed' 
      };
    } else if (clampedScore >= 2.0 && clampedScore <= 3.9) {
      return { 
        level: 'Low Concern', 
        color: 'text-green-600', 
        description: 'No immediate concern; track over time' 
      };
    } else if (clampedScore >= 4.0 && clampedScore <= 6.4) {
      return { 
        level: 'Monitor Symptoms', 
        color: 'text-yellow-600', 
        description: 'Suggest monitoring or lifestyle adjustments' 
      };
    } else if (clampedScore >= 6.5 && clampedScore <= 8.4) {
      return { 
        level: 'Moderate Concern', 
        color: 'text-amber-600', 
        description: 'Recommend structured follow-up or screening' 
      };
    } else if (clampedScore >= 8.5 && clampedScore <= 10.0) {
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
    
    // Handle invalid scores gracefully
    const displayScore = (score === null || score === undefined || isNaN(score) || !isFinite(score)) 
      ? 'N/A' 
      : Math.max(0, Math.min(10, score)).toFixed(1);
    
    return (
      <motion.div
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center justify-between mb-3">
          <span 
            className={`text-3xl font-bold ${interpretation.color} cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => setShowInterpretationGuide(true)}
            title="Click to view score interpretation guide"
          >
            {displayScore}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            interpretation.color.replace('text-', 'bg-').replace('-600', '-100')
          }`}>
            {interpretation.level}
          </span>
        </div>
        <p className="text-gray-700 text-sm font-medium">{description}</p>
        <p className={`text-sm mt-2 font-medium ${interpretation.color}`}>
          {interpretation.description}
        </p>
      </motion.div>
    );
  };

  const renderGameRoundsTable = (rounds: GameRound[], gameName: string) => {

    
    const gameNameDisplay = gameName === 'berryBlitz' ? 'Berry Blitz' : 
                           gameName === 'patternMatch' ? 'Signal Snap' : 
                           gameName === 'bounceBack' ? 'Bounce Back' : 
                           gameName === 'flutterFocus' ? 'Flutter Focus' : gameName;

    // Determine which fields to show based on game type
    const isBerryBlitz = gameName === 'berryBlitz';
    const isPatternMatch = gameName === 'patternMatch';
    const isBounceBack = gameName === 'bounceBack';
    const isFlutterFocus = gameName === 'flutterFocus';

    // If no rounds data, show a message instead of hiding the entire section
    if (!rounds || rounds.length === 0) {
      // For BounceBack, check if we have level data instead
      if (isBounceBack && userResults && userResults[gameName]) {
        const bounceBackData = (userResults[gameName] as any)?.gameData;
        const levelScores = bounceBackData?.levelScores || [];
        const levelCompletionTimes = bounceBackData?.levelCompletionTimes || [];
        
        console.log('[GameResultsPage] BounceBack level data check:', {
          hasUserResults: !!userResults,
          hasGameData: !!bounceBackData,
          levelScores,
          levelCompletionTimes,
          levelScoresLength: levelScores.length,
          levelTimesLength: levelCompletionTimes.length
        });
        
        if (levelScores.length > 0 || levelCompletionTimes.length > 0) {
          console.log('[GameResultsPage] ✅ Level data found, creating table');
          
          // Create level rounds data from real level data for BounceBack
          const maxLevels = Math.max(levelScores.length, levelCompletionTimes.length);
          const levelRounds = Array.from({ length: maxLevels }, (_, index) => ({
            level: index + 1,
            score: levelScores[index] || 0,
            completionTime: levelCompletionTimes[index] || 0
          }));
          
          console.log('[GameResultsPage] Created level rounds from real data:', levelRounds);
          
          return (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{gameNameDisplay} Level Performance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Level</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Time</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bricks Destroyed</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hits</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lives Lost</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {levelRounds.map((level, index) => {
                      // Get additional data from gameData if available
                      const gameData = (userResults?.[gameName] as any)?.gameData;
                      const levelBricksDestroyed = gameData?.levelBricksDestroyed?.[index] || 0;
                      const levelLivesLost = gameData?.levelLivesLost?.[index] || 0;
                      const levelTotalBricks = gameData?.levelTotalBricks?.[index] || gameData?.totalBricks || 0;
                      const levelTotalHits = gameData?.levelTotalHits?.[index] || 0;
                      
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            Level {level.level}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{level.score}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {level.completionTime ? formatTimeToReadable(level.completionTime / 1000) : '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {levelBricksDestroyed} / {levelTotalBricks}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {levelTotalHits}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {levelTotalBricks > 0 ? Math.round((levelBricksDestroyed / levelTotalBricks) * 100) : 0}%
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {levelLivesLost}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        } else {
          console.log('[GameResultsPage] ❌ No level data found, showing no data message');
        }
      }
      
      console.log('[GameResultsPage] Falling through to no data message');
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  {isFlutterFocus ? 'Level' : 'Round'}
                </th>
                
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

                {/* BounceBack specific columns */}
                {isBounceBack && (
                  <>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Time</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bricks Destroyed</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lives Lost</th>
                  </>
                )}

                {/* FlutterFocus specific columns */}
                {isFlutterFocus && (
                  <>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lives Lost</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debris Avoided</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reaction Time</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rounds.map((round, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {isFlutterFocus ? `Level ${index + 1}` : `Round ${index + 1}`}
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

                  {/* BounceBack specific data */}
                  {isBounceBack && userResults && (() => {
                    const bounceBackData = (userResults[gameName] as any)?.gameData;
                    const levelScores = bounceBackData?.levelScores || [];
                    const levelCompletionTimes = bounceBackData?.levelCompletionTimes || [];
                    const levelIndex = index;
                    
                    return (
                      <>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{levelScores[levelIndex] || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {levelCompletionTimes[levelIndex] ? formatTimeToReadable(levelCompletionTimes[levelIndex] / 1000) : '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {bounceBackData?.bricksDestroyed || '-'} / {bounceBackData?.totalBricks || '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{bounceBackData?.livesLost || '-'}</td>
                      </>
                    );
                  })()}

                  {/* FlutterFocus specific data */}
                  {isFlutterFocus && (
                    <>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{round.roundScore || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {round.timeToComplete ? formatTimeToReadable(round.timeToComplete / 1000) : '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{round.asteroidsHit || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{round.asteroidsAvoided || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {round.reactionTime ? `${round.reactionTime.toFixed(0)}ms` : '-'}
                      </td>
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
    if (questions.length === 0) {
      return null;
    }

    // Use different question keys/labels for different games
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
    } else if (gameName === 'bounceBack') {
      questionLabels = {
        q1_focus_difficulty: 'Focus Difficulty',
        q2_impulsive_movements: 'Impulsive Movements',
        q3_frustration_level: 'Frustration Level',
        q4_planning_ability: 'Planning Ability',
        q5_persistence_motivation: 'Persistence & Motivation',
      };
      questionOrder = [
        'q1_focus_difficulty',
        'q2_impulsive_movements',
        'q3_frustration_level',
        'q4_planning_ability',
        'q5_persistence_motivation',
      ];
    } else if (gameName === 'flutterFocus') {
      questionLabels = {
        q1_flutter_focus_difficulty: 'Focus Difficulty',
        q2_flutter_impulsive_movements: 'Impulsive Movements',
        q3_flutter_frustration_level: 'Frustration Level',
        q4_flutter_planning_ability: 'Planning Ability',
        q5_flutter_persistence_motivation: 'Persistence & Motivation',
      };
      questionOrder = [
        'q1_flutter_focus_difficulty',
        'q2_flutter_impulsive_movements',
        'q3_flutter_frustration_level',
        'q4_flutter_planning_ability',
        'q5_flutter_persistence_motivation',
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
                           gameName === 'patternMatch' ? 'Signal Snap' : 
                           gameName === 'bounceBack' ? 'Bounce Back' : gameName;

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
                            ? 'bg-sleek-500 text-white'
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
                           gameName === 'patternMatch' ? 'Signal Snap' : 
                           gameName === 'bounceBack' ? 'Bounce Back' : gameName;

    let insights = [];

    if (gameName === 'berryBlitz' && gameData.rounds.length > 0) {
      const avgTime = gameData.rounds.reduce((sum, r) => sum + (r.timeToTargetFruit || 0), 0) / gameData.rounds.length;
      const avgTotalDuration = gameData.rounds.reduce((sum, r) => sum + (r.totalRoundDuration || 0), 0) / gameData.rounds.length;
      const totalRedundant = gameData.rounds.reduce((sum, r) => sum + (r.redundantMoves || 0), 0);
      const totalCollisions = gameData.rounds.reduce((sum, r) => sum + (r.collisionsWithShuriken || 0), 0);
      const avgRoundScore = gameData.rounds.reduce((sum, r) => sum + (r.roundScore || 0), 0) / gameData.rounds.length;
      
      insights.push(
        <div key="time" className="flex justify-between items-center p-3 bg-sleek-50 rounded-lg">
          <span className="text-sm font-medium text-sleek-700">Average Time to Target</span>
          <span className="text-sm text-sleek-600 font-semibold">{formatTimeToReadable(avgTime / 1000)}</span>
        </div>,
        <div key="totalDuration" className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
          <span className="text-sm font-medium text-emerald-700">Average Total Round Duration</span>
          <span className="text-sm text-emerald-600 font-semibold">{formatTimeToReadable(avgTotalDuration / 1000)}</span>
        </div>,
        <div key="redundant" className="flex justify-between items-center p-3 bg-sleek-50 rounded-lg">
          <span className="text-sm font-medium text-sleek-700">Total Redundant Moves</span>
          <span className="text-sm text-sleek-600 font-semibold">{totalRedundant}</span>
        </div>,
        <div key="collisions" className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
          <span className="text-sm font-medium text-emerald-700">Total Collisions</span>
          <span className="text-sm text-emerald-600 font-semibold">{totalCollisions}</span>
        </div>,
        <div key="roundScore" className="flex justify-between items-center p-3 bg-sleek-50 rounded-lg">
          <span className="text-sm font-medium text-sleek-700">Average Round Score</span>
          <span className="text-sm text-sleek-600 font-semibold">{avgRoundScore.toFixed(1)}</span>
        </div>
      );
    }

    // Signal Snap (patternMatch) insights
    if (gameName === 'patternMatch' && gameData.rounds.length > 0) {
      const totalRounds = gameData.rounds.length;
      const totalTrials = gameData.rounds.reduce((sum, r) => sum + (r.totalTrials || 0), 0);
      const totalCorrect = gameData.rounds.reduce((sum, r) => sum + (r.correctHits || 0), 0);
      const totalFalseAlarms = gameData.rounds.reduce((sum, r) => sum + (r.falsePositives || 0), 0);
      const totalMissed = gameData.rounds.reduce((sum, r) => sum + (r.missedTargets || 0), 0);
      const avgAccuracy = totalTrials > 0 ? (totalCorrect / totalTrials) * 100 : 0;
      const avgReactionTime = gameData.rounds.reduce((sum, r) => sum + (r.averageReactionTimeMs || 0), 0) / totalRounds;

      insights.push(
        <div key="accuracy" className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
          <span className="text-sm font-medium text-emerald-700">Average Accuracy</span>
          <span className="text-sm text-emerald-600 font-semibold">{Math.round(avgAccuracy)}%</span>
        </div>,
        <div key="reactionTime" className="flex justify-between items-center p-3 bg-sleek-50 rounded-lg">
          <span className="text-sm font-medium text-sleek-700">Average Reaction Time</span>
          <span className="text-sm text-sleek-600 font-semibold">{isNaN(avgReactionTime) ? 'N/A' : Math.round(avgReactionTime) + ' ms'}</span>
        </div>,
        <div key="correctHits" className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
          <span className="text-sm font-medium text-emerald-700">Total Correct Hits</span>
          <span className="text-sm text-emerald-600 font-semibold">{totalCorrect}</span>
        </div>,
        <div key="falseAlarms" className="flex justify-between items-center p-3 bg-sleek-50 rounded-lg">
          <span className="text-sm font-medium text-sleek-700">Total False Alarms</span>
          <span className="text-sm text-sleek-600 font-semibold">{totalFalseAlarms}</span>
        </div>,
        <div key="missedTargets" className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
          <span className="text-sm font-medium text-emerald-700">Total Missed Targets</span>
          <span className="text-sm text-emerald-600 font-semibold">{totalMissed}</span>
        </div>
      );
    }

    // FlutterFocus insights
    if (gameName === 'flutterFocus' && gameData.rounds.length > 0) {
      const totalRounds = gameData.rounds.length;
      const totalScore = gameData.rounds.reduce((sum, r) => sum + (r.score || 0), 0);
      const totalLivesLost = gameData.rounds.reduce((sum, r) => sum + (r.livesLost || 0), 0);
      const totalDebrisAvoided = gameData.rounds.reduce((sum, r) => sum + (r.debrisAvoided || 0), 0);
      const totalDebrisHit = gameData.rounds.reduce((sum, r) => sum + (r.debrisHit || 0), 0);
      const avgReactionTime = gameData.rounds.reduce((sum, r) => sum + (r.reactionTime || 0), 0) / totalRounds;
      const avgDuration = gameData.rounds.reduce((sum, r) => sum + (r.duration || 0), 0) / totalRounds;
      const overallAccuracy = totalDebrisAvoided > 0 ? (totalDebrisAvoided / (totalDebrisAvoided + totalDebrisHit)) * 100 : 0;
      
      insights.push(
        <div key="totalScore" className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
          <span className="text-sm font-medium text-emerald-700">Total Score</span>
          <span className="text-sm text-emerald-600 font-semibold">{totalScore}</span>
        </div>,
        <div key="avgDuration" className="flex justify-between items-center p-3 bg-sleek-50 rounded-lg">
          <span className="text-sm font-medium text-sleek-700">Average Level Duration</span>
          <span className="text-sm text-sleek-600 font-semibold">{formatTimeToReadable(avgDuration / 1000)}</span>
        </div>,
        <div key="livesLost" className="flex justify-between items-center p-3 bg-sleek-50 rounded-lg">
          <span className="text-sm font-medium text-sleek-700">Total Lives Lost</span>
          <span className="text-sm text-sleek-600 font-semibold">{totalLivesLost}</span>
        </div>,
        <div key="debrisAvoided" className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
          <span className="text-sm font-medium text-emerald-700">Debris Avoided</span>
          <span className="text-sm text-emerald-600 font-semibold">{totalDebrisAvoided}</span>
        </div>,
        <div key="debrisHit" className="flex justify-between items-center p-3 bg-sleek-50 rounded-lg">
          <span className="text-sm font-medium text-sleek-700">Debris Collisions</span>
          <span className="text-sm text-sleek-600 font-semibold">{totalDebrisHit}</span>
        </div>,
        <div key="accuracy" className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
          <span className="text-sm font-medium text-emerald-700">Overall Accuracy</span>
          <span className="text-sm text-emerald-600 font-semibold">{overallAccuracy.toFixed(1)}%</span>
        </div>,
        <div key="reactionTime" className="flex justify-between items-center p-3 bg-sleek-50 rounded-lg">
          <span className="text-sm font-medium text-emerald-700">Average Reaction Time</span>
          <span className="text-sm text-emerald-600 font-semibold">{Math.round(avgReactionTime)}ms</span>
        </div>
      );
    }

    // Bounce Back insights
    if (gameName === 'bounceBack' && (gameData as any).gameData) {
      const bounceBackData = (gameData as any).gameData;
      const totalPlayTime = bounceBackData.totalPlayTime || 0;
      const bricksDestroyed = bounceBackData.bricksDestroyed || 0;
      const totalBricks = bounceBackData.totalBricks || 0;
      const accuracy = bounceBackData.accuracy || 0;
      const averageReactionTime = bounceBackData.averageReactionTime || 0;
      const paddleHits = bounceBackData.paddleHits || 0;
      const wallHits = bounceBackData.wallHits || 0;
      const livesLost = bounceBackData.livesLost || 0;
      const finalScore = bounceBackData.finalScore || 0;
      const paddleMovements = bounceBackData.paddleMovements || 0;
      const levelScores = bounceBackData.levelScores || [];
      const levelCompletionTimes = bounceBackData.levelCompletionTimes || [];
      
      // Calculate total bricks across all levels for accurate display
      const levelTotalBricks = bounceBackData.levelTotalBricks || [];
      const totalBricksAcrossLevels = levelTotalBricks.reduce((sum: number, bricks: number) => sum + bricks, 0);
      const displayTotalBricks = totalBricksAcrossLevels > 0 ? totalBricksAcrossLevels : totalBricks;

      insights.push(

        <div key="bricksDestroyed" className="flex justify-between items-center p-3 bg-sleek-50 rounded-lg">
          <span className="text-sm font-medium text-sleek-700">Bricks Destroyed</span>
          <span className="text-sm text-sleek-600 font-semibold">{bricksDestroyed} / {displayTotalBricks}</span>
        </div>,
        <div key="reactionTime" className="flex justify-between items-center p-3 bg-sleek-50 rounded-lg">
          <span className="text-sm font-medium text-sleek-700">Average Reaction Time</span>
          <span className="text-sm text-sleek-600 font-semibold">{Math.round(averageReactionTime)}ms</span>
        </div>,
        <div key="paddleHits" className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
          <span className="text-sm font-medium text-emerald-700">Successful Paddle Hits</span>
          <span className="text-sm text-emerald-600 font-semibold">{paddleHits}</span>
        </div>,
        <div key="wallHits" className="flex justify-between items-center p-3 bg-sleek-50 rounded-lg">
          <span className="text-sm font-medium text-emerald-700">Wall Hits</span>
          <span className="text-sm text-emerald-600 font-semibold">{wallHits}</span>
        </div>,
        <div key="livesLost" className="flex justify-between items-center p-3 bg-sleek-50 rounded-lg">
          <span className="text-sm font-medium text-sleek-700">Lives Lost</span>
          <span className="text-sm text-emerald-600 font-semibold">{livesLost}</span>
        </div>,
        <div key="finalScore" className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
          <span className="text-sm font-medium text-emerald-700">Final Score</span>
          <span className="text-sm text-emerald-600 font-semibold">{finalScore}</span>
        </div>,

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
        </div>

        {/* Progress Bar */}
        <div className="card-dark p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-forest-900 mb-2">
              {progress.completed} of {progress.total} Games Completed
            </h2>
            <div className="text-4xl font-bold text-sleek-300 mb-2">
              {progress.percentage.toFixed(0)}%
            </div>
            <p className="text-sage-200">
              {progress.completed === progress.total 
                ? 'All games completed! View your combined results below.'
                : `${progress.total - progress.completed} game${progress.total - progress.completed > 1 ? 's' : ''} remaining`
              }
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-sage-800 rounded-full h-4 mb-6">
            <div 
              className="bg-gradient-to-r from-sleek-500 to-emerald-500 h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>

          {/* Game Status Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {progress.gameOrder?.map((gameKey, index) => {
              const isCompleted = progress.completedGames?.includes(gameKey) || false;
              const isNext = progress.nextGame === gameKey;
              const isLocked = !isCompleted && !isNext;
              
              return (
                <motion.div
                  key={gameKey}
                  className={`card-dark p-6 relative ${
                    isCompleted 
                      ? 'border-emerald-400 bg-emerald-900/30' 
                      : isNext 
                        ? 'border-sleek-400 bg-sleek-900/30' 
                        : 'border-sage-600 bg-sage-900/30'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {isCompleted ? (
                      <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        ✓ Completed
                      </div>
                    ) : isNext ? (
                      <div className="bg-sleek-500 text-white px-2 py-1 rounded-full text-xs font-medium">
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
                      ? 'bg-emerald-100 text-emerald-600' 
                      : isNext 
                        ? 'bg-sleek-100 text-sleek-600' 
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

                  <h3 className="text-lg font-semibold text-sage-100 mb-2 text-center">
                    {gameKey === 'berryBlitz' && (
                      <svg className="w-6 h-6 inline mr-2 text-sleek-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C13.1 2 14 2.9 14 4s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 4c2.2 0 4 1.8 4 4v2h-2V10c0-1.1-.9-2-2-2s-2 .9-2 2v2H8V10c0-2.2 1.8-4 4-4z"/>
                      </svg>
                    )}
                    {gameKey === 'patternMatch' && (
                      <svg className="w-6 h-6 inline mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    )}
                    {gameKey === 'bounceBack' && (
                      <svg className="w-6 h-6 inline mr-2 text-sleek-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C13.1 2 14 2.9 14 4s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 4c2.2 0 4 1.8 4 4v2h-2V10c0-1.1-.9-2-2-2s-2 .9-2 2v2H8V10c0-2.2 1.8-4 4-4zm-2 8v6h8v-6h-8z"/>
                      </svg>
                    )}
                    {gameKey === 'flutterFocus' && (
                      <svg className="w-6 h-6 inline mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C13.1 2 14 2.9 14 4s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 4c2.2 0 4 1.8 4 4v2h-2V10c0-1.1-.9-2-2-2s-2 .9-2 2v2H8V10c0-2.2 1.8-4 4-4zm-2 8v6h8v-6h-8z"/>
                      </svg>
                    )}
                    {getGameDisplayName(gameKey)}
                  </h3>
                  
                  <p className="text-sage-200 text-sm text-center mb-4">
                    {getGameDescription(gameKey)}
                  </p>

                  {isCompleted && userResults && userResults[gameKey] && (
                    <div 
                      className="text-center cursor-pointer hover:bg-emerald-800/50 transition-colors duration-200 rounded-lg p-2"
                      onClick={() => setSelectedGame(gameKey)}
                      title={`Click to view detailed ${getGameDisplayName(gameKey)} results`}
                    >
                      <div className="text-2xl font-bold text-emerald-300 mb-1">
                        {userResults[gameKey]?.scores?.adhd_composite?.toFixed(1) || 'N/A'}
                      </div>
                      <p className="text-sm text-sage-200">Composite Score</p>
                      <p className="text-xs text-emerald-400 mt-1">Click to view details →</p>
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
                      <p className="text-sm text-sage-300">
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
              <div className="card-dark p-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-forest-900 mb-4 flex items-center gap-2 tracking-tight">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  All Games Completed!
                </h2>
                <p className="text-lg text-sage-200 mb-6">
                  Congratulations! You've completed all assessment games. Here's your comprehensive ADHD profile:
                </p>
                
                <div className="text-6xl font-bold text-sleek-300 mb-4">
                  {combinedScores?.adhd_composite?.toFixed(1) || 'N/A'}
                </div>
                <p className="text-lg text-sage-200 mb-6">
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
                Complete all {progress.total} games to receive your comprehensive A(rDx)HD assessment results and clinical recommendations.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
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
                        {gameKey === 'berryBlitz' && (
                          <svg className="w-5 h-5 inline mr-2 text-sleek-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C13.1 2 14 2.9 14 4s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 4c2.2 0 4 1.8 4 4v2h-2V10c0-1.1-.9-2-2-2s-2 .9-2 2v2H8V10c0-2.2 1.8-4 4-4zm-2 8v6h8v-6h-8z"/>
                          </svg>
                        )}
                        {gameKey === 'patternMatch' && (
                          <svg className="w-5 h-5 inline mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                          </svg>
                        )}
                        {gameKey === 'bounceBack' && (
                          <svg className="w-5 h-5 inline mr-2 text-sleek-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C13.1 2 14 2.9 14 4s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 4c2.2 0 4 1.8 4 4v2h-2V10c0-1.1-.9-2-2-2s-2 .9-2 2v2H8V10c0-2.2 1.8-4 4-4zm-2 8v6h8v-6h-8z"/>
                          </svg>
                        )}
                        {gameKey === 'flutterFocus' && (
                          <svg className="w-5 h-5 inline mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C13.1 2 14 2.9 14 4s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 4c2.2 0 4 1.8 4 4v2h-2V10c0-1.1-.9-2-2-2s-2 .9-2 2v2H8V10c0-2.2 1.8-4 4-4zm-2 8v6h8v-6h-8z"/>
                          </svg>
                        )}
                        {getGameDisplayName(gameKey)}
                      </h4>
                      <div className="text-2xl font-bold text-sleek-300 mb-1">
                        {gameData.scores?.adhd_composite?.toFixed(1) || 'N/A'}
                      </div>
                      <p className="text-sm text-sage-200">Score</p>
                      <p className="text-xs text-sleek-400 mt-1">Click to view details →</p>
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
      <div className="min-h-screen bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-forest-900 mb-4">Error Loading Results</h1>
          <p className="text-emerald-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userResults || Object.keys(userResults).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-emerald-400 text-6xl mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h18v2H3V3m1 4h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7m4 3v2h8v-2H7m0 4v2h8v-2H7z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-forest-900 mb-4">No Results Available</h1>
          <p className="text-emerald-700 mb-4">Complete some assessments to see your results here.</p>
          <a href="/assessment" className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300">
            Start Assessment
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-100 to-forest-200">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
              <div></div> {/* Spacer */}
              <h1 className="text-4xl font-bold text-forest-900">Your Assessment Results</h1>
              <button
                onClick={handleManualRefresh}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 text-sm"
                title="Refresh data from Firebase"
              >
                🔄 Refresh
              </button>
            </div>
            <p className="text-lg text-forest-700 max-w-3xl mx-auto mb-2">
              Comprehensive analysis of your A(rDx)HD assessment performance across all games
            </p>
            <p className="text-lg text-forest-700 max-w-3xl mx-auto">
              Complete all games to get your comprehensive A(rDx)HD assessment results
            </p>
          </div>

          {/* Game Selection Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedGame('combined')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedGame === 'combined'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white'
                  : 'bg-forest-100 text-forest-800 hover:bg-emerald-100 border border-emerald-300'
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
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white'
                    : 'bg-forest-100 text-forest-800 hover:bg-emerald-100 border border-emerald-300'
                }`}
              >
                {game === 'berryBlitz' ? 'Berry Blitz' : 
                 game === 'patternMatch' ? 'Signal Snap' : 
                 game === 'bounceBack' ? 'Bounce Back' : 
                 game === 'flutterFocus' ? 'Flutter Focus' : game}
              </button>
            ))}
          </div>

          {/* No Data Notice */}
          {error && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-blue-800 font-semibold">No Data Available</h3>
                  <p className="text-blue-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

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
                      <h2 className="text-3xl font-bold text-forest-900 mb-2">
                        {selectedGame === 'berryBlitz' ? 'Berry Blitz' : 
                         selectedGame === 'patternMatch' ? 'Signal Snap' : 
                         selectedGame === 'bounceBack' ? 'Bounce Back' : 
                         selectedGame === 'flutterFocus' ? 'Flutter Focus' : selectedGame} Results
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

        {/* Medical Disclaimer */}
        <div className="mt-12">
          <MedicalDisclaimer />
        </div>
      </div>

      {/* ADHD Score Interpretation Guide Modal */}
      {showInterpretationGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-sage-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-sage-700"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">ADHD Score Interpretation Guide</h2>
                <button
                  onClick={() => setShowInterpretationGuide(false)}
                  className="text-sage-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-sleek-900/50 rounded-lg p-4 border border-sleek-700">
                  <h3 className="text-lg font-semibold text-sleek-400 mb-2">Score Ranges:</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-emerald-400 font-medium">0-30: Low</span>
                      <p className="text-sage-200 mt-1">Typical performance, minimal ADHD symptoms</p>
                    </div>
                    <div>
                      <span className="text-amber-400 font-medium">31-60: Moderate</span>
                      <p className="text-sage-200 mt-1">Some difficulties, may benefit from strategies</p>
                    </div>
                    <div>
                      <span className="text-red-400 font-medium">61-100: High</span>
                      <p className="text-sage-200 mt-1">Significant difficulties, consider professional evaluation</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-sage-200 text-sm leading-relaxed">
                  <p className="mb-4">
                    <strong className="text-sleek-400">Important:</strong> These scores are for educational purposes only and should not replace professional medical advice. 
                    Always consult with qualified healthcare providers for proper diagnosis and treatment.
                  </p>
                  <p>
                    Your scores reflect performance on specific cognitive tasks and may vary based on factors such as fatigue, 
                    stress, or environmental conditions. Consider these results as part of a broader assessment of your cognitive patterns.
                  </p>
                </div>
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