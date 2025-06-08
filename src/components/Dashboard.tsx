import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConsent } from '../hooks/useConsent';

const Dashboard: React.FC = () => {
  const { hasConsent, loading } = useConsent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkforest-50 via-earth-50 to-darkforest-100">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Continue your ADHD assessment journey. Track your progress and access personalized resources.
            </p>
            
            {/* Consent Status Indicator */}
            {!loading && (
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                hasConsent 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  hasConsent ? 'bg-green-400' : 'bg-yellow-400'
                }`}></div>
                {hasConsent ? 'Consent Given' : 'Consent Required'}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              className="card p-6 text-center hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-darkforest-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-darkforest-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h1a1 1 0 110 2H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-5 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {loading ? 'Loading...' : hasConsent ? 'Continue Assessment' : 'Start Assessment'}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {loading 
                  ? 'Checking consent status...' 
                  : hasConsent 
                    ? 'Continue your ADHD assessment where you left off'
                    : 'Begin your interactive ADHD assessment with our Unity-based games'
                }
              </p>
              {!loading && (
                <Link 
                  to={hasConsent ? "/assessment" : "/consent"} 
                  className="btn-primary text-sm"
                >
                  {hasConsent ? 'Continue' : 'Start Now'}
                </Link>
              )}
            </motion.div>

            <motion.div
              className="card p-6 text-center hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-earth-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-earth-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">View Results</h3>
              <p className="text-gray-600 text-sm mb-4">
                Check your assessment progress and personalized insights
              </p>
              <Link to="/results" className="btn-secondary text-sm">
                View Results
              </Link>
            </motion.div>

            <motion.div
              className="card p-6 text-center hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-darkforest-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-darkforest-800" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Learn About ADHD</h3>
              <p className="text-gray-600 text-sm mb-4">
                Interactive spider web content map about ADHD types, causes, and diagnosis
              </p>
              <Link to="/about-adhd" className="btn-secondary text-sm">
                Explore ADHD
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 