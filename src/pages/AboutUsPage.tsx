import React from 'react';
import { motion } from 'framer-motion';

const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-stone-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Us
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="w-32 h-32 bg-white border-4 border-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <img 
                src="/adhd-logo.png" 
                alt="ADHD Assessment Logo" 
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <svg className="w-16 h-16 text-darkforest-600 hidden" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Our Mission
            </h2>
            
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
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
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Research
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our ADHD assessment platform is developed in collaboration with leading research institutions 
              to ensure our tools are grounded in cutting-edge neuroscience and computer science research.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Jahanikia NeuroLab
              </h3>
              <p className="text-gray-600 mb-4">
                Department of Computer Science - Advancing neurotechnology through innovative research
              </p>
              <a 
                href="https://www.jneurolab.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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