import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const helpCategories = [
  {
    title: 'Getting Started',
    icon: '🚀',
    items: [
      'How to create an account',
      'Understanding the assessment process',
      'Setting up your profile',
      'Navigation basics',
    ],
  },
  {
    title: 'Account Management',
    icon: '👤',
    items: [
      'Updating your profile',
      'Password reset',
      'Privacy settings',
      'Account deletion',
    ],
  },
  {
    title: 'Assessment Help',
    icon: '📊',
    items: [
      'Understanding the games',
      'Technical requirements',
      'Assessment duration',
      'Interpreting results',
    ],
  },
  {
    title: 'Technical Support',
    icon: '💻',
    items: [
      'Browser compatibility',
      'Game loading issues',
      'Performance optimization',
      'Error troubleshooting',
    ],
  },
  {
    title: 'Privacy & Security',
    icon: '🔒',
    items: [
      'Data protection',
      'Information security',
      'Consent management',
      'Data sharing policies',
    ],
  },
  {
    title: 'Contact & Support',
    icon: '📞',
    items: [
      'Contact information',
      'Support hours',
      'Response times',
      'Feedback submission',
    ],
  },
];

const HelpCenterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-100 to-forest-200">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-forest-800 mb-6 text-heading-large">
              Help Center
            </h1>
            <p className="text-xl text-forest-600 max-w-3xl mx-auto text-professional-large">
              Find answers to common questions and get the support you need.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-forest-50/90 backdrop-blur-sm rounded-xl p-6 border border-forest-300 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-forest-100 p-3 rounded-full">
                    <svg className="h-6 w-6 text-forest-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-forest-800 ml-3 text-heading">Getting Started</h3>
                </div>
                <ul className="space-y-2 text-sm text-forest-700 text-professional">
                  <li>• How to create an account</li>
                  <li>• Understanding the assessment process</li>
                  <li>• Setting up your profile</li>
                  <li>• Navigation basics</li>
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="bg-forest-50/90 backdrop-blur-sm rounded-xl p-8 mt-12 border border-forest-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-forest-800 mb-6 text-center text-heading">Need More Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/contact" className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-emerald-500 transition-colors">
              <svg className="h-12 w-12 text-emerald-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-forest-800 mb-2 text-heading">Contact Us</h3>
              <p className="text-forest-700 text-center text-professional">Get in touch with our support team</p>
            </Link>

            <Link to="/faq" className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-emerald-500 transition-colors">
              <svg className="h-12 w-12 text-emerald-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-forest-800 mb-2 text-heading">FAQ</h3>
              <p className="text-forest-700 text-center text-professional">Browse frequently asked questions</p>
            </Link>

            <a href="mailto:support@adhdassessment.com" className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-emerald-500 transition-colors">
              <svg className="h-12 w-12 text-emerald-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.18l6.364 6.364a9 9 0 010 12.728L12 21.82l-6.364-6.364a9 9 0 010-12.728L12 2.18z" />
              </svg>
              <h3 className="text-lg font-semibold text-forest-800 mb-2 text-heading">Email Support</h3>
              <p className="text-forest-700 text-center text-professional">Send us an email directly</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage; 