import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-darkforest-50 via-earth-50 to-darkforest-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link to="/consent" className="inline-flex items-center text-darkforest-700 hover:text-darkforest-800">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Consent
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="card p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Personal Information</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Name and email address (when you create an account)</li>
                      <li>Age and region (for consent purposes)</li>
                      <li>Assessment responses and game performance data</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Technical Information</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Device and browser information</li>
                      <li>IP address and usage analytics</li>
                      <li>Session data and interaction patterns</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide personalized assessment results and recommendations</li>
                  <li>Improve our assessment tools and educational content</li>
                  <li>Ensure platform security and prevent misuse</li>
                  <li>Communicate important updates about your account</li>
                  <li>Comply with legal obligations and consent requirements</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Data Security</h2>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p>
                    We implement industry-standard security measures to protect your personal information, 
                    including encryption, secure servers, and regular security audits. However, no method 
                    of transmission over the internet is 100% secure.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
                <p className="mb-4">We do not sell, trade, or rent your personal information. We may share your information only in these circumstances:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal requirements</li>
                  <li>To protect our rights and safety</li>
                  <li>Anonymous, aggregated data for research purposes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Access and Control</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>View and download your personal data</li>
                      <li>Request corrections to inaccurate information</li>
                      <li>Delete your account and associated data</li>
                      <li>Withdraw consent for data processing</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Data Retention</h3>
                    <p>
                      We retain your data only as long as necessary to provide our services and comply 
                      with legal obligations. You can request deletion at any time.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
                <p>
                  We use essential cookies to provide our services and analytics cookies to understand 
                  how users interact with our platform. You can control cookie settings in your browser.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Children's Privacy</h2>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p>
                    <strong>Important:</strong> Users under 18 require parental consent. We do not knowingly 
                    collect personal information from children under 13 without verifiable parental consent.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">8. International Users</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place to protect your privacy rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Updates to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material 
                  changes via email or through our platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy or how we handle your data, please contact us:
                </p>
                <div className="mt-4 space-y-2">
                  <p>
                    <strong>Email:</strong> 
                    <a href="mailto:privacy@adhdassessment.com" className="text-darkforest-700 hover:text-darkforest-800 underline ml-2">
                      privacy@adhdassessment.com
                    </a>
                  </p>
                  <p>
                    <strong>Data Protection Officer:</strong> 
                    <a href="mailto:dpo@adhdassessment.com" className="text-darkforest-700 hover:text-darkforest-800 underline ml-2">
                      dpo@adhdassessment.com
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage; 