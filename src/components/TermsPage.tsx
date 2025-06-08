import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TermsPage: React.FC = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using the ADHD Assessment Platform, you accept and agree to be bound by 
                  the terms and provision of this agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Use License</h2>
                <p>
                  Permission is granted to temporarily use this platform for personal, non-commercial 
                  assessment purposes only. This is the grant of a license, not a transfer of title.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Medical Disclaimer</h2>
                <p className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <strong>Important:</strong> This platform provides educational content and screening tools only. 
                  It does not provide medical advice, diagnosis, or treatment. Always seek the advice of your 
                  physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide accurate information during assessments</li>
                  <li>Use the platform responsibly and legally</li>
                  <li>Not attempt to circumvent security measures</li>
                  <li>Not share your account credentials</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Privacy and Data</h2>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy to understand 
                  how we collect, use, and protect your information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Limitations</h2>
                <p>
                  In no event shall ADHD Assessment Platform or its suppliers be liable for any damages 
                  arising out of the use or inability to use the platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contact Information</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                  <br />
                  <a href="mailto:legal@adhdassessment.com" className="text-darkforest-700 hover:text-darkforest-800 underline">
                    legal@adhdassessment.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage; 