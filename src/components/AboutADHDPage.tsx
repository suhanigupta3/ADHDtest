import React, { useState } from 'react';
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

  // Calculate node positions
  const calculatePosition = (angle: number, distance: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * distance,
      y: Math.sin(radian) * distance
    };
  };

  // Handle node expansion
  const handleNodeClick = (nodeId: string, node: any, isCenter: boolean = false) => {
    if (isCenter && !webExpanded) {
      // Expand main spider web from center - NO MODAL for center node
      setWebExpanded(true);
      setExpandedNodes(new Set(['what-is-adhd']));
      setVisibleNodes(new Set(['what-is-adhd', ...adhdData.nodes.map(n => n.id)]));
    } else if (!isCenter && !expandedNodes.has(nodeId)) {
      // Expand sub-branches from this node AND open modal
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
      setSelectedNode({ node: node, isCenter: false });
    }
    // Center node never opens a modal - information is already displayed on the page
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkforest-50 via-earth-50 to-darkforest-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="inline-flex items-center text-darkforest-700 hover:text-darkforest-800 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            
            <div className="flex items-center space-x-3">
              <img 
                src="/adhd-logo.png" 
                alt="ADHD Assessment Logo" 
                className="w-10 h-10 object-contain"
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
              <h1 className="text-xl font-bold text-gray-900">ADHD Assessment</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gradient mb-6">About ADHD</h1>
        </motion.div>

        {/* What is ADHD Section */}
        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${adhdData.centerNode.colorClass} flex items-center justify-center text-white`}>
                {getIcon(adhdData.centerNode.icon, "w-8 h-8")}
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{adhdData.centerNode.title}</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Definition</h3>
                <p className="text-gray-700 text-lg leading-relaxed">{adhdData.centerNode.definition}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Facts</h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {adhdData.centerNode.keyFacts.map((fact: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                      <span className="text-gray-700">{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Learn More</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {adhdData.centerNode.resources.map((resource: any, index: number) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></span>
                      <span className="text-darkforest-700 group-hover:text-darkforest-800 flex-1">{resource.title}</span>
                      <span className="text-xs text-gray-500 uppercase">{resource.type}</span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Spider Web Introduction */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore ADHD Types & Information</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Click the center node below to reveal the different aspects of ADHD, then explore each topic in detail.
          </p>
          {!webExpanded && (
            <motion.div 
              className="inline-flex items-center space-x-2 text-emerald-600 font-medium"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span>Click the center circle to begin exploration</span>
            </motion.div>
          )}
        </motion.div>

        {/* Spider Web Visualization */}
        <motion.div
          className="relative w-full min-h-[70vh] max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Connection Lines */}
          {webExpanded && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
                {adhdData.nodes
                 .filter((node: NodeData) => visibleNodes.has(node.id))
                 .map((node: NodeData, index: number) => {
                   const pos = calculatePosition(node.position.angle, node.position.distance);
                   const centerX = 50;
                   const centerY = 45;
                   const nodeX = centerX + (pos.x / 15);
                   const nodeY = centerY + (pos.y / 8);
                   
                   return (
                     <motion.line
                       key={`line-${node.id}`}
                       x1={`${centerX}%`}
                       y1={`${centerY}%`}
                       x2={`${nodeX}%`}
                       y2={`${nodeY}%`}
                       stroke="url(#connectionGradient)"
                       strokeWidth="2"
                       strokeDasharray="5,5"
                       initial={{ pathLength: 0, opacity: 0 }}
                       animate={{ pathLength: 1, opacity: 0.4 }}
                       transition={{ duration: 0.8, delay: index * 0.1 + 0.5 }}
                     />
                   );
                 })}
              <defs>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          )}

                    {/* Center Node */}
          <motion.div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: '45%', top: '30%', zIndex: 10 }}
            initial="hidden"
            animate="visible"
            custom={{ x: 0, y: 0, delay: 0 }}
            variants={nodeVariants}
            whileHover="hover"
            onHoverStart={() => setSelectedNode({ node: adhdData.centerNode, isCenter: true })}
            onHoverEnd={() => setSelectedNode({ node: null, isCenter: false })}
            onClick={() => handleNodeClick('what-is-adhd', adhdData.centerNode, true)}
          >
            <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${adhdData.centerNode.colorClass} shadow-2xl cursor-pointer flex flex-col items-center justify-center text-white transition-all duration-500 hover:shadow-2xl hover:scale-105 relative overflow-hidden group`}>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Pulse ring when not expanded */}
              {!webExpanded && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-white/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              
              <div className="relative z-10 flex flex-col items-center justify-center">
                {getIcon(adhdData.centerNode.icon, "w-12 h-12")}
                <div className="text-lg font-bold mt-2 text-center leading-tight px-2">
                  {adhdData.centerNode.title}
                </div>
                {!webExpanded && (
                  <div className="text-xs mt-1 opacity-90 text-center">
                    Click to explore
                  </div>
                )}
              </div>

              {/* Success indicator when expanded */}
              {webExpanded && (
                <motion.div
                  className="absolute -bottom-3 -right-3 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5, type: "spring" }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Surrounding Nodes */}
          <AnimatePresence>
            {adhdData.nodes
              .filter((node: NodeData) => visibleNodes.has(node.id))
              .map((node: NodeData, index: number) => {
                const pos = calculatePosition(node.position.angle, node.position.distance);
                
                return (
                  <motion.div
                    key={node.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '45%', top: '35%', zIndex: 10 }}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={{ x: pos.x, y: pos.y, delay: index * 0.15 + 0.3 }}
                    variants={nodeVariants}
                    whileHover="hover"
                    onHoverStart={() => setSelectedNode({ node: node, isCenter: false })}
                    onHoverEnd={() => setSelectedNode({ node: null, isCenter: false })}
                    onClick={() => handleNodeClick(node.id, node, false)}
                  >
                    <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${node.colorClass} shadow-xl cursor-pointer flex flex-col items-center justify-center text-white transition-all duration-300 hover:shadow-2xl hover:scale-110 relative overflow-hidden group`}>
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10 flex flex-col items-center justify-center p-2">
                        {getIcon(node.icon, "w-6 h-6")}
                        <div className="text-sm font-semibold mt-1 text-center leading-tight">
                          {node.title}
                        </div>
                      </div>

                      {/* Click indicator */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-white/50"
                        initial={{ scale: 1, opacity: 0 }}
                        whileHover={{ scale: 1.1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </motion.div>

        {/* Progress Indicator */}
        {webExpanded && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <div className="inline-flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Web Expanded</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <span className="text-sm text-gray-600">Click any node to learn more</span>
            </div>
          </motion.div>
        )}

        {/* Instructions */}

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
                                    <span className="text-blue-500 mt-1">📊</span>
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
                              <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                                <span className="text-red-500 mt-1">•</span>
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
                              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {example.name[0]}
                                  </span>
                                  <span className="font-semibold text-blue-900">{example.name}</span>
                                </div>
                                <p className="text-blue-800">{example.story}</p>
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
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-darkforest-700 group-hover:text-darkforest-800 flex-1">{resource.title}</span>
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
                                <div className="bg-red-50 border-b border-red-200 p-3">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-red-500">❌</span>
                                    <span className="font-semibold text-red-900">Myth:</span>
                                  </div>
                                  <p className="text-red-800 mt-1">{item.myth}</p>
                                </div>
                                <div className="bg-green-50 p-3">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✅</span>
                                    <span className="font-semibold text-green-900">Fact:</span>
                                  </div>
                                  <p className="text-green-800 mt-1">{item.fact}</p>
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
                                    <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded-lg">
                                      <span className="text-green-500 mt-1">💡</span>
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
                                    <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded-lg">
                                      <span className="text-blue-500 mt-1">🎯</span>
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
                                    <div key={index} className="flex items-start space-x-2 p-2 bg-purple-50 rounded-lg">
                                      <span className="text-purple-500 mt-1">🏥</span>
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
    </div>
  );
};

export default AboutADHDPage; 