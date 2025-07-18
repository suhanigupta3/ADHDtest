import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { adhdData } from '../data/adhdData';

interface NodeData {
  id: string;
  title: string;
  color: string;
  colorClass: string;
  icon: string;
  position: { angle: number; distance: number };
  overview: string;
  [key: string]: any;
}

interface ModalContent {
  node: any;
  isCenter: boolean;
}

const AboutADHDPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ModalContent>({ node: null, isCenter: false });
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set(['what-is-adhd']));
  const [webExpanded, setWebExpanded] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showFocusHelper, setShowFocusHelper] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  // IMPORTANT MEDICAL DISCLAIMER
  const MedicalDisclaimer = () => (
    <div className="bg-white border-2 border-amber-500 rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex items-start gap-3">
        <svg className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <h3 className="text-amber-700 font-bold text-lg mb-3 tracking-tight">Educational Information Only</h3>
          <div className="text-gray-700 text-professional space-y-3">
            <p><strong>This page provides educational information about ADHD for general knowledge purposes only.</strong> It is not intended to provide medical advice, diagnosis, or treatment.</p>
            <p><strong>The information presented here is for educational and awareness purposes.</strong> It should not be used to self-diagnose or make medical decisions.</p>
            <p><strong>If you have concerns about ADHD or other health conditions, please consult with qualified healthcare professionals.</strong> Only licensed medical professionals can provide proper diagnosis and treatment.</p>
            <p><strong>Never disregard professional medical advice or delay seeking treatment</strong> because of information found on this website.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Focus helper timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFocusHelper(true);
      setTimeout(() => setShowFocusHelper(false), 3000);
    }, 15000); // Show focus helper after 15 seconds

    return () => clearTimeout(timer);
  }, []);

  // Calculate node positions
  const calculatePosition = (angle: number, distance: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * distance,
      y: Math.sin(radian) * distance
    };
  };

  // Calculate responsive distance based on screen size
  const getResponsiveDistance = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 200; // small mobile
      if (window.innerWidth < 768) return 250; // mobile
      if (window.innerWidth < 1024) return 300; // tablet
      if (window.innerWidth < 1280) return 350; // small desktop
      return 400; // large desktop
    }
    return 300; // default
  };

  // Handle node expansion
  const handleNodeClick = (nodeId: string, node: any, isCenter: boolean = false) => {
    console.log('Node clicked:', nodeId, 'isCenter:', isCenter, 'webExpanded:', webExpanded);
    
    if (isCenter && !webExpanded) {
      // Expand main spider web from center - NO MODAL for center node
      console.log('Expanding web from center');
      setWebExpanded(true);
      setExpandedNodes(new Set(['what-is-adhd']));
      setVisibleNodes(new Set(['what-is-adhd', ...adhdData.nodes.map(n => n.id)]));
    } else if (!isCenter && !expandedNodes.has(nodeId)) {
      // Expand sub-branches from this node AND open modal
      console.log('Expanding sub-branches from node:', nodeId);
      const newExpanded = new Set(expandedNodes);
      newExpanded.add(nodeId);
      setExpandedNodes(newExpanded);
      
      // Add sub-nodes to visible set (we'll create sub-nodes based on the node's content)
      const newVisible = new Set(visibleNodes);
      // For now, just mark as expanded - we can add sub-nodes later
      setVisibleNodes(newVisible);
      
      // Open modal for branch nodes
      setSelectedNode({ node: node, isCenter: false });
    } else if (!isCenter) {
      // If branch node is already expanded, just open the modal
      console.log('Opening modal for already expanded node:', nodeId);
      setSelectedNode({ node: node, isCenter: false });
    }
    // Center node never opens a modal - information is already displayed on the page
  };

  // Handle card flip
  const handleCardFlip = (cardId: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(cardId)) {
      newFlipped.delete(cardId);
    } else {
      newFlipped.add(cardId);
    }
    setFlippedCards(newFlipped);
  };

  // Get icon component
  const getIcon = (iconName: string, size: string = "w-8 h-8") => {
    const icons = {
      brain: (
        <svg className={size} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
      focus: (
        <svg className={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      energy: (
        <svg className={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      combined: (
        <svg className={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      dna: (
        <svg className={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      diagnosis: (
        <svg className={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      treatment: (
        <svg className={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7.636l1.318-1.318a4.5 4.5 0 016.364 0L12 7.636l-1.318 1.318a4.5 4.5 0 00-6.364 0L12 7.636z" />
        </svg>
      )
    };
    return icons[iconName as keyof typeof icons] || icons.brain;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        staggerChildren: 0.15
      }
    }
  };

  const nodeVariants = {
    hidden: { 
      scale: 0, 
      opacity: 0,
      x: 0,
      y: 0,
      rotate: -180
    },
    visible: (custom: { x: number; y: number; delay: number }) => ({
      scale: 1,
      opacity: 1,
      x: custom.x,
      y: custom.y,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: custom.delay,
        duration: 0.8
      }
    }),
    hover: {
      scale: 1.15,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15,
        duration: 0.3
      }
    },
    exit: {
      scale: 0,
      opacity: 0,
      rotate: 180,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
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
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-light calm-pattern">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="inline-flex items-center text-sleek-700 hover:text-sleek-800 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            
            <div className="flex items-center space-x-3">
              <img 
                src="/adhd-logo.png" 
                alt="A(rDx)HD Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center hidden">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">A(rDx)HD</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 breathe tracking-tight"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              What is ADHD?
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed text-professional-large"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Attention Deficit Hyperactivity Disorder (ADHD) is a neurodevelopmental condition that affects focus, impulse control, and activity levels. 
              Understanding ADHD is the first step toward managing it effectively.
            </motion.p>
            <motion.div 
              className="mt-8 flex justify-center space-x-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center space-x-2 text-sleek-600">
                <motion.div 
                  className="w-3 h-3 bg-sleek-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm font-medium">Interactive</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-600">
                <motion.div 
                  className="w-3 h-3 bg-emerald-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <span className="text-sm font-medium">Educational</span>
              </div>
              <div className="flex items-center space-x-2 text-sleek-600">
                <motion.div 
                  className="w-3 h-3 bg-sleek-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                <span className="text-sm font-medium">Supportive</span>
              </div>
            </motion.div>
        </motion.div>

          {/* Interactive Web Section */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mb-16"
          >
            <div className="card p-8 focus-helper">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center tracking-tight"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                Explore ADHD Types & Information
              </motion.h2>
              <motion.p 
                className="text-lg md:text-xl text-gray-600 text-center mb-8 text-professional-large"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
        >
            Click the center node below to reveal the different aspects of ADHD, then explore each topic in detail.
              </motion.p>
              
              <div className="relative h-[700px] md:h-[800px] lg:h-[900px] bg-gradient-to-br from-sleek-50 to-emerald-50 rounded-xl border border-gray-200 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%),
                                    radial-gradient(circle at 75% 75%, #10b981 0%, transparent 50%)`,
                    backgroundSize: '100px 100px'
                  }}></div>
                </div>

                {/* Interactive Web */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                    {webExpanded && visibleNodes.size > 0 && 
                      adhdData.nodes
                        .filter((node: NodeData) => visibleNodes.has(node.id))
                        .map((node: NodeData, index: number) => {
                          const responsiveDistance = getResponsiveDistance();
                          const pos = calculatePosition(node.position.angle, responsiveDistance);
                          const centerX = 50;
                          const centerY = 50;
                          const nodeX = centerX + (pos.x / 2);
                          const nodeY = centerY + (pos.y / 2);
                          
                          return (
                            <motion.line
                              key={`line-${node.id}`}
                              x1="50%"
                              y1="50%"
                              x2={`${nodeX}%`}
                              y2={`${nodeY}%`}
                              stroke="#3b82f6"
                              strokeWidth="2"
                              strokeDasharray="5,5"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 0.6 }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          );
                        })
                    }
                  </svg>

          {/* Center Node */}
          <motion.div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '48%', top: '45%', zIndex: 10, cursor: !webExpanded ? 'pointer' : 'default' }}
            initial="hidden"
            animate="visible"
            custom={{ x: 0, y: 0, delay: 0 }}
                    variants={itemVariants}
                    whileHover={!webExpanded ? { scale: 1.1 } : {}}
                    onClick={() => !webExpanded && setWebExpanded(true)}
          >
                    <motion.div
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                        webExpanded ? 'bg-gradient-to-r from-emerald-500 to-sleek-500' : 'bg-gradient-to-r from-sleek-500 to-emerald-500'
                      }`}
                      animate={webExpanded ? {} : { scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: webExpanded ? 0 : Infinity }}
                    >
                      {webExpanded ? '✓' : 'ADHD'}
                    </motion.div>
                  </motion.div>

                  {/* Surrounding Nodes */}
                  <AnimatePresence>
                    {webExpanded && 
                      adhdData.nodes.map((node: NodeData, index: number) => {
                        const responsiveDistance = getResponsiveDistance();
                        const pos = calculatePosition(node.position.angle, responsiveDistance);
                        
                        return (
                          <motion.div
                            key={node.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                            style={{ left: '48%', top: '45%', zIndex: 10 }}
                            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                            animate={webExpanded ? { 
                              scale: 1, 
                              opacity: 1, 
                              x: pos.x / 2, 
                              y: pos.y / 2, 
                              rotate: 0 
                            } : { 
                              scale: 0, 
                              opacity: 0, 
                              x: 0, 
                              y: 0, 
                              rotate: 180 
                            }}
                            exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                            transition={{ 
                              duration: 0.8, 
                              delay: index * 0.1,
                              type: "spring",
                              stiffness: 100,
                              damping: 15
                            }}
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleNodeClick(node.id, node, false)}
                          >
                <motion.div
                              className={`w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full flex items-center justify-center text-white font-semibold shadow-lg cursor-pointer ${
                                expandedNodes.has(node.id) 
                                  ? 'bg-gradient-to-r from-sleek-500 to-emerald-500' 
                                  : 'bg-gradient-to-r from-sleek-400 to-emerald-400'
                              }`}
                              animate={expandedNodes.has(node.id) ? { 
                                scale: [1, 1.05, 1],
                                rotate: [0, 5, -5, 0]
                              } : {}}
                              transition={{ duration: 2, repeat: expandedNodes.has(node.id) ? Infinity : 0 }}
                >
                              <div className="text-center px-3" style={{ 
                                fontSize: 'clamp(9px, 1vw, 13px)',
                                lineHeight: '1.1',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                width: '100%'
                              }}>
                                {node.title}
                              </div>
                            </motion.div>
                </motion.div>
                        );
                      })
                    }
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ADHD Types Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="mb-16"
          >
            <motion.h2 
              className="text-3xl font-bold text-gray-900 mb-12 text-center tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              Understanding ADHD Types
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {adhdData.nodes.map((type: any, index: number) => {
                const isFlipped = flippedCards.has(type.id);
                const bgColors = [
                  'bg-emerald-900',
                  'bg-green-800', 
                  'bg-emerald-800',
                  'bg-green-900',
                  'bg-emerald-950'
                ];
                const bgColor = bgColors[index % bgColors.length];
                
                return (
                  <motion.div
                    key={type.id}
                    className="relative h-80 cursor-pointer"
                    style={{ perspective: '1000px' }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onClick={() => handleCardFlip(type.id)}
                  >
                    {/* Flip Card Container */}
                    <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                      <motion.div
                        className="absolute inset-0 w-full h-full"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ 
                          duration: 0.6, 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 30 
                        }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Front Side */}
                        <div
                          className={`absolute inset-0 ${bgColor} rounded-2xl shadow-lg border border-emerald-700 flex flex-col items-center justify-center p-6`}
                          style={{ 
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden'
                          }}
                  >
                          {/* Icon */}
                          <motion.div 
                            className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            {getIcon(type.icon, "w-8 h-8 text-white")}
                          </motion.div>
                          
                          {/* Title */}
                          <h3 className="text-xl font-bold text-white text-center mb-4 tracking-tight">
                            {type.title}
                          </h3>
                          
                          {/* Flip Hint */}
                          <motion.div
                            className="text-slate-200 text-sm text-center opacity-80"
                            animate={{ opacity: [0.6, 0.9, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            Hover or tap to learn more
                          </motion.div>
                        </div>

                        {/* Back Side */}
                        <div
                          className={`absolute inset-0 ${bgColor} rounded-2xl shadow-lg border border-emerald-700 p-6 overflow-y-auto`}
                          style={{ 
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                          }}
                        >
                          <div className="h-full flex flex-col">
                            {/* Back Icon */}
                            <div className="flex justify-center mb-4">
                              <motion.div 
                                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                {getIcon(type.icon, "w-6 h-6 text-white")}
                              </motion.div>
                      </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-white text-center mb-4 tracking-tight">
                              {type.title}
                            </h3>
                            
                            {/* Description */}
                            <p className="text-slate-100 text-sm leading-relaxed mb-4 flex-grow">
                              {type.overview}
                            </p>
                            
                            {/* Flip Back Hint */}
                            <div className="text-slate-200 text-xs text-center opacity-70 mt-auto">
                              Tap to flip back
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Focus Helper */}
          <AnimatePresence>
            {showFocusHelper && (
              <motion.div
                className="fixed bottom-4 right-4 bg-sleek-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </motion.div>
                  <span className="font-semibold">Take your time exploring!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <motion.div 
              className="card focus-helper"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-sleek-500 to-emerald-500 rounded-full flex items-center justify-center mr-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900">Getting Help</h3>
                </div>
                <p className="text-gray-600 text-adhd-friendly-large">
                  If you suspect you have ADHD, the first step is to consult with a healthcare professional. 
                  They can provide a proper diagnosis and recommend appropriate treatment options.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="card focus-helper"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-sleek-500 rounded-full flex items-center justify-center mr-4"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900">Treatment Options</h3>
                </div>
                <p className="text-gray-600 text-adhd-friendly-large">
                  ADHD can be managed through various approaches including medication, therapy, lifestyle changes, 
                  and behavioral strategies. What works best varies from person to person.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal for detailed content */}
      <AnimatePresence>
        {selectedNode.node && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNode({ node: null, isCenter: false })}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${adhdData.nodes.find(n => n.id === selectedNode.node.id)?.colorClass} text-white p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getIcon(adhdData.nodes.find(n => n.id === selectedNode.node.id)?.icon || 'brain')}
                    <h2 className="text-3xl font-bold">{adhdData.nodes.find(n => n.id === selectedNode.node.id)?.title}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedNode({ node: null, isCenter: false })}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content - Only for branch nodes */}
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {/* Branch node content with tabs */}
                  <div>
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 rounded-lg p-1">
                      {['overview', 'symptoms', 'examples', 'resources', 'myths', 'strategies'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                            activeTab === tab
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {tab === 'strategies' ? 'Strategies' : tab}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-4">
                      {activeTab === 'overview' && (
                        <div>
                          <p className="text-gray-700 text-lg leading-relaxed">{adhdData.nodes.find(n => n.id === selectedNode.node.id)?.overview}</p>
                          {adhdData.nodes.find(n => n.id === selectedNode.node.id)?.statistics && (
                            <div className="mt-6">
                              <h4 className="font-semibold text-gray-800 mb-3">Statistics</h4>
                              <ul className="space-y-2">
                                {adhdData.nodes.find(n => n.id === selectedNode.node.id)?.statistics?.map((stat: string, index: number) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <svg className="w-5 h-5 text-sleek-500 mt-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M3 3h18v2H3V3m1 4h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7m4 3v2h8v-2H7m0 4v2h8v-2H7z"/>
                                    </svg>
                                    <span className="text-gray-700">{stat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'symptoms' && adhdData.nodes.find(n => n.id === selectedNode.node.id)?.symptoms && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Common Symptoms</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {adhdData.nodes.find(n => n.id === selectedNode.node.id)?.symptoms?.map((symptom: string, index: number) => (
                              <div key={index} className="flex items-start space-x-2 p-3 bg-sleek-50 rounded-lg">
                                <span className="text-sleek-500 mt-1">•</span>
                                <span className="text-gray-700">{symptom}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'examples' && adhdData.nodes.find(n => n.id === selectedNode.node.id)?.realLifeExamples && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Real-Life Examples</h4>
                          <div className="space-y-4">
                            {adhdData.nodes.find(n => n.id === selectedNode.node.id)?.realLifeExamples?.map((example: any, index: number) => (
                              <div key={index} className="bg-sleek-50 border border-sleek-200 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                  <span className="w-8 h-8 bg-sleek-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {index + 1}
                              </span>
                                  <span className="font-semibold text-sleek-900 ml-3">{example.name}</span>
                                </div>
                                <p className="text-sleek-800">{example.story}</p>
                            </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'resources' && adhdData.nodes.find(n => n.id === selectedNode.node.id)?.resources && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Additional Resources</h4>
                          <div className="space-y-3">
                            {adhdData.nodes.find(n => n.id === selectedNode.node.id)?.resources?.map((resource: any, index: number) => (
                              <a
                                key={index}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                              >
                                <span className="w-3 h-3 rounded-full bg-sleek-500"></span>
                                <span className="text-sleek-700 group-hover:text-sleek-800 flex-1">{resource.title}</span>
                                <span className="text-xs text-gray-500 uppercase">{resource.type}</span>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'myths' && adhdData.nodes.find(n => n.id === selectedNode.node.id)?.myths && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Myths vs. Facts</h4>
                          <div className="space-y-4">
                            {adhdData.nodes.find(n => n.id === selectedNode.node.id)?.myths?.map((item: any, index: number) => (
                              <div key={index} className="border rounded-lg overflow-hidden">
                                <div className="bg-sleek-50 border-b border-sleek-200 p-3">
                                  <div className="flex items-start space-x-2">
                                    <svg className="w-5 h-5 text-sleek-500" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                    <div>
                                      <span className="font-semibold text-sleek-900">Myth:</span>
                                      <p className="text-sleek-800 mt-1">{item.myth}</p>
                                    </div>
                                  </div>
                                  <div className="bg-emerald-50 p-3 mt-2">
                                    <div className="flex items-start space-x-2">
                                      <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                      </svg>
                                      <div>
                                        <span className="font-semibold text-emerald-900">Fact:</span>
                                        <p className="text-emerald-800 mt-1">{item.fact}</p>
                                      </div>
                                </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'strategies' && (adhdData.nodes.find(n => n.id === selectedNode.node.id)?.copingStrategies || adhdData.nodes.find(n => n.id === selectedNode.node.id)?.managementStrategies || adhdData.nodes.find(n => n.id === selectedNode.node.id)?.treatmentConsiderations) && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Management Strategies</h4>
                          <div className="space-y-4">
                            {adhdData.nodes.find(n => n.id === selectedNode.node.id)?.copingStrategies && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Coping Strategies</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {adhdData.nodes.find(n => n.id === selectedNode.node.id)?.copingStrategies?.map((strategy: string, index: number) => (
                                    <div key={index} className="flex items-start space-x-2 p-2 bg-sleek-50 rounded-lg">
                                      <svg className="w-4 h-4 text-sleek-500 mt-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                      </svg>
                                      <span className="text-gray-700 text-sm">{strategy}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {adhdData.nodes.find(n => n.id === selectedNode.node.id)?.managementStrategies && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Management Strategies</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {adhdData.nodes.find(n => n.id === selectedNode.node.id)?.managementStrategies?.map((strategy: string, index: number) => (
                                    <div key={index} className="flex items-start space-x-2 p-2 bg-sleek-50 rounded-lg">
                                      <svg className="w-4 h-4 text-sleek-500 mt-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                      </svg>
                                      <span className="text-gray-700 text-sm">{strategy}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {adhdData.nodes.find(n => n.id === selectedNode.node.id)?.treatmentConsiderations && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Treatment Considerations</h5>
                                <div className="space-y-2">
                                  {adhdData.nodes.find(n => n.id === selectedNode.node.id)?.treatmentConsiderations?.map((consideration: string, index: number) => (
                                    <div key={index} className="flex items-start space-x-2 p-2 bg-sleek-50 rounded-lg">
                                      <svg className="w-4 h-4 text-sleek-500 mt-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 12 12 12s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.96.76 1.58V19z"/>
                                      </svg>
                                      <span className="text-gray-700 text-sm">{consideration}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medical Disclaimer - Bottom of Page */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="mt-16 px-4 md:px-6 lg:px-8"
      >
        <MedicalDisclaimer />
      </motion.div>
    </div>
  );
};

export default AboutADHDPage; 