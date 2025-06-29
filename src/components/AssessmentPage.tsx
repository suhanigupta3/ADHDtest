import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import UnityGameIframe from './UnityGameIframe';

interface GameProgress {
  game1Completed: boolean;
  game2Completed: boolean;
  game3Completed: boolean;
  completedAt?: any;
  allGamesCompleted: boolean;
}

interface Game {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  color: string;
  gradientClass: string;
  icon: string | React.ReactNode;
}

const games: Game[] = [
  {
    id: 'berry-blitz',
    title: 'Berry Blitz',
    description: 'Test your attention and focus by collecting specific fruits while avoiding obstacles.',
    instructions: [
      'Control a red panda on a 5x5 grid',
      'Collect the target fruit (lemons, strawberries, or oranges)',
      'Avoid moving shurikens to stay safe',
      'Complete 3 rounds with different target fruits',
      'Non-target fruits don\'t count toward your score'
    ],
    color: 'from-darkforest-500 to-emerald-600',
    gradientClass: 'bg-gradient-to-br from-darkforest-500 to-emerald-600',
    icon: (
      <div className="w-14 h-14 flex items-center justify-center">
        <img 
          src="/unity-builds/berry-blitz/Player.png" 
          alt="Player Character" 
          className="w-14 h-14 object-contain"
          onError={(e) => {
            console.error('Failed to load Player.png');
            // Hide the image and show fallback
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
          onLoad={() => console.log('Player.png loaded successfully')}
        />
        <span 
          className="text-3xl hidden" 
          style={{ display: 'none' }}
          title="Player icon fallback"
        >
          🐼
        </span>
      </div>
    )
  },
      {
      id: 'kitchen-quest',
      title: 'Kitchen Quest',
      description: 'Test your multitasking abilities and working memory with multiple cooking orders.',
    instructions: [
      'Manage multiple customer orders simultaneously',
      'Remember different recipes and ingredients',
      'Complete orders within time limits',
      'Balance speed with accuracy',
      'Track multiple tasks at once'
    ],
    color: 'from-amber-600 to-yellow-700',
    gradientClass: 'bg-gradient-to-br from-amber-600 to-yellow-700',
    icon: '👨‍🍳'
  },
  {
    id: 'astrodrift',
    title: 'Astrodrift',
    description: 'Navigate through space while avoiding obstacles and answering diagnostic questions.',
    instructions: [
      'Control an astronaut through space',
      'Avoid pillar rocks and obstacles',
      'Click on aliens to defeat them',
      'Answer diagnostic questions when prompted',
      'Maintain focus while multitasking'
    ],
    color: 'from-green-700 to-teal-600',
    gradientClass: 'bg-gradient-to-br from-green-700 to-teal-600',
    icon: '🚀'
  }
];

const AssessmentPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [gameProgress, setGameProgress] = useState<GameProgress>({
    game1Completed: false,
    game2Completed: false,
    game3Completed: false,
    allGamesCompleted: false
  });
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const loadGameProgress = useCallback(async () => {
    if (!currentUser) return;

    try {
      const docRef = doc(db, 'gameProgress', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setGameProgress(docSnap.data() as GameProgress);
      } else {
        // Initialize progress document
        const initialProgress: GameProgress = {
          game1Completed: false,
          game2Completed: false,
          game3Completed: false,
          allGamesCompleted: false
        };
        await setDoc(docRef, initialProgress);
        setGameProgress(initialProgress);
      }
    } catch (error) {
      console.error('Error loading game progress:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadGameProgress();
  }, [loadGameProgress]);

  const updateGameProgress = async (gameId: string) => {
    if (!currentUser) return;

    try {
      const docRef = doc(db, 'gameProgress', currentUser.uid);
      const updates: any = {};

      if (gameId === 'berry-blitz') {
        updates.game1Completed = true;
      } else if (gameId === 'kitchen-quest') {
        updates.game2Completed = true;
      } else if (gameId === 'astrodrift') {
        updates.game3Completed = true;
      }

      // Check if all games will be completed
      const newProgress = { ...gameProgress, ...updates };
      if (newProgress.game1Completed && newProgress.game2Completed && newProgress.game3Completed) {
        updates.allGamesCompleted = true;
        updates.completedAt = new Date();
      }

      await updateDoc(docRef, updates);
      setGameProgress(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating game progress:', error);
    }
  };

  const isGameUnlocked = (gameIndex: number): boolean => {
    if (gameIndex === 0) return true; // First game always unlocked
    if (gameIndex === 1) return gameProgress.game1Completed;
    if (gameIndex === 2) return gameProgress.game2Completed;
    return false;
  };

  const launchGame = (game: Game) => {
    // For now, we'll show a modal. Later this can be replaced with iframe/WebGL
    console.log("🎮 Launching game:", game.title, "with userId:", currentUser?.uid || 'anonymous');
    setSelectedGame(game);
    // In a real implementation, you might do:
    // window.open(`/games/${game.id}`, '_blank');
  };

  const closeGameModal = () => {
    setSelectedGame(null);
  };

  const markGameCompleted = (gameId: string) => {
    updateGameProgress(gameId);
    closeGameModal();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darkforest-50 via-earth-50 to-darkforest-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-darkforest-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkforest-50 via-earth-50 to-darkforest-100">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h1 className="text-4xl font-bold text-gradient mb-6">ADHD Assessment Games</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              Complete these interactive games to assess your attention, focus, and cognitive patterns. 
              Games unlock progressively as you complete each one.
            </p>
            
            {/* Results Link */}
            <div className="flex justify-center">
              <Link 
                to="/results" 
                className="inline-flex items-center px-6 py-3 bg-white text-darkforest-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Your Results
              </Link>
            </div>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div className="mb-12" variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Progress</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-darkforest-600 to-earth-600 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(Object.values(gameProgress).filter(Boolean).length / 3) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {Object.values(gameProgress).filter(Boolean).length}/3 Games Completed
                </span>
              </div>
            </div>
          </motion.div>

          {/* Games Grid */}
          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-12"
            variants={containerVariants}
          >
            {games.map((game, index) => {
              const isUnlocked = isGameUnlocked(index);
              const isCompleted = 
                (index === 0 && gameProgress.game1Completed) ||
                (index === 1 && gameProgress.game2Completed) ||
                (index === 2 && gameProgress.game3Completed);

              return (
                <motion.div
                  key={game.id}
                  variants={itemVariants}
                  className={`relative group ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  onClick={() => isUnlocked && launchGame(game)}
                >
                  <div className={`
                    bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300
                    ${isUnlocked ? 'hover:shadow-xl hover:scale-105' : 'opacity-50'}
                    ${isCompleted ? 'ring-2 ring-green-500' : ''}
                  `}>
                    {/* Game Icon/Header */}
                    <div className={`${game.gradientClass} p-6 text-white relative`}>
                      <div className="mb-2 flex items-center h-16">
                        {typeof game.icon === 'string' ? (
                          <span className="text-4xl">{game.icon}</span>
                        ) : (
                          game.icon
                        )}
                      </div>
                      <h3 className="text-xl font-bold">{game.title}</h3>
                      
                      {/* Lock/Completion Status */}
                      <div className="absolute top-4 right-4">
                        {!isUnlocked && (
                          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {isCompleted && (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Game Description */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">{game.description}</p>
                      
                      {/* Instructions on Hover */}
                      <div className="group-hover:block hidden">
                        <h4 className="font-semibold text-gray-800 mb-2">How to Play:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {game.instructions.map((instruction, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-darkforest-600 mr-2">•</span>
                              {instruction}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Status */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {!isUnlocked && (
                          <span className="text-sm text-gray-400">Complete previous game to unlock</span>
                        )}
                        {isUnlocked && !isCompleted && (
                          <span className="text-sm text-darkforest-600 font-medium">Click to start game</span>
                        )}
                        {isCompleted && (
                          <span className="text-sm text-green-600 font-medium">✓ Completed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Completion Message */}
          {gameProgress.allGamesCompleted && (
            <motion.div 
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-8 text-white text-center"
              variants={itemVariants}
            >
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-4">Congratulations!</h3>
              <p className="text-lg mb-6">
                You've completed all assessment games. Your personalized ADHD insights and recommendations are being prepared.
              </p>
              <Link 
                to="/results" 
                className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                View Your Results
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Game Modal */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-auto max-h-[90vh] overflow-hidden"
            style={{ minWidth: '1000px' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className={`${selectedGame.gradientClass} text-white p-6 flex justify-between items-center`}>
              <h2 className="text-2xl font-bold">{selectedGame.title}</h2>
              <button
                onClick={closeGameModal}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center">
              {/* Unity Game Component - Using iframe for better compatibility */}
              <UnityGameIframe
                gameId={selectedGame.id}
                gameName={selectedGame.title}
                buildPath={`/unity-builds/${selectedGame.id}`}
                userId={currentUser?.uid}
                onGameComplete={() => markGameCompleted(selectedGame.id)}
                onError={(error) => {
                  console.error('Unity game error:', error);
                  // You could show a fallback or error message here
                }}
                width="960px"
                height="540px"
              />
              
              {/* Fallback Controls */}
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => markGameCompleted(selectedGame.id)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark as Completed (Demo)
                </button>
                <button
                  onClick={closeGameModal}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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

export default AssessmentPage; 