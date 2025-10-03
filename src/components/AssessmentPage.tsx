import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import GameFlow from './common/GameFlow';
import { loadGameQuestions } from '../utils/questionLoader';
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
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 32 32">
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="berryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="50%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
          <linearGradient id="fruitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="obstacleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Background glow */}
        <circle cx="16" cy="16" r="15" fill="url(#glowGradient)" opacity="0.4"/>
        
        {/* Central glowing berry/fruit */}
        <circle cx="16" cy="16" r="4" fill="url(#berryGradient)" opacity="0.9"/>
        <circle cx="16" cy="16" r="3" fill="#FFFFFF" opacity="0.3"/>
        <circle cx="15" cy="15" r="0.8" fill="#FFFFFF" opacity="0.8"/>
        
        {/* Orbiting target fruits with glow */}
        <circle cx="8" cy="8" r="2.5" fill="url(#fruitGradient)" opacity="0.8"/>
        <circle cx="8" cy="8" r="1.5" fill="#FFFFFF" opacity="0.4"/>
        <circle cx="24" cy="8" r="2.5" fill="url(#fruitGradient)" opacity="0.8"/>
        <circle cx="24" cy="8" r="1.5" fill="#FFFFFF" opacity="0.4"/>
        
        {/* Stylized obstacles (shurikens) with glow */}
        <polygon points="8,16 10,14 12,16 10,18" fill="url(#obstacleGradient)" opacity="0.7"/>
        <polygon points="8,16 9,15 10,16 9,17" fill="#FFFFFF" opacity="0.3"/>
        <polygon points="20,16 22,14 24,16 22,18" fill="url(#obstacleGradient)" opacity="0.7"/>
        <polygon points="20,16 21,15 22,16 21,17" fill="#FFFFFF" opacity="0.3"/>
        
        {/* Additional decorative elements */}
        <circle cx="8" cy="24" r="1.5" fill="#8B5CF6" opacity="0.5"/>
        <circle cx="24" cy="24" r="1.5" fill="#8B5CF6" opacity="0.5"/>
        
        {/* Subtle grid lines for structure */}
        <line x1="16" y1="4" x2="16" y2="28" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.2"/>
        <line x1="4" y1="16" x2="28" y2="16" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.2"/>
      </svg>
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
      id: 'bounce-back',
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
  const navigate = useNavigate();
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
      // console.log('[AssessmentPage] Loading game progress for user:', currentUser.uid);
      
      // Check each game's completion status from their actual documents
      const gameIds = ['BerryBlitz', 'pattern-match', 'BounceBack', 'FlutterFocus'];
      const gameProgressMap = {
        game1Completed: false, // BerryBlitz
        game2Completed: false, // PatternMatch  
        game3Completed: false, // BounceBack
        game4Completed: false, // FlutterFocus
        allGamesCompleted: false,
        completedAt: null
      };

      // First, check the gameProgress collection for completion flags
      try {
        const gameProgressDoc = await getDoc(doc(db, 'gameProgress', currentUser.uid));
        if (gameProgressDoc.exists()) {
          const progressData = gameProgressDoc.data();
          // console.log('[AssessmentPage] GameProgress document data:', progressData);
          
          // Update completion status from gameProgress collection
          if (progressData.game1Completed) gameProgressMap.game1Completed = true;
          if (progressData.game2Completed) gameProgressMap.game2Completed = true;
          if (progressData.game3Completed) gameProgressMap.game3Completed = true;
          if (progressData.game4Completed) gameProgressMap.game4Completed = true;
          
          // console.log('[AssessmentPage] Completion status from gameProgress:', {
          //   game1Completed: progressData.game1Completed,
          //   game2Completed: progressData.game2Completed,
          //   game3Completed: progressData.game3Completed,
          //   game4Completed: progressData.game4Completed
          // });
        } else {
          console.log('[AssessmentPage] GameProgress document does not exist for user:', currentUser.uid);
        }
      } catch (error) {
        console.error('[AssessmentPage] Error checking gameProgress collection:', error);
      }

      // Then check each game document for additional completion verification
      for (let i = 0; i < gameIds.length; i++) {
        const gameId = gameIds[i];
        try {
          const gameDoc = await getDoc(doc(db, 'users', currentUser.uid, 'games', gameId));
          if (gameDoc.exists()) {
            const gameData = gameDoc.data();
            // console.log(`[AssessmentPage] Game ${gameId} data:`, gameData);
            // console.log(`[AssessmentPage] Game ${gameId} has scores:`, !!gameData.scores);
            // console.log(`[AssessmentPage] Game ${gameId} has selfReport:`, !!gameData.selfReport);
            // console.log(`[AssessmentPage] Game ${gameId} scores:`, gameData.scores);
            // console.log(`[AssessmentPage] Game ${gameId} selfReport:`, gameData.selfReport);
            
            // Check if game has scores (indicates completion)
            const isCompleted = !!(gameData.scores && gameData.selfReport);
            // console.log(`[AssessmentPage] Game ${gameId} completed:`, isCompleted);
            
            // If gameProgress says it's completed OR the game document has scores+selfReport, mark as completed
            if (i === 0) gameProgressMap.game1Completed = gameProgressMap.game1Completed || isCompleted;
            else if (i === 1) gameProgressMap.game2Completed = gameProgressMap.game2Completed || isCompleted;
            else if (i === 2) gameProgressMap.game3Completed = gameProgressMap.game3Completed || isCompleted;
            else if (i === 3) gameProgressMap.game4Completed = gameProgressMap.game4Completed || isCompleted;
          } else {
            console.log(`[AssessmentPage] Game ${gameId} document not found`);
          }
        } catch (error) {
          console.error(`[AssessmentPage] Error checking game ${gameId}:`, error);
        }
      }

      // Calculate overall completion
      gameProgressMap.allGamesCompleted = gameProgressMap.game1Completed && 
                                        gameProgressMap.game2Completed && 
                                        gameProgressMap.game3Completed && 
                                        gameProgressMap.game4Completed;

      // console.log('[AssessmentPage] Final game progress:', gameProgressMap);
      // console.log('[AssessmentPage] Individual game completion status:', {
      //   'BerryBlitz (game1)': gameProgressMap.game1Completed,
      //   'PatternMatch (game2)': gameProgressMap.game2Completed,
      //   'BounceBack (game3)': gameProgressMap.game3Completed,
      //   'FlutterFocus (game4)': gameProgressMap.game4Completed,
      //   'All Games': gameProgressMap.allGamesCompleted
      // });
      setGameProgress(gameProgressMap);
      
    } catch (error) {
      console.error('[AssessmentPage] Error loading game progress:', error);
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
    setGameCompleted(false);
  };

  const markGameCompleted = async (completeGameData: any) => {
    // Mark game as completed and save complete data to Firebase
    setGameCompleted(true);
    // console.log('[AssessmentPage] Game completed with data:', completeGameData);
    
    // Save the complete game data (including self-report) to Firebase
    if (completeGameData && currentUser?.uid) {
      const gameId = completeGameData.gameId;
      const firebasePath = `users/${currentUser.uid}/games/${gameId}`;
      
      // For BounceBack and FlutterFocus, calculate ADHD scores here since the games can't do it
      if ((gameId === 'bounce-back' || gameId === 'flutter-focus') && completeGameData.selfReport) {
        // Get self-report data
        const selfReport = completeGameData.selfReport;
        const gameData = completeGameData;
        
        // Game metrics for score calculation
        let gameMetrics;
        
        if (gameId === 'bounce-back') {
          gameMetrics = {
            accuracy: gameData.accuracy || 0,
            averageReactionTime: gameData.averageReactionTime || 0,
            paddleHits: gameData.paddleHits || 0,
            wallHits: gameData.wallHits || 0,
            livesLost: gameData.livesLost || 0,
            paddleMovements: gameData.paddleMovements || 0,
            totalPlayTime: gameData.totalPlayTime || 0,
            finalScore: gameData.finalScore || 0,
            levelScores: gameData.levelScores || [],
            levelCompletionTimes: gameData.levelCompletionTimes || [],
            consecutiveErrors: gameData.consecutiveErrors || 0,
            maxConsecutiveErrors: gameData.maxConsecutiveErrors || 0,
            totalMistakes: gameData.totalMistakes || 0,
            successfulRecoveries: gameData.successfulRecoveries || 0,
            failedRecoveries: gameData.failedRecoveries || 0,
            movementPatterns: gameData.movementPatterns || [],
            errorPatterns: gameData.errorPatterns || [],
            timeBetweenMistakes: gameData.timeBetweenMistakes || [],
          };
        } else if (gameId === 'flutter-focus') {
          // Calculate accuracy from obstacles hit vs avoided
          const totalObstacles = (gameData.totalObstaclesHit || 0) + (gameData.totalObstaclesAvoided || 0);
          const accuracy = totalObstacles > 0 ? ((gameData.totalObstaclesAvoided || 0) / totalObstacles) * 100 : 0;
          
          gameMetrics = {
            accuracy: accuracy,
            averageReactionTime: 0, // Not available in current data structure
            livesLost: gameData.livesLost || 0,
            totalPlayTime: gameData.totalPlayTime || 0,
            finalScore: gameData.finalScore || 0,
            levelScores: gameData.levelScores || [],
            levelCompletionTimes: gameData.levelCompletionTimes || [],
            totalMistakes: gameData.livesLost || 0,
            // FlutterFocus specific metrics
            debrisHit: gameData.totalObstaclesHit || 0,
            debrisAvoided: gameData.totalObstaclesAvoided || 0,
            // FlutterFocus doesn't have these BounceBack-specific fields, so set defaults
            maxConsecutiveErrors: 0,
            failedRecoveries: 0,
            successfulRecoveries: 0,
          };
        }
        
        // Safety check for gameMetrics
        if (!gameMetrics) {
          // console.error('[AssessmentPage] gameMetrics is undefined for gameId:', gameId);
          return;
        }
        
        // Calculate Inattention Score (0-10) - HIGHER score = MORE inattention
        let inattentionSelfReportComponent = 0;
        
        if (gameId === 'bounce-back') {
          inattentionSelfReportComponent = selfReport.q1_focus_difficulty ? 
            (selfReport.q1_focus_difficulty - 1) / 4 * 3 : 0;
        } else if (gameId === 'flutter-focus') {
          inattentionSelfReportComponent = selfReport.q1_flutter_focus_difficulty ? 
            (selfReport.q1_flutter_focus_difficulty - 1) / 4 * 3 : 0;
        }
        
        const accuracyComponent = (1 - gameMetrics.accuracy / 100) * 2;
        
        let consistencyComponent = 0;
        let focusComponent = 0;
        
        if (gameId === 'bounce-back') {
          consistencyComponent = Math.min(1, gameMetrics.maxConsecutiveErrors / 2) * 3;
          focusComponent = Math.min(1, gameMetrics.totalMistakes / Math.max(1, gameMetrics.totalPlayTime / 3000)) * 2;
        } else if (gameId === 'flutter-focus') {
          // For FlutterFocus, use lives lost and debris hit as consistency/focus indicators
          consistencyComponent = Math.min(1, gameMetrics.livesLost / 3) * 3;
          focusComponent = Math.min(1, gameMetrics.debrisHit / Math.max(1, gameMetrics.totalPlayTime / 3000)) * 2;
        }
        
        // Calculate inattention bonus based on game type
        let inattentionBonus = 0;
        if (gameId === 'bounce-back') {
          inattentionBonus = gameMetrics.maxConsecutiveErrors > 1 ? 2 : 0;
        } else if (gameId === 'flutter-focus') {
          // For FlutterFocus, bonus based on debris hit and lives lost
          inattentionBonus = (gameMetrics.debrisHit > 2 ? 1 : 0) + (gameMetrics.livesLost > 1 ? 1 : 0);
        }
        
        let inattentionScore = Math.max(0, Math.min(10, 
          accuracyComponent + consistencyComponent + focusComponent + inattentionSelfReportComponent + inattentionBonus
        ));
        
        // Apply game-specific adjustments
        if (gameId === 'bounce-back') {
          if (gameMetrics.accuracy > 80 && gameMetrics.totalMistakes > 0) {
            inattentionScore = Math.min(10, inattentionScore + 2);
          }
          
          if (gameMetrics.maxConsecutiveErrors >= 2) {
            inattentionScore = Math.min(10, inattentionScore + 3);
          }
          
          if (gameMetrics.totalMistakes > 0 && inattentionScore < 2) {
            inattentionScore = Math.max(2, inattentionScore);
          }
        } else if (gameId === 'flutter-focus') {
          // FlutterFocus-specific adjustments
          if (gameMetrics.accuracy < 50) {
            inattentionScore = Math.min(10, inattentionScore + 1);
          }
          
          if (gameMetrics.debrisHit > 3) {
            inattentionScore = Math.min(10, inattentionScore + 1);
          }
          
          if (gameMetrics.livesLost > 0 && inattentionScore < 2) {
            inattentionScore = Math.max(2, inattentionScore);
          }
        }
        
        // Calculate Hyperactivity Score (0-10) - HIGHER score = MORE hyperactivity
        let hyperactivityScore = 0;
        
        if (gameId === 'bounce-back') {
          const movementFrequency = gameMetrics.movementPatterns.length / Math.max(1, gameMetrics.totalPlayTime / 1000);
          const movementComponent = Math.min(1, movementFrequency / 0.5) * 4;
          const erraticComponent = Math.min(1, gameMetrics.errorPatterns.length / Math.max(1, gameMetrics.totalPlayTime / 3000)) * 2;
          const paddleComponent = Math.min(1, gameMetrics.paddleMovements / 50) * 1;
          
          const hyperactivitySelfReportComponent = selfReport.q3_frustration_level ? 
            (selfReport.q3_frustration_level - 1) / 4 * 3 : 0;
          
          hyperactivityScore = gameMetrics.movementPatterns.length === 0 
            ? Math.min(10, (gameMetrics.paddleMovements / 20) * 2 + hyperactivitySelfReportComponent)
            : Math.max(0, Math.min(10, movementComponent + erraticComponent + paddleComponent + hyperactivitySelfReportComponent));
        } else if (gameId === 'flutter-focus') {
          // For FlutterFocus, use lives lost and debris hit as hyperactivity indicators
          const livesComponent = Math.min(1, gameMetrics.livesLost / 3) * 3;
          const debrisComponent = Math.min(1, gameMetrics.debrisHit / 5) * 3;
          const hyperactivitySelfReportComponent = selfReport.q3_flutter_frustration_level ? 
            (selfReport.q3_flutter_frustration_level - 1) / 4 * 3 : 0;
          hyperactivityScore = Math.max(0, Math.min(10, livesComponent + debrisComponent + hyperactivitySelfReportComponent));
        }
        
        // Calculate Impulsivity Score (0-10) - HIGHER score = MORE impulsivity
        let errorComponent = 0;
        let recoveryComponent = 0;
        let impulsivitySelfReportComponent = 0;
        
        if (gameId === 'bounce-back') {
          errorComponent = Math.min(1, gameMetrics.totalMistakes / 5) * 4;
          recoveryComponent = Math.min(1, gameMetrics.failedRecoveries / Math.max(1, gameMetrics.totalMistakes)) * 3;
          impulsivitySelfReportComponent = selfReport.q2_impulsive_movements ? 
            (selfReport.q2_impulsive_movements - 1) / 4 * 3 : 0;
        } else if (gameId === 'flutter-focus') {
          // For FlutterFocus, error component based on debris hit and lives lost
          errorComponent = Math.min(1, (gameMetrics.debrisHit + gameMetrics.livesLost) / 6) * 4;
          // For FlutterFocus, recovery component based on accuracy
          recoveryComponent = gameMetrics.accuracy < 50 ? 2 : 0;
          impulsivitySelfReportComponent = selfReport.q2_flutter_impulsive_movements ? 
            (selfReport.q2_flutter_impulsive_movements - 1) / 4 * 3 : 0;
        }
        
        let impulsivityScore = Math.max(0, Math.min(10,
          errorComponent + recoveryComponent + impulsivitySelfReportComponent
        ));
        
        // Calculate Executive Function Score (0-10) - HIGHER score = WORSE executive function
        let planningComponent = 0;
        let execAccuracyComponent = (1 - gameMetrics.accuracy / 100) * 3;
        let execSelfReportComponent = 0;
        
        if (gameId === 'bounce-back') {
          planningComponent = (1 - Math.min(1, gameMetrics.successfulRecoveries / Math.max(1, gameMetrics.totalMistakes))) * 4;
          execSelfReportComponent = selfReport.q4_planning_ability ? 
            (5 - selfReport.q4_planning_ability) / 4 * 3 : 0;
        } else if (gameId === 'flutter-focus') {
          // For FlutterFocus, planning component based on debris hit and lives lost
          planningComponent = Math.min(1, (gameMetrics.debrisHit + gameMetrics.livesLost) / 6) * 4;
          execSelfReportComponent = selfReport.q4_flutter_planning_ability ? 
            (selfReport.q4_flutter_planning_ability - 1) / 4 * 3 : 0;
        }
        
        // Calculate planning bonus based on game type
        let planningBonus = 0;
        if (gameId === 'bounce-back') {
          planningBonus = gameMetrics.failedRecoveries > 0 ? 2 : 0;
        } else if (gameId === 'flutter-focus') {
          // For FlutterFocus, bonus based on debris hit and lives lost
          planningBonus = (gameMetrics.debrisHit > 2 ? 1 : 0) + (gameMetrics.livesLost > 1 ? 1 : 0);
        }
        
        let executiveFunctionScore = Math.max(0, Math.min(10,
          planningComponent + execAccuracyComponent + execSelfReportComponent + planningBonus
        ));
        
        // Apply game-specific adjustments
        if (gameId === 'bounce-back') {
          if (gameMetrics.failedRecoveries > 0) {
            executiveFunctionScore = Math.min(10, executiveFunctionScore + 2);
          }
          
          if (gameMetrics.accuracy > 70 && gameMetrics.successfulRecoveries < gameMetrics.totalMistakes * 0.5) {
            executiveFunctionScore = Math.min(10, executiveFunctionScore + 1);
          }
          
          if (gameMetrics.failedRecoveries > 0 && executiveFunctionScore < 2) {
            executiveFunctionScore = Math.max(2, executiveFunctionScore);
          }
        } else if (gameId === 'flutter-focus') {
          // FlutterFocus-specific adjustments
          if (gameMetrics.debrisHit > 3) {
            executiveFunctionScore = Math.min(10, executiveFunctionScore + 1);
          }
          
          if (gameMetrics.livesLost > 1) {
            executiveFunctionScore = Math.min(10, executiveFunctionScore + 1);
          }
          
          if (gameMetrics.accuracy < 50 && executiveFunctionScore < 2) {
            executiveFunctionScore = Math.max(2, executiveFunctionScore);
          }
        }
        
        // Add persistence/motivation component from self-report
        let persistenceComponent = 0;
        
        if (gameId === 'bounce-back') {
          persistenceComponent = selfReport.q5_persistence_motivation ? 
            (5 - selfReport.q5_persistence_motivation) / 4 * 2 : 0;
        } else if (gameId === 'flutter-focus') {
          persistenceComponent = selfReport.q5_flutter_persistence_motivation ? 
            (selfReport.q5_flutter_persistence_motivation - 1) / 4 * 2 : 0;
        }
        
        if (persistenceComponent > 0) {
          inattentionScore = Math.min(10, inattentionScore + persistenceComponent * 0.5);
          impulsivityScore = Math.min(10, impulsivityScore + persistenceComponent * 0.3);
          executiveFunctionScore = Math.min(10, executiveFunctionScore + persistenceComponent * 0.2);
        }
        
        // Calculate composite ADHD score
        const adhd_composite = Math.max(0, Math.min(10,
          (inattentionScore + hyperactivityScore + impulsivityScore + executiveFunctionScore) / 4
        ));
        
        const scores = {
          inattention: inattentionScore,
          hyperactivity: hyperactivityScore,
          impulsivity: impulsivityScore,
          executive_function: executiveFunctionScore,
          adhd_composite
        };
        
        // For FlutterFocus, use the existing ADHD scores if available, otherwise calculate from self-report
        if (gameId === 'flutter-focus') {
          // Check if the game already calculated ADHD scores
          if (completeGameData.adhdScores) {
            console.log('[AssessmentPage] FlutterFocus already has ADHD scores:', completeGameData.adhdScores);
            scores.inattention = completeGameData.adhdScores.inattention || scores.inattention;
            scores.hyperactivity = completeGameData.adhdScores.hyperactivity || scores.hyperactivity;
            scores.impulsivity = completeGameData.adhdScores.impulsivity || scores.impulsivity;
            scores.executive_function = completeGameData.adhdScores.executive_function || scores.executive_function;
            scores.adhd_composite = completeGameData.adhdScores.adhd_composite || scores.adhd_composite;
          } else {
            console.log('[AssessmentPage] FlutterFocus using calculated scores from self-report:', scores);
          }
        }
        
        // if (gameId === 'bounce-back') {
        //   console.log('[AssessmentPage] Calculated BounceBack ADHD scores:', scores);
        // } else if (gameId === 'flutter-focus') {
        //   console.log('[AssessmentPage] Calculated FlutterFocus ADHD scores:', scores);
        //   console.log('[AssessmentPage] FlutterFocus calculation breakdown:', {
        //     accuracy: gameMetrics.accuracy,
        //     livesLost: gameMetrics.livesLost,
        //     debrisHit: gameMetrics.debrisHit,
        //     debrisAvoided: gameMetrics.debrisAvoided,
        //     totalPlayTime: gameMetrics.totalPlayTime,
        //     inattentionScore,
        //     hyperactivityScore,
        //     impulsivityScore,
        //     executiveFunctionScore
        //   });
        // }
        
        // Save the complete data with calculated scores
        const completeDataWithScores = {
        ...completeGameData,
          scores,
        lastUpdated: new Date().toISOString(),
        gameCompleted: true,
        assessmentComplete: true
        };
        
        // For FlutterFocus, ensure selfReport data is saved and preserve individual level data
        if (gameId === 'flutter-focus' && completeGameData.selfReport) {
          const flutterSelfReport = completeGameData.selfReport;
          completeDataWithScores.selfReport = flutterSelfReport;
          
          // NO DATA PRESERVATION - Fresh start every time
          // console.log('[AssessmentPage] FlutterFocus using NEW game data - no preservation of old data');
          // console.log('[AssessmentPage] FlutterFocus self-report data from current game:', flutterSelfReport);
          
          // console.log('[AssessmentPage] FlutterFocus selfReport data being saved in ADHD path:', flutterSelfReport);
          // console.log('[AssessmentPage] FlutterFocus completeDataWithScores before save:', completeDataWithScores);
          // console.log('[AssessmentPage] FlutterFocus completeDataWithScores.selfReport:', completeDataWithScores.selfReport);
          // console.log('[AssessmentPage] FlutterFocus completeDataWithScores keys:', Object.keys(completeDataWithScores));
        }
        
        // console.log(`[AssessmentPage] About to save to Firebase path: ${firebasePath}`);
        // console.log(`[AssessmentPage] Firebase document reference:`, doc(db, firebasePath));
        setDoc(doc(db, firebasePath), completeDataWithScores, { merge: true }).then(() => {
          // console.log(`[AssessmentPage] Complete ${gameId} data with scores saved to Firebase:`, firebasePath);
          // console.log(`[AssessmentPage] Data that was saved:`, completeDataWithScores);
        }).catch(err => {
          console.error(`[AssessmentPage] Failed to save ${gameId} data with scores:`, err);
        });
        
      } else {
        // For other games, save normally
        const dataToSave = {
          ...completeGameData,
          lastUpdated: new Date().toISOString(),
          gameCompleted: true,
          assessmentComplete: true
        };
        
        // For FlutterFocus, ensure selfReport data is saved
        if (gameId === 'flutter-focus' && completeGameData.selfReport) {
          const flutterSelfReport = completeGameData.selfReport;
          dataToSave.selfReport = flutterSelfReport;
          // console.log('[AssessmentPage] FlutterFocus selfReport data being saved:', flutterSelfReport);
        }
        
        setDoc(doc(db, firebasePath), dataToSave, { merge: true }).then(() => {
        console.log('[AssessmentPage] Complete game data saved to Firebase:', firebasePath);
        }).catch(err => {
          console.error('[AssessmentPage] Failed to save complete game data:', err);
        });
      }
        
        // Also update gameProgress to mark this game as completed
        setDoc(doc(db, 'gameProgress', currentUser.uid), {
          [getGameProgressField(gameId)]: true,
          lastUpdated: new Date().toISOString()
        }, { merge: true }).then(() => {
          console.log('[AssessmentPage] Game progress updated in Firebase');
        }).catch(err => {
          console.error('[AssessmentPage] Failed to update game progress:', err);
      });
    }
    
    // Refresh game progress to reflect the newly completed game
    setTimeout(() => {
      loadGameProgress();
    }, 100); // Small delay to ensure Firebase write is complete
    // Directly close modal without showing intermediate screen
    closeGameModal();
  };

  const getGameProgress = (gameId: string) => {
    if (gameId === 'berry-blitz') return gameProgress.game1Completed;
    if (gameId === 'pattern-match') return gameProgress.game2Completed;
    if (gameId === 'bounce-back') return gameProgress.game3Completed;
    if (gameId === 'flutter-focus') return gameProgress.game4Completed;
    return false;
  };

  const getGameProgressField = (gameId: string) => {
    if (gameId === 'berry-blitz') return 'game1Completed';
    if (gameId === 'pattern-match') return 'game2Completed';
    if (gameId === 'bounce-back') return 'game3Completed';
    if (gameId === 'flutter-focus') return 'game4Completed';
    return 'unknown';
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
        ease: "easeOut" as const
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const
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
                transition={{ duration: 3, repeat: Infinity, ease: "linear" as const }}
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
          {!loading && (gameProgress.game1Completed || gameProgress.game2Completed || gameProgress.game3Completed || gameProgress.game4Completed) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mb-12"
            >
              <div className="card-dark p-8 text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" as const }}
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
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/results')}
                  className="btn-primary-dark inline-flex items-center space-x-2 text-lg px-8 py-4 cursor-pointer"
                  style={{ 
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 10,
                    userSelect: 'none'
                  }}
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
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </button>
                
                {/* Debug button to test data structure */}
                <button
                  onClick={() => {
                    console.log('[DEBUG] Testing BounceBack data structure...');
                    const testData = {
                      scores: {
                        inattention: 7.5,
                        hyperactivity: 0,
                        impulsivity: 6.2,
                        executive_function: 8.1,
                        adhd_composite: 7.2
                      },
                      gameData: {
                        totalPlayTime: 120000,
                        bricksDestroyed: 45,
                        totalBricks: 48,
                        accuracy: 0.94,
                        averageReactionTime: 250,
                        paddleHits: 120,
                        wallHits: 15,
                        livesLost: 1,
                        finalScore: 850,
                        paddleMovements: 200,
                        levelScores: [150, 200, 250],
                        levelCompletionTimes: [45000, 35000, 40000],
                        selfReport: {
                          attention_1: 3,
                          impulsivity_1: 2,
                          frustration_1: 4,
                          focus_1: 3,
                          persistence_1: 4
                        }
                      },
                      selfReport: {
                        attention_1: 3,
                        impulsivity_1: 2,
                        frustration_1: 4,
                        focus_1: 3,
                        persistence_1: 4
                      }
                    };
                    console.log('[DEBUG] Expected BounceBack data structure:', testData);
                  }}
                  className="btn-secondary-dark inline-flex items-center space-x-2 text-sm px-4 py-2"
                >
                  Debug: Test Data Structure
                </button>
              </div>
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
            <GameFlow
              gameId={selectedGame.id}
              gameTitle={selectedGame.title}
              gameIcon={selectedGame.icon}
              description={selectedGame.description}
              instructions={selectedGame.instructions}
              questions={loadGameQuestions(selectedGame.id)}
              onGameComplete={markGameCompleted}
              onFlowComplete={closeGameModal}
              onCancel={closeGameModal}
              userId={currentUser?.uid || 'anonymous'}
            />
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