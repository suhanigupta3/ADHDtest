import React from 'react';
import { motion } from 'framer-motion';

const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-100 to-forest-200">
      {/* Floating Symbols Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Brain Symbol */}
        <motion.div
          className="absolute text-emerald-300 opacity-20"
          style={{ top: '15%', left: '10%' }}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -5, 20, 0],
            rotate: [0, 8, -5, 12, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </motion.div>

        {/* Brain Waves Symbol */}
        <motion.div
          className="absolute text-green-400 opacity-18"
          style={{ top: '25%', right: '15%' }}
          animate={{
            y: [0, 25, -10, 15, 0],
            x: [0, -12, 8, -18, 0],
            rotate: [0, -5, 3, -8, 0]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h4l3-9 4 18 3-9h4" />
          </svg>
        </motion.div>

        {/* Neuron Symbol */}
        <motion.div
          className="absolute text-emerald-500 opacity-15"
          style={{ bottom: '30%', left: '20%' }}
          animate={{
            y: [0, -20, 15, -25, 0],
            x: [0, 25, -10, 30, 0],
            rotate: [0, 12, -8, 15, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
          </svg>
        </motion.div>

        {/* DNA Helix Symbol */}
        <motion.div
          className="absolute text-green-500 opacity-16"
          style={{ bottom: '20%', right: '25%' }}
          animate={{
            y: [0, 30, -15, 25, 0],
            x: [0, -20, 12, -25, 0],
            rotate: [0, -8, 5, -12, 0]
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </motion.div>

        {/* Synapse Symbol */}
        <motion.div
          className="absolute text-emerald-400 opacity-14"
          style={{ top: '60%', left: '5%' }}
          animate={{
            y: [0, 18, -12, 22, 0],
            x: [0, 30, -15, 25, 0],
            rotate: [0, -10, 6, -12, 0]
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8m-4-4v8" />
          </svg>
        </motion.div>

        {/* Microscope Symbol */}
        <motion.div
          className="absolute text-green-400 opacity-17"
          style={{ top: '45%', right: '8%' }}
          animate={{
            y: [0, -25, 18, -30, 0],
            x: [0, 12, -8, 15, 0],
            rotate: [0, 5, -3, 8, 0]
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8
          }}
        >
          <svg className="w-11 h-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </motion.div>

        {/* Neural Network Symbol */}
        <motion.div
          className="absolute text-emerald-300 opacity-12"
          style={{ top: '10%', left: '60%' }}
          animate={{
            y: [0, 8, -5, 12, 0],
            x: [0, -6, 4, -8, 0],
            rotate: [0, -2, 1, -3, 0]
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M8 12h8m-4-4v8"/>
          </svg>
        </motion.div>

        {/* Brain Scan Symbol */}
        <motion.div
          className="absolute text-green-300 opacity-13"
          style={{ top: '70%', left: '75%' }}
          animate={{
            y: [0, -15, 8, -10, 0],
            x: [0, 5, -3, 7, 0],
            rotate: [0, 4, -2, 6, 0]
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2
          }}
        >
          <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M12 6v12m-3-6h6"/>
          </svg>
        </motion.div>

        {/* Cognitive Function Symbol */}
        <motion.div
          className="absolute text-emerald-400 opacity-15"
          style={{ top: '35%', left: '85%' }}
          animate={{
            y: [0, 12, -8, 15, 0],
            x: [0, -4, 6, -2, 0],
            rotate: [0, -3, 2, -1, 0]
          }}
          transition={{
            duration: 21,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5
          }}
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M12 8v8m-4-4h8"/>
          </svg>
        </motion.div>

        {/* Research Data Symbol */}
        <motion.div
          className="absolute text-green-150 opacity-10"
          style={{ bottom: '15%', left: '40%' }}
          animate={{
            y: [0, -8, 12, -6, 0],
            x: [0, 10, -5, 8, 0],
            rotate: [0, 2, -1, 3, 0]
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v18H3z"/>
            <path d="M7 7h10v2H7zM7 11h8v2H7zM7 15h6v2H7z"/>
          </svg>
        </motion.div>

        {/* Brain Hemisphere Symbol */}
        <motion.div
          className="absolute text-emerald-200 opacity-11"
          style={{ top: '80%', left: '25%' }}
          animate={{
            y: [0, 6, -10, 8, 0],
            x: [0, -8, 4, -6, 0],
            rotate: [0, -1, 2, -2, 0]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.8
          }}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M12 2v20"/>
          </svg>
        </motion.div>

        {/* Neurotransmitter Symbol */}
        <motion.div
          className="absolute text-green-100 opacity-13"
          style={{ top: '5%', left: '35%' }}
          animate={{
            y: [0, -12, 6, -8, 0],
            x: [0, 7, -3, 5, 0],
            rotate: [0, 3, -2, 1, 0]
          }}
          transition={{
            duration: 23,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.7
          }}
        >
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M12 6v12m-3-6h6"/>
          </svg>
        </motion.div>

        {/* Medical Cross Symbol */}
        <motion.div
          className="absolute text-emerald-150 opacity-09"
          style={{ bottom: '40%', right: '35%' }}
          animate={{
            y: [0, 8, -6, 10, 0],
            x: [0, -5, 3, -7, 0],
            rotate: [0, -2, 1, -3, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.4
          }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13z"/>
          </svg>
        </motion.div>

        {/* Attention Focus Symbol */}
        <motion.div
          className="absolute text-green-200 opacity-10"
          style={{ top: '20%', left: '80%' }}
          animate={{
            y: [0, -10, 5, -8, 0],
            x: [0, 4, -2, 6, 0],
            rotate: [0, 2, -1, 3, 0]
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.2
          }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </motion.div>

        {/* Memory Symbol */}
        <motion.div
          className="absolute text-emerald-100 opacity-11"
          style={{ bottom: '60%', right: '5%' }}
          animate={{
            y: [0, 12, -8, 10, 0],
            x: [0, -3, 5, -4, 0],
            rotate: [0, -1, 2, -2, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.6
          }}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M12 6v12m-3-6h6"/>
          </svg>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            About Us
          </h1>
          
          <div className="bg-[#DDEBDD]/80 backdrop-blur-sm rounded-lg shadow-lg p-8 mb-8 border border-[#C8D8C8]">
            <div className="flex items-center justify-center mx-auto mb-6">
              <h1 className="text-4xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  A(rDx)HD
                </span>
              </h1>
            </div>
            
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              Our Mission
            </h2>
            
            <p className="text-lg text-black mb-6 leading-relaxed">
              Our mission is to transform ADHD diagnosis by leveraging gamification and adaptive 
              assessment technologies. We strive to provide more accurate, engaging, and inclusive 
              diagnostic tools that capture the dynamic and nuanced nature of ADHD, especially in 
              younger and neurodiverse individuals, empowering clinicians and families with deeper 
              insights and earlier interventions.
            </p>
            
          </div>
          
          {/* Research Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-[#DDEBDD]/80 backdrop-blur-sm rounded-lg shadow-lg p-8 mb-8 border border-[#C8D8C8]"
          >
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              Research
            </h2>
            <p className="text-black mb-6 leading-relaxed">
              Our A(rDx)HD platform is developed in collaboration with leading research institutions 
              to ensure our tools are grounded in cutting-edge neuroscience and computer science research.
            </p>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-6 border border-emerald-200">
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                Jahanikia NeuroLab
              </h3>
              <p className="text-black mb-4">
                Department of Computer Science - Advancing neurotechnology through innovative research
              </p>
              <a 
                href="https://www.jneurolab.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors focus-visible-ring"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit NeuroLab
              </a>
            </div>
          </motion.div>
          
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUsPage; 