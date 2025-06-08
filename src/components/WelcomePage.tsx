import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const WelcomePage: React.FC = () => {
  // Dynamic viewport dimensions
  const [viewportDimensions, setViewportDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set initial dimensions
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const assessmentFeatures = [
    {
      title: "DSM 5",
      description: "The Diagnostic and Statistical Manual of Mental Disorders 5th edition is a diagnosis tool used by mental health professionals. It includes a standard for diagnosing mental illnesses including ADHD.",
      icon: "📋",
      color: "from-darkforest-500 to-darkforest-600"
    },
    {
      title: "ASRS v1.1",
      description: "The Adult ADHD Self-Report Scale branches off of the DSM 4, and screens for the most prevalent symptoms of ADHD.",
      icon: "📊",
      color: "from-earth-500 to-earth-600"
    },
    {
      title: "HIPAA Compliant",
      description: "Your data will be secure. HIPAA protects your confidentiality and grants you the right to access your own health records. This includes through encryption.",
      icon: "🔒",
      color: "from-emerald-500 to-emerald-600"
    }
  ];

  // Floating background elements with collision-free positions
  const floatingElements = useMemo(() => {
    // Generate evenly distributed fixed positions for floating elements
    const generateSpacedPositions = () => {
      interface FinalPosition {
        top: string;
        left?: string;
        right?: string;
      }
      
      const positions: FinalPosition[] = [];
      const totalElements = 12;
      
      // Create grid layout: 6 on left, 6 on right, evenly spaced vertically
      const elementsPerSide = 6;
      const verticalSpacing = 80 / (elementsPerSide + 1); // Distribute across 80% of height with padding
      
      for (let i = 0; i < totalElements; i++) {
        const side = i < elementsPerSide ? 'left' : 'right';
        const sideIndex = i % elementsPerSide;
        
        // Calculate vertical position: evenly distributed with some randomness
        const baseVerticalPosition = 15 + (sideIndex + 1) * verticalSpacing; // Start at 15%, then space evenly
        const randomOffset = (Math.random() - 0.5) * 6; // ±3% random offset
        const verticalPosition = Math.max(10, Math.min(90, baseVerticalPosition + randomOffset));
        
        // Calculate horizontal position with some randomness
        const baseHorizontalPosition = side === 'left' ? 6 : 6; // 6% from edge
        const randomHorizontalOffset = Math.random() * 8; // 0-8% additional offset
        const horizontalPosition = baseHorizontalPosition + randomHorizontalOffset;
        
        const position: FinalPosition = {
          top: `${verticalPosition}%`
        };
        
        if (side === 'left') {
          position.left = `${horizontalPosition}%`;
        } else {
          position.right = `${horizontalPosition}%`;
        }
        
        positions.push(position);
      }
      
      return positions;
    };

    const positions = generateSpacedPositions();
    
    return [
      {
        icon: () => (
          <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
            {/* Brain with lightning bolt (ADHD overload) */}
            <path d="M12 2C8.1 2 5 5.1 5 9v.5c0 .5.5 1 1 1s1-.5 1-1V9c0-2.8 2.2-5 5-5s5 2.2 5 5v.5c0 .5.5 1 1 1s1-.5 1-1V9c0-3.9-3.1-7-7-7zm-.5 7h-1.8l2.3-4H9l.8-2h4.5l-2.3 4h2.3l-3.3 6z" />
          </svg>
        ),
        position: positions[0],
        delay: 0
      },
      {
        icon: () => (
          <svg className="w-13 h-13" fill="currentColor" viewBox="0 0 24 24">
            {/* Meditation figure */}
            <path d="M12 2C13.1 2 14 2.9 14 4s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm7.8 13.4-3.2-1.1-1.2 2.1 2.2 3.6-1.8 1.1-2.5-4.2-1.3-2.2-1.3 2.2-2.5 4.2-1.8-1.1 2.2-3.6-1.2-2.1-3.2 1.1V14l4-1.4 2-3.3v-1c0-.6.4-1 1-1s1 .4 1 1v1l2 3.3 4 1.4v1.4z" />
          </svg>
        ),
        position: positions[1],
        delay: 1
      },
      {
        icon: () => (
          <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
            {/* True Brain Icon */}
            <path d="M13 2c.31 0 .61.03.9.08A3.5 3.5 0 0 1 20 5.5c0 .73-.25 1.4-.66 1.94A3.49 3.49 0 0 1 20 10a3.5 3.5 0 0 1-2 6.44v.56a2 2 0 1 1-4 0v-1.29c-.32-.07-.66-.11-1-.11s-.68.04-1 .11V20a2 2 0 1 1-4 0v-.56A3.5 3.5 0 0 1 4 10c0-1.12.52-2.12 1.34-2.78A3.5 3.5 0 0 1 10 3.05 3.49 3.49 0 0 1 13 2Zm-2 2a1.5 1.5 0 0 0-1.5 1.5V8H9V7a1 1 0 0 0-2 0v2.17l-.83.39A1.5 1.5 0 0 0 7 13h1v2.5a1.5 1.5 0 0 0 3 0V4Zm2 0v10.5a1.5 1.5 0 0 0 3 0V13h1a1.5 1.5 0 0 0 .83-2.78L17 9.17V7a1 1 0 0 0-2 0v1h-.5V5.5A1.5 1.5 0 0 0 13 4Z" />
          </svg>
        ),
        position: positions[2],
        delay: 2
      },
      {
        icon: () => (
          <svg className="w-13 h-13" fill="currentColor" viewBox="0 0 24 24">
            {/* Clock / time blindness */}
            <path d="M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2zm1 11V7h-2v7h5v-2h-3z" />
          </svg>
        ),
        position: positions[3],
        delay: 3
      },
      {
        icon: () => (
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            {/* Chat bubble / therapy */}
            <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-2 10H6v-2h12v2zm0-3H6V7h12v2z" />
          </svg>
        ),
        position: positions[4],
        delay: 4
      },
      {
        icon: () => (
          <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
            {/* Heartbeat / emotional wellbeing */}
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08A6.464 6.464 0 0 1 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ),
        position: positions[5],
        delay: 5
      },
      {
        icon: () => (
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            {/* Focus crosshair */}
            <path d="M12 2v2a8 8 0 1 1-8 8H2a10 10 0 1 0 10-10zm-1 5v5H6v2h7V7h-2z" />
          </svg>
        ),
        position: positions[6],
        delay: 6
      },
      {
        icon: () => (
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            {/* Journal/Pen (routine/logging) */}
            <path d="M3 3h18v2H3V3m1 4h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7m4 3v2h8v-2H7m0 4v2h8v-2H7z" />
          </svg>
        ),
        position: positions[7],
        delay: 7
      },
      {
        icon: () => (
          <svg className="w-13 h-13" fill="currentColor" viewBox="0 0 24 24">
            {/* Swirl (mental overwhelm) */}
            <path d="M12 2a10 10 0 0 1 7.07 17.07l-1.41-1.41A8 8 0 1 0 4.93 4.93L3.51 3.51A10 10 0 0 1 12 2z" />
          </svg>
        ),
        position: positions[8],
        delay: 8
      },
      {
        icon: () => (
          <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
            {/* Brain + heart (empathy + thought) */}
            <path d="M12 2c2.8 0 5 2.2 5 5 0 1.3-.5 2.5-1.4 3.4-.9.9-2.1 1.4-3.4 1.4s-2.5-.5-3.4-1.4C7.5 9.5 7 8.3 7 7c0-2.8 2.2-5 5-5m0 18l6-6h-4v-4h-4v4H6l6 6z" />
          </svg>
        ),
        position: positions[9],
        delay: 9
      },
      {
        icon: () => (
          <svg className="w-13 h-13" fill="currentColor" viewBox="0 0 24 24">
            {/* Tangled lines (stress/anxiety) */}
            <path d="M4 10c0 3 2 4 4 4s4-1 4-4-2-4-4-4-4 1-4 4zm10 0c0 3 2 4 4 4s4-1 4-4-2-4-4-4-4 1-4 4z" />
          </svg>
        ),
        position: positions[10],
        delay: 10
      },
      
      {
        icon: () => (
          <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
            {/* Lightning (energy/impulsivity) */}
            <path d="M13 2L3 14h7v8l10-12h-7z" />
          </svg>
        ),
        position: positions[11],
        delay: 11
      }
    ];
    
  }, [viewportDimensions]); // Recalculate positions when viewport size changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Floating Background Elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute text-darkforest-500 opacity-45 pointer-events-none z-10"
          style={element.position}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: element.delay,
            ease: "easeInOut"
          }}
        >
          <element.icon />
        </motion.div>
      ))}

      {/* Decorative Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-32 right-16 w-40 h-40 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-lg"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      <motion.div
        className="container mx-auto px-8 md:px-16 lg:px-24 py-16 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <div className="relative inline-flex items-center justify-center mb-8">
            {/* Animated rings around logo */}
            <motion.div 
              className="absolute w-32 h-32 border-2 border-darkforest-200 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute w-40 h-40 border border-blue-200 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="w-24 h-24 relative z-10">
              <img 
                src="/adhd-logo.png" 
                alt="ADHD Assessment Logo" 
                className="w-24 h-24 object-contain drop-shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-darkforest-500 to-darkforest-700 rounded-full shadow-lg hidden">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <motion.h1 
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-darkforest-800 to-gray-900 bg-clip-text text-transparent mb-4 mt-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Dynamic  ADHD Assessment
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Our free, HIPAA compliant, comprehensive assessment contains questionnaires used by mental health 
            professionals to make your diagnosis as accurate as possible. The results of your assessment may 
            also be mailed to your healthcare professional.
          </motion.p>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link 
              to="/auth" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-darkforest-600 to-darkforest-700 text-white text-lg font-semibold rounded-lg hover:from-darkforest-700 hover:to-darkforest-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Start Assessment
            </Link>
          </motion.div>
        </motion.div>

        {/* Taking the Assessment Section */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 border border-white/20 max-w-5xl mx-auto"
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Taking the Assessment
            </h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
            Our ADHD assessment is simple, confidential, and completely risk-free. It takes approximately 
            30 minutes to complete and is designed to provide a clear understanding of whether ADHD might 
            be affecting your daily life. This is an important first step in gaining clarity and exploring 
            potential next steps, all in a supportive and judgment-free environment.
          </p>
        </motion.div>

        {/* About our Assessment Section */}
        <motion.div 
          className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white/20 max-w-5xl mx-auto"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M12 8v4m0 4v-4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              About our Assessment
            </h2>
          </div>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              This assessment will be integrated into a game. This game will be simple, fun, and engaging. 
              When you reach certain milestones in the game the assessment will prompt you with a questionnaire. 
              At the end of the assessment, your results will appear on the screen.
            </p>
                         <motion.div 
               className="bg-white/80 rounded-xl p-6 shadow-lg border border-white/30"
               whileHover={{ scale: 1.03 }}
               transition={{ duration: 0.3 }}
             >
               <div className="flex items-center justify-center">
                 <motion.svg 
                   className="w-8 h-8 text-green-600 mr-2 flex-shrink-0" 
                   fill="currentColor" 
                   viewBox="0 0 20 20"
                   animate={{ scale: [1, 1.1, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                 >
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </motion.svg>
                 <span className="text-lg font-semibold text-gray-800 leading-tight">
                   You may save it and mail it to your healthcare professional.
                 </span>
               </div>
             </motion.div>
          </div>
        </motion.div>

        {/* What our Assessment Includes Section */}
        <motion.div 
          className="mb-12 max-w-6xl mx-auto"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What our Assessment Includes
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {assessmentFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-white/20 relative overflow-hidden"
                whileHover={{ y: -8, scale: 1.02 }}
                variants={itemVariants}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index, duration: 0.6 }}
              >
                {/* Gradient overlay */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color}`} />
                
                <div className="text-center mb-4">
                  <motion.div 
                    className="text-4xl mb-3"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action Section */}
        <motion.div 
          className="bg-gradient-to-r from-darkforest-50/80 to-earth-50/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 relative overflow-hidden max-w-5xl mx-auto"
          variants={itemVariants}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 100 100">
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1" />
              </pattern>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <motion.h3 
              className="text-2xl font-bold text-gray-900 mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Ready to Begin Your Assessment?
            </motion.h3>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              Take the first step towards understanding your ADHD symptoms with our comprehensive, 
              professional-grade assessment tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/auth" 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-darkforest-600 to-darkforest-700 text-white text-lg font-semibold rounded-lg hover:from-darkforest-700 hover:to-darkforest-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Start Assessment
                </Link>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/resources" 
                  className="inline-flex items-center px-8 py-4 bg-white/90 text-darkforest-600 text-lg font-semibold rounded-lg hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl border border-darkforest-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Learn About ADHD
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div 
          className="mt-12 p-6 bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-2xl max-w-4xl mx-auto"
          variants={itemVariants}
        >
          <p className="text-sm text-amber-800 text-center leading-relaxed">
            <strong className="text-amber-900">Important Disclaimer:</strong> This assessment is for educational and screening purposes only. 
            It is not intended to replace professional medical advice, diagnosis, or treatment. Always seek the advice of qualified 
            healthcare providers regarding ADHD diagnosis and treatment options. Results should be discussed with a healthcare professional.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomePage; 