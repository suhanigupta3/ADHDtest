import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConsent } from '../hooks/useConsent';
import { useAuth } from '../contexts/AuthContext';
import { deleteAllUserData } from '../utils/deleteUserData';

const Dashboard: React.FC = () => {
  const { hasConsent, loading } = useConsent();
  const { currentUser } = useAuth();
  const [easterEggCount, setEasterEggCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Easter egg trigger - click 5 times on the title to activate
  const handleEasterEgg = () => {
    const newCount = easterEggCount + 1;
    setEasterEggCount(newCount);
    
    if (newCount === 5) {
      setShowDeleteConfirm(true);
      setEasterEggCount(0); // Reset count
    }
  };

  // Handle data deletion
  const handleDeleteData = async () => {
    if (!currentUser) return;
    
    setIsDeleting(true);
    try {
      await deleteAllUserData(currentUser);
      alert('🎉 All user data deleted successfully!');
      setShowDeleteConfirm(false);
    } catch (error) {
      alert(`❌ Error deleting data: ${error}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-100 to-forest-200">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 
              className="text-3xl font-bold text-gray-800 mb-4 cursor-pointer select-none hover:text-gray-700 transition-colors duration-200"
              onClick={handleEasterEgg}
              title={`Click ${5 - easterEggCount} more times to activate easter egg`}
            >
              Welcome to Your Dashboard
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Continue your ADHD journey. Track your progress and access personalized resources.
            </p>
            
            {/* Consent Status Indicator */}
            {!loading && (
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                hasConsent 
                  ? 'bg-emerald-900/50 text-emerald-100 border border-emerald-600' 
                  : 'bg-amber-900/50 text-amber-100 border border-amber-600'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  hasConsent ? 'bg-emerald-400' : 'bg-amber-400'
                }`}></div>
                {hasConsent ? 'Consent Given' : 'Consent Required'}
              </div>
            )}
          </div>

          {/* Navigation Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Assessment Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="bg-forest-50/90 backdrop-blur-sm rounded-xl shadow-lg border border-forest-300 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Assessment</h3>
                <p className="text-gray-700 mb-4">Begin your comprehensive ADHD assessment with interactive games.</p>
                <Link to="/assessment" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 shadow-lg border border-emerald-500 hover:shadow-xl hover:scale-105 active:scale-95 inline-flex items-center">
                  Begin Assessment
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* Results Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-forest-50/90 backdrop-blur-sm rounded-xl shadow-lg border border-forest-300 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-sleek-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">View Results</h3>
                <p className="text-gray-700 mb-4">Review your assessment results and detailed analysis of your performance.</p>
                <Link to="/results" className="bg-gradient-to-r from-emerald-600 to-sleek-600 hover:from-emerald-700 hover:to-sleek-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 shadow-lg border border-emerald-500 hover:shadow-xl hover:scale-105 active:scale-95 inline-flex items-center">
                  View Results
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* Resources Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-forest-50/90 backdrop-blur-sm rounded-xl shadow-lg border border-forest-300 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-sleek-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Learn About ADHD</h3>
                <p className="text-gray-700 mb-4">Access educational resources and management strategies for ADHD.</p>
                <Link to="/resources" className="bg-gradient-to-r from-sleek-600 to-emerald-600 hover:from-sleek-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 shadow-lg border border-sleek-500 hover:shadow-xl hover:scale-105 active:scale-95 inline-flex items-center">
                  Explore Resources
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-gradient-to-r from-forest-100/90 to-forest-200/90 rounded-xl p-6 border border-forest-300"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/about-adhd" className="bg-forest-200 hover:bg-forest-300 text-forest-800 font-semibold py-3 px-6 rounded-lg border border-forest-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:ring-offset-2 hover:shadow-lg hover:scale-105 active:scale-95 inline-flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About ADHD
              </Link>
              <Link to="/consent" className="bg-forest-200 hover:bg-forest-300 text-forest-800 font-semibold py-3 px-6 rounded-lg border border-forest-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:ring-offset-2 hover:shadow-lg hover:scale-105 active:scale-95 inline-flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Update Consent
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Easter Egg: Delete Data Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <h3 className="text-lg font-bold text-red-800 mb-4">🧹 Easter Egg Activated!</h3>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                You found the secret data cleanup tool! This will <strong>permanently delete</strong> all data for:
              </p>
              <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                {currentUser?.email}
              </p>
            </div>

            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">
                <strong>This will delete:</strong>
              </p>
              <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                <li>All game data and scores</li>
                <li>User consents and progress</li>
                <li>Any other user-specific data</li>
              </ul>
            </div>

            <p className="text-sm text-red-600 mb-4">
              <strong>This action cannot be undone!</strong>
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteData}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 