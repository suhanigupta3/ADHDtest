import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const WelcomePage: React.FC = () => {
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
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1v5h5v10H6V3h7z"/>
          <path d="M9 12h6v2H9zm0 4h6v2H9z"/>
        </svg>
      ),
      color: "from-darkforest-500 to-darkforest-600"
    },
    {
      title: "ASRS v1.1",
      description: "The Adult ADHD Self-Report Scale branches off of the DSM 4, and screens for the most prevalent symptoms of ADHD.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h18v2H3V3m1 4h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7m4 3v2h8v-2H7m0 4v2h8v-2H7z"/>
        </svg>
      ),
      color: "from-earth-500 to-earth-600"
    },
    {
      title: "HIPAA Compliant",
      description: "Your data will be secure. HIPAA protects your confidentiality and grants you the right to access your own health records. This includes through encryption.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11c.6 0 1.2.6 1.2 1.3v3.5c0 .6-.6 1.2-1.3 1.2H9.2c-.6 0-1.2-.6-1.2-1.2v-3.5c0-.6.6-1.2 1.2-1.2V9.5C10.2 8.1 11.6 7 13 7z"/>
        </svg>
      ),
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
    
  }, []); // Recalculate positions when viewport size changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-100 to-forest-200 relative overflow-hidden">
      {/* Floating Background Elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute text-emerald-600 opacity-50 pointer-events-none z-10"
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
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-emerald-500/40 to-green-500/40 rounded-full blur-xl"
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
          className="absolute bottom-32 right-16 w-40 h-40 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full blur-xl"
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
          className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-r from-emerald-400/45 to-green-400/45 rounded-full blur-lg"
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
              className="absolute w-32 h-32 border-2 border-emerald-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute w-40 h-40 border border-emerald-600 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="w-24 h-24 relative z-10">
              <img 
                src="/adhd-logo.png" 
              alt="A(rDx)HD Logo" 
                className="w-24 h-24 object-contain drop-shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full shadow-lg hidden">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              A(rDx)HD
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover a comprehensive, science-based approach to understanding ADHD through interactive assessments and personalized insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <motion.button
                className="btn-primary-dark px-8 py-4 text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
              >
              Start Assessment
              </motion.button>
            </Link>
            
            <Link to="/about-adhd">
              <motion.button
                className="btn-secondary-dark px-8 py-4 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="mb-12 max-w-6xl mx-auto"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            What our Assessment Includes
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {assessmentFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="card-dark p-6 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
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
                    className="text-sleek-300 mb-3 flex justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-emerald-300 mb-3">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sage-100 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action Section */}
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-sleek-900/50 to-emerald-900/50 backdrop-blur-sm rounded-3xl p-8 border border-sleek-600">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Begin Your Journey?
            </h3>
            <p className="text-sage-100 mb-6 max-w-2xl mx-auto">
              Join thousands of individuals who have gained valuable insights into their cognitive patterns through our comprehensive A(rDx)HD platform.
            </p>
            <Link to="/auth">
              <motion.button
                className="btn-primary-dark px-8 py-4 text-lg"
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                Get Started Now
              </motion.button>
                </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomePage; 