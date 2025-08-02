import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import GameWrapper from './GameWrapper';
import { useDisclaimer } from '../hooks/useDisclaimer';

interface GameProgress {
  game1Completed: boolean;
  game2Completed: boolean;
  game3Completed: boolean;
  game4Completed: boolean;
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
      'Control a red panda on a 5x5 grid using the arrow keys (up, down, left, right)',
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
        <svg 
          className="w-14 h-14 hidden text-emerald-500" 
          style={{ display: 'none' }}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    )
  },
  {
    id: 'pattern-match',
          title: 'Signal Snap',
    description: 'Test your pattern recognition and reaction time by matching colored signals in sequence.',
    instructions: [
      'Watch for the target pattern shown at the top',
      'Click signals in the correct order as they appear',
      'Faster reactions earn more points',
      'Complete patterns to level up',
      'You have 60 seconds to score as high as possible'
    ],
    color: 'from-sleek-500 to-emerald-600',
    gradientClass: 'bg-gradient-to-br from-sleek-500 to-emerald-600',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 32 32">
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="patternGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <radialGradient id="signalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Background glow */}
        <circle cx="16" cy="16" r="14" fill="url(#signalGlow)" opacity="0.4"/>
        
        {/* Main signal/pattern matching concept */}
        {/* Left side - Target pattern */}
        <g transform="translate(4, 8)">
          {/* Target shape (star) */}
          <path d="M8 2 L10 6 L14 6 L11 9 L12 13 L8 11 L4 13 L5 9 L2 6 L6 6 Z" 
                fill="url(#signalGradient)" opacity="0.9"/>
          {/* Target pattern (checkered) */}
          <rect x="3" y="3" width="2" height="2" fill="#FFFFFF" opacity="0.8"/>
          <rect x="7" y="3" width="2" height="2" fill="#FFFFFF" opacity="0.8"/>
          <rect x="5" y="5" width="2" height="2" fill="#FFFFFF" opacity="0.8"/>
          <rect x="3" y="7" width="2" height="2" fill="#FFFFFF" opacity="0.8"/>
          <rect x="7" y="7" width="2" height="2" fill="#FFFFFF" opacity="0.8"/>
        </g>
        
        {/* Right side - Matching stimulus */}
        <g transform="translate(20, 8)">
          {/* Matching shape (star) */}
          <path d="M8 2 L10 6 L14 6 L11 9 L12 13 L8 11 L4 13 L5 9 L2 6 L6 6 Z" 
                fill="url(#patternGradient)" opacity="0.9"/>
          {/* Matching pattern (checkered) */}
          <rect x="3" y="3" width="2" height="2" fill="#FFFFFF" opacity="0.8"/>
          <rect x="7" y="3" width="2" height="2" fill="#FFFFFF" opacity="0.8"/>
          <rect x="5" y="5" width="2" height="2" fill="#FFFFFF" opacity="0.8"/>
          <rect x="3" y="7" width="2" height="2" fill="#FFFFFF" opacity="0.8"/>
          <rect x="7" y="7" width="2" height="2" fill="#FFFFFF" opacity="0.8"/>
        </g>
        
        {/* Connection line with signal effect */}
        <path d="M16 12 Q16 10 16 8" stroke="#3B82F6" strokeWidth="2" fill="none" opacity="0.8"/>
        <path d="M16 8 Q16 10 16 12" stroke="#8B5CF6" strokeWidth="1.5" fill="none" opacity="0.6"/>
        
        {/* Signal waves/pulses */}
        <circle cx="16" cy="10" r="1" fill="#06B6D4" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="16" cy="10" r="2" fill="#06B6D4" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        
        {/* Snap effect - lightning bolt */}
        <path d="M14 18 L16 16 L18 18 L16 20 Z" fill="#F59E0B" opacity="0.9"/>
        <path d="M15 17 L17 17" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.8"/>
        
        {/* Additional pattern elements */}
        <g transform="translate(8, 22)">
          {/* Circle with dots pattern */}
          <circle cx="4" cy="4" r="3" fill="none" stroke="#8B5CF6" strokeWidth="1" opacity="0.6"/>
          <circle cx="3" cy="3" r="0.5" fill="#8B5CF6" opacity="0.8"/>
          <circle cx="5" cy="3" r="0.5" fill="#8B5CF6" opacity="0.8"/>
          <circle cx="4" cy="5" r="0.5" fill="#8B5CF6" opacity="0.8"/>
        </g>
        
        <g transform="translate(20, 22)">
          {/* Square with stripes pattern */}
          <rect x="1" y="1" width="6" height="6" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.6"/>
          <rect x="1" y="2" width="6" height="1" fill="#10B981" opacity="0.8"/>
          <rect x="1" y="4" width="6" height="1" fill="#10B981" opacity="0.8"/>
          <rect x="1" y="6" width="6" height="1" fill="#10B981" opacity="0.8"/>
        </g>
        
        {/* Energy lines radiating from center */}
        <path d="M2 16 L6 16" stroke="#3B82F6" strokeWidth="1" opacity="0.6"/>
        <path d="M26 16 L30 16" stroke="#8B5CF6" strokeWidth="1" opacity="0.6"/>
        <path d="M16 2 L16 6" stroke="#06B6D4" strokeWidth="1" opacity="0.6"/>
        <path d="M16 26 L16 30" stroke="#10B981" strokeWidth="1" opacity="0.6"/>
        
        {/* Focus indicator */}
        <circle cx="16" cy="16" r="1" fill="#F59E0B" opacity="0.9">
          <animate attributeName="r" values="1;1.5;1" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    )
  },
      {
      id: 'kitchen-quest',
    title: 'Bounce Back',
    description: 'Break bricks with a bouncing ball while managing different mental states and challenges.',
    instructions: [
      'Control the paddle to bounce the ball and break bricks',
      'Each brick type represents different mental states and challenges',
      'Complete 3 levels to finish the assessment',
      'Answer questions about your experience after each level'
    ],
    color: 'from-emerald-500 to-sleek-600',
    gradientClass: 'bg-gradient-to-br from-emerald-500 to-sleek-600',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 32 32">
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="paddleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="ballGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>
          <linearGradient id="brickGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Background glow */}
        <circle cx="16" cy="16" r="14" fill="url(#glowGradient)" opacity="0.3"/>
        
        {/* Multiple bricks in different colors */}
        <rect x="6" y="2" width="6" height="2" rx="0.5" fill="#EF4444" opacity="0.9"/>
        <rect x="14" y="2" width="6" height="2" rx="0.5" fill="#F97316" opacity="0.9"/>
        <rect x="22" y="2" width="4" height="2" rx="0.5" fill="#EAB308" opacity="0.9"/>
        <rect x="8" y="5" width="8" height="2" rx="0.5" fill="#10B981" opacity="0.9"/>
        <rect x="18" y="5" width="6" height="2" rx="0.5" fill="#8B5CF6" opacity="0.9"/>
        
        {/* Bounce trajectory with multiple arcs */}
        <path d="M16 24 Q16 20 16 16 Q16 12 16 8" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.7"/>
        <path d="M16 8 Q16 12 16 16 Q16 20 16 24" stroke="#EF4444" strokeWidth="1.5" fill="none" opacity="0.6"/>
        <path d="M16 24 Q18 20 16 16 Q14 12 16 8" stroke="#8B5CF6" strokeWidth="1" fill="none" opacity="0.5"/>
        
        {/* Animated ball with gradient and glow */}
        <circle cx="16" cy="18" r="3" fill="url(#ballGradient)"/>
        <circle cx="16" cy="18" r="2.5" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.8"/>
        <circle cx="15" cy="17" r="0.8" fill="#FFFFFF" opacity="0.9"/>
        
        {/* Enhanced paddle with gradient and 3D effect */}
        <rect x="4" y="26" width="24" height="3" rx="1.5" fill="url(#paddleGradient)"/>
        <rect x="4" y="26" width="24" height="1.5" rx="1.5" fill="#FFFFFF" opacity="0.3"/>
        <rect x="6" y="27" width="20" height="1" rx="0.5" fill="#000000" opacity="0.2"/>
        
        {/* Particle effects around the ball */}
        <circle cx="13" cy="15" r="0.5" fill="#FEF3C7" opacity="0.7"/>
        <circle cx="19" cy="17" r="0.4" fill="#FEF3C7" opacity="0.6"/>
        <circle cx="14" cy="21" r="0.3" fill="#FEF3C7" opacity="0.5"/>
        <circle cx="18" cy="19" r="0.4" fill="#FEF3C7" opacity="0.6"/>
        
        {/* Energy lines */}
        <path d="M2 16 L6 16" stroke="#F59E0B" strokeWidth="1" opacity="0.6"/>
        <path d="M26 16 L30 16" stroke="#F59E0B" strokeWidth="1" opacity="0.6"/>
        <path d="M16 2 L16 6" stroke="#EF4444" strokeWidth="1" opacity="0.6"/>
      </svg>
    )
  },
  {
    id: 'flutter-focus',
    title: 'Flutter Focus',
    description: 'A fast-paced rhythm and timing challenge that tests your focus and coordination.',
    instructions: [
      'Navigate through obstacles with precise timing',
      'Maintain steady rhythm and focus',
      'React quickly to changing patterns',
      'Complete the course to finish the assessment',
      'Your timing and accuracy determine your score'
    ],
    color: 'from-sleek-500 to-emerald-600',
    gradientClass: 'bg-gradient-to-br from-sleek-500 to-emerald-600',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 32 32">
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="flutterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <radialGradient id="flutterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Background glow */}
        <circle cx="16" cy="16" r="14" fill="url(#flutterGlow)" opacity="0.4"/>
        
        {/* Main character/object */}
        <circle cx="16" cy="16" r="6" fill="url(#flutterGradient)"/>
        <circle cx="16" cy="16" r="5" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.8"/>
        
        {/* Movement lines */}
        <path d="M8 16 Q12 12 16 16 Q20 20 24 16" stroke="#3B82F6" strokeWidth="2" fill="none" opacity="0.8"/>
        <path d="M8 16 Q12 20 16 16 Q20 12 24 16" stroke="#10B981" strokeWidth="1.5" fill="none" opacity="0.6"/>
        
        {/* Obstacles */}
        <rect x="6" y="8" width="2" height="6" rx="1" fill="#3B82F6" opacity="0.8"/>
        <rect x="24" y="18" width="2" height="6" rx="1" fill="#10B981" opacity="0.8"/>
        <rect x="14" y="4" width="4" height="2" rx="1" fill="#059669" opacity="0.8"/>
        
        {/* Energy particles */}
        <circle cx="12" cy="12" r="0.8" fill="#FEF3C7" opacity="0.8"/>
        <circle cx="20" cy="20" r="0.6" fill="#FEF3C7" opacity="0.7"/>
        <circle cx="18" cy="14" r="0.5" fill="#FEF3C7" opacity="0.6"/>
        <circle cx="14" cy="18" r="0.7" fill="#FEF3C7" opacity="0.7"/>
        
        {/* Focus lines */}
        <path d="M2 16 L6 16" stroke="#3B82F6" strokeWidth="1" opacity="0.6"/>
        <path d="M26 16 L30 16" stroke="#10B981" strokeWidth="1" opacity="0.6"/>
        <path d="M16 2 L16 6" stroke="#059669" strokeWidth="1" opacity="0.6"/>
        <path d="M16 26 L16 30" stroke="#3B82F6" strokeWidth="1" opacity="0.6"/>
      </svg>
    )
  }
];

const AssessmentPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDisclaimerDismissed, dismissDisclaimer } = useDisclaimer();
  const [gameProgress, setGameProgress] = useState<GameProgress>({
    game1Completed: false,
    game2Completed: false,
    game3Completed: false,
    game4Completed: false,
    allGamesCompleted: false
  });
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  // IMPORTANT MEDICAL DISCLAIMER
  const MedicalDisclaimer = () => (
    <div className="bg-white border-2 border-amber-500 rounded-xl p-6 mb-8 shadow-lg relative">
      {/* Dismiss button */}
      <button
        onClick={dismissDisclaimer}
        className="absolute top-4 right-4 text-amber-500 hover:text-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-full p-1"
        aria-label="Dismiss disclaimer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="flex items-start gap-3 pr-8">
        <svg className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <h3 className="text-amber-700 font-bold text-lg mb-3 tracking-tight">Important Disclaimer</h3>
          <div className="text-gray-700 text-professional space-y-3">
            <p><strong>This assessment is for educational purposes only.</strong> It is not a medical diagnosis tool and should not be used to self-diagnose ADHD or any other condition.</p>
            <p><strong>These games are designed for educational purposes, not clinical assessments.</strong> They do not provide medical advice, diagnosis, or treatment recommendations.</p>
            <p><strong>If you have concerns about ADHD or other health conditions, please consult with qualified healthcare professionals.</strong> Only licensed medical professionals can provide proper diagnosis and treatment.</p>
            <p><strong>Never disregard professional medical advice or delay seeking treatment</strong> because of information or results from this assessment.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const loadGameProgress = useCallback(async () => {
    if (!currentUser) return;

    try {
      const docRef = doc(db, 'gameProgress', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as GameProgress;
        
        // Validate and sanitize the data
        const validatedProgress: GameProgress = {
          game1Completed: Boolean(data.game1Completed),
          game2Completed: Boolean(data.game2Completed),
          game3Completed: Boolean(data.game3Completed),
          game4Completed: Boolean(data.game4Completed),
          allGamesCompleted: Boolean(data.allGamesCompleted),
          completedAt: data.completedAt
        };
        
        setGameProgress(validatedProgress);
      } else {
        // Initialize progress document
        const initialProgress: GameProgress = {
          game1Completed: false,
          game2Completed: false,
          game3Completed: false,
          game4Completed: false,
          allGamesCompleted: false
        };
        await setDoc(docRef, initialProgress);
        setGameProgress(initialProgress);
      }
    } catch (error) {
      console.error('Error loading game progress:', error);
      // Set default state on error
      setGameProgress({
        game1Completed: false,
        game2Completed: false,
        game3Completed: false,
        game4Completed: false,
        allGamesCompleted: false
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadGameProgress();
  }, [loadGameProgress]);



  const isGameUnlocked = (gameIndex: number): boolean => {
    if (gameIndex === 0) return true; // First game always unlocked
    if (gameIndex === 1) return gameProgress.game1Completed; // Game 2 unlocked after Game 1
    if (gameIndex === 2) return gameProgress.game1Completed && gameProgress.game2Completed; // Game 3 unlocked after Game 2
    if (gameIndex === 3) return gameProgress.game1Completed && gameProgress.game2Completed && gameProgress.game3Completed; // Game 4 unlocked after Game 3
    return false;
  };

  const launchGame = (game: Game) => {
    // For now, we'll show a modal. Later this can be replaced with iframe/WebGL
    console.log("Launching game:", game.title, "with userId:", currentUser?.uid || 'anonymous');
    setSelectedGame(game);
    setGameCompleted(false);
    // In a real implementation, you might do:
    // window.open(`/games/${game.id}`, '_blank');
  };

  const closeGameModal = () => {
    loadGameProgress();
    setSelectedGame(null);
    setGameStarted(false);
    setGameCompleted(false);
  };

  const markGameCompleted = () => {
    // Mark game as completed and directly close modal
    setGameCompleted(true);
    loadGameProgress();
    // Directly close modal without showing intermediate screen
    closeGameModal();
  };

  const getGameProgress = (gameId: string) => {
    if (gameId === 'berry-blitz') return gameProgress.game1Completed;
    if (gameId === 'pattern-match') return gameProgress.game2Completed;
    if (gameId === 'kitchen-quest') return gameProgress.game3Completed;
    if (gameId === 'flutter-focus') return gameProgress.game4Completed;
    return false;
  };

  const getCompletedGamesCount = () => {
    const count = [gameProgress.game1Completed, gameProgress.game2Completed, gameProgress.game3Completed, gameProgress.game4Completed].filter(Boolean).length;
    return count;
  };



  const getProgressPercentage = () => {
    return (getCompletedGamesCount() / 4) * 100;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };



  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sleek-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-adhd-friendly-large">Loading your assessment...</p>
          <div className="loading-dots text-sleek-600 mt-4">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark calm-pattern">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-6 breathe tracking-tight">A(rDx)HD Games</h1>
            <p className="text-lg md:text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed text-professional-large">
              Complete these interactive games to assess different aspects of ADHD. Each game targets specific cognitive functions. The complete assessment takes approximately <strong>15-30 minutes</strong> in one sitting preferred.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <div className="flex items-center space-x-2 text-sleek-700">
                <div className="w-3 h-3 bg-sleek-500 rounded-full pulse-gentle"></div>
                <span className="text-sm font-medium">Interactive</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-700">
                <div className="w-3 h-3 bg-emerald-500 rounded-full bounce-gentle"></div>
                <span className="text-sm font-medium">Engaging</span>
              </div>
              <div className="flex items-center space-x-2 text-sleek-700">
                <div className="w-3 h-3 bg-sleek-500 rounded-full float"></div>
                <span className="text-sm font-medium">Supportive</span>
              </div>
            </div>
          </motion.div>

          {/* Progress Indicator */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-12"
            >
              <div className="card-dark p-6 focus-helper">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sage-100 font-medium text-lg">Overall Progress</span>
                  <span className="text-sleek-300 font-semibold text-lg">
                    {getCompletedGamesCount()} of 4 completed ({Math.round(getProgressPercentage())}%)
                  </span>
                </div>
                <div className="w-full bg-sage-800 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-sleek-500 to-emerald-500 h-4 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <div className="mt-3 flex justify-between text-sm text-sage-300">
                  <span>{getCompletedGamesCount() === 0 ? 'Start Your Journey' : 'Getting Started'}</span>
                  <span>{getCompletedGamesCount() === 1 ? 'Great Progress!' : 'Almost There!'}</span>
                  <span>{getCompletedGamesCount() === 4 ? 'Assessment Complete!' : 'Complete!'}</span>
                </div>

              </div>
            </motion.div>
          )}

          {/* Instructions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="card-dark p-8 mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-forest-200 mb-6 flex items-center tracking-tight">
              <motion.div
                className="w-8 h-8 bg-gradient-to-r from-sleek-500 to-emerald-500 rounded-full flex items-center justify-center mr-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              How It Works
            </h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <div className="w-8 h-8 bg-sleek-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sage-100 mb-2 tracking-tight">Complete Each Game</h4>
                    <p className="text-sage-200 text-professional leading-relaxed">Play through each interactive game at your own pace. The complete assessment takes approximately <strong>15-30 minutes</strong> in one sitting preferred. You may take breaks when needed, but we highly recommend completing all the games in the correct order in one sitting!</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sage-100 mb-2 tracking-tight">Answer Questions</h4>
                    <p className="text-sage-200 text-professional leading-relaxed">Share your experience through simple questions during and after each game. Be as honest and accurate as possible!</p>
                  </div>
                </motion.div>
              </div>
              <div className="space-y-4">
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <div className="w-8 h-8 bg-sage-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sage-100 mb-2 tracking-tight">Get Your Results</h4>
                    <p className="text-sage-200 text-professional leading-relaxed">Receive detailed insights about your cognitive patterns and strengths. Accuracy increases with each game played.</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sage-100 mb-2 tracking-tight">Take Action</h4>
                    <p className="text-sage-200 text-professional leading-relaxed">Use your results to make informed decisions about your ADHD journey.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Games Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-12"
          >
            {games.map((game, index) => (
                <motion.div
                  key={game.id}
                variants={cardVariants}
                whileHover="hover"
                className="relative"
              >
                <div className={`card-dark h-full flex flex-col interactive-card focus-helper ${
                  isGameUnlocked(index) ? 'opacity-100' : 'opacity-60'
                }`}>
                  {/* Game Header */}
                  <div className={`p-8 ${game.gradientClass} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          className="text-5xl"
                          animate={isGameUnlocked(index) ? { rotate: [0, 10, -10, 0] } : {}}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                        >
                          {typeof game.icon === 'string' ? game.icon : game.icon}
                        </motion.div>
                        <div>
                          <h3 className="text-2xl font-bold text-white tracking-tight">{game.title}</h3>
                          <p className="text-white/80 text-sm font-medium">Game {index + 1}</p>
                        </div>
                      </div>
                      {isGameUnlocked(index) ? (
                        <motion.div
                          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      ) : (
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        )}
                    </div>
                    </div>

                  {/* Game Content */}
                  <div className="p-8 flex-1 flex flex-col">
                    <p className="text-sage-200 mb-6 text-professional flex-1 leading-relaxed">{game.description}</p>
                    
                    {/* Progress Indicator */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-sage-300">Progress</span>
                        <span className="text-sm text-sleek-300">
                          {getGameProgress(game.id) ? 'Completed' : 'Not Started'}
                        </span>
                      </div>
                      <div className="w-full bg-sage-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            getGameProgress(game.id) 
                              ? 'bg-gradient-to-r from-emerald-500 to-sleek-500' 
                              : 'bg-sage-700'
                          }`}
                          style={{ width: getGameProgress(game.id) ? '100%' : '0%' }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => isGameUnlocked(index) && launchGame(game)}
                      disabled={!isGameUnlocked(index)}
                      className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 focus-helper ${
                        isGameUnlocked(index)
                          ? 'btn-primary-dark hover:scale-105'
                          : 'bg-sage-800 text-sage-400 cursor-not-allowed'
                      }`}
                    >
                      {isGameUnlocked(index) ? (
                        <span className="flex items-center justify-center space-x-2">
                          <span>Play Game</span>
                          <motion.svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </motion.svg>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <span>Complete Previous Game</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </span>
                      )}
                    </button>
                    </div>
                  </div>
                </motion.div>
            ))}
          </motion.div>

          {/* View Results Button */}
          {!loading && (gameProgress.game1Completed || gameProgress.game2Completed || gameProgress.game3Completed) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mb-12"
            >
              <div className="card-dark p-8 text-center focus-helper">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-sleek-500 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-forest-200 mb-4 tracking-tight">Ready to See Your Results?</h3>
                
                {gameProgress.allGamesCompleted ? (
                  <div className="mb-6">
                    <div className="bg-emerald-800/30 border border-emerald-600 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-emerald-300 font-semibold">Complete Assessment!</span>
                      </div>
                      <p className="text-sage-200 text-professional">
                        Amazing! You've completed all 3 games. You now have access to your comprehensive ADHD assessment with final recommendations.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="bg-amber-800/30 border border-amber-600 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-amber-300 font-semibold">Partial Results Available</span>
                      </div>
                      <p className="text-sage-200 text-professional mb-3">
                        You've completed {getCompletedGamesCount()} of 4 games. While you can view individual game results now, 
                        <strong className="text-forest-200"> all 4 games must be completed</strong> to receive your final ADHD assessment and recommendations.
                      </p>
                      <div className="bg-sage-800/50 rounded p-3">
                        <p className="text-sm text-sage-300">
                          <strong>Currently Available:</strong> Individual game results and composite scores for completed games
                        </p>
                        <p className="text-sm text-sage-300 mt-1">
                          <strong>After All 4 Games:</strong> Comprehensive ADHD assessment with personalized recommendations
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              <Link 
                to="/results" 
                  className="btn-primary-dark inline-flex items-center space-x-2 text-lg px-8 py-4"
                >
                  <span>
                    {gameProgress.allGamesCompleted 
                      ? 'View Complete Assessment & Recommendations' 
                      : `View ${getCompletedGamesCount()} Game Results`
                    }
                  </span>
                  <motion.svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
              </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Game Modal */}
      <AnimatePresence>
      {selectedGame && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`card-dark ${gameStarted ? 'max-w-6xl max-h-[95vh] w-[95vw]' : 'max-w-4xl max-h-[90vh] w-[90vw]'} w-full overflow-hidden`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Modal Header */}
              <div className={`${gameStarted ? 'p-4' : 'p-6'} border-b border-sage-700 flex items-center justify-between`}>
                <div className="flex items-center space-x-4">
                  <motion.div
                    className="text-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {typeof selectedGame.icon === 'string' ? selectedGame.icon : selectedGame.icon}
                  </motion.div>
                  <h2 className="text-2xl font-bold text-forest-200">{selectedGame.title}</h2>
                </div>
              <button
                onClick={closeGameModal}
                  className="text-sage-400 hover:text-white transition-colors focus-helper"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
              {/* Modal Content */}
              <div className={`${gameStarted ? 'h-full flex flex-col' : 'flex flex-col h-full'}`}>
                {!gameStarted ? (
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="w-full max-w-3xl mx-auto">
                      <p className="text-sage-200 mb-6 text-adhd-friendly-large">{selectedGame.description}</p>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-sleek-400 mb-3">Instructions:</h3>
                        <ol className="text-sage-200 space-y-3">
                          {selectedGame.instructions.map((instruction, index) => (
                            <motion.li 
                              key={index} 
                              className="flex items-start text-adhd-friendly"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <span className="text-sleek-500 mr-3 mt-1 font-semibold flex-shrink-0">{index + 1}.</span>
                              {instruction}
                            </motion.li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 p-4">
                    <GameWrapper
                gameId={selectedGame.id}
                gameName={selectedGame.title}
                      buildPath={`/games/${selectedGame.id}/Build`}
                      userId={currentUser?.uid || 'anonymous'}
                      onGameComplete={markGameCompleted}
                      onError={(error) => console.error('Game error:', error)}
                      onCancel={closeGameModal}
                      width="100%"
                      height="100%"
                    />
                  </div>
                )}

                {/* Modal Footer */}
                <div className="p-6 border-t border-sage-700 bg-sage-900/50">
                  <div className="flex justify-center space-x-4">
                    {!gameStarted ? (
                      <button
                        onClick={() => setGameStarted(true)}
                        className="btn-primary-dark px-8 py-3 text-lg"
                      >
                        Start Game
                      </button>
                    ) : gameCompleted ? (
                      <button
                        onClick={closeGameModal}
                        className="btn-primary-dark px-8 py-3 text-lg"
                      >
                        Close
                      </button>
                    ) : (
                      // Removed "Back to Instructions" button to prevent exiting during gameplay
                      <div className="text-sage-400 text-sm">
                        Complete the game to continue
                      </div>
                    )}
                    {!gameCompleted && (
                      <button
                        onClick={closeGameModal}
                        className="btn-secondary-dark px-6 py-2"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medical Disclaimer - Bottom of Page */}
      {!isDisclaimerDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="mt-16 px-4 md:px-6 lg:px-8"
        >
          <MedicalDisclaimer />
        </motion.div>
      )}
    </div>
  );
};

export default AssessmentPage; 