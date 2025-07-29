import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    {
      category: 'general',
      question: 'What is the A(rDx)HD Platform?',
      answer: 'Our platform is an innovative digital tool that uses gamification and adaptive assessment technologies to help identify ADHD symptoms. It provides a comprehensive evaluation through interactive activities designed to measure attention, focus, and other cognitive functions related to ADHD.'
    },
    {
      category: 'general',
      question: 'How accurate is the assessment?',
      answer: 'Our assessment is based on scientifically validated methods and has been developed in collaboration with healthcare professionals. However, it should be used as a screening tool and not as a replacement for professional medical diagnosis. Always consult with a qualified healthcare provider for a complete evaluation.'
    },
    {
      category: 'assessment',
      question: 'How long does the assessment take?',
      answer: 'The complete assessment typically takes approximately 15-30 minutes in one sitting preferred. You can pause and resume the assessment at any time. We recommend taking breaks if needed to ensure accurate results.'
    },
    {
      category: 'assessment',
      question: 'Can I retake the assessment?',
      answer: 'Yes, you can retake the assessment after 30 days. However, we recommend discussing your results with a healthcare professional before retaking, as factors like learning effects may influence subsequent scores.'
    },
    {
      category: 'assessment',
      question: 'What happens to my assessment results?',
      answer: 'Your results are stored securely and are only accessible to you. You can download your results as a PDF report to share with healthcare providers. We do not share individual results with third parties without your explicit consent.'
    },
    {
      category: 'technical',
      question: 'What browsers are supported?',
      answer: 'Our platform works best with modern browsers including Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. Make sure JavaScript is enabled and your browser is up to date for the best experience.'
    },
    {
      category: 'technical',
      question: 'What if the games don\'t load properly?',
      answer: 'If games aren\'t loading, try refreshing the page, clearing your browser cache, or switching to a different browser. Ensure you have a stable internet connection. If issues persist, contact our technical support team.'
    },
    {
      category: 'technical',
      question: 'Can I use the platform on mobile devices?',
      answer: 'While our platform is responsive and works on tablets and large mobile devices, we recommend using a desktop or laptop computer for the best assessment experience, as some activities require precise mouse or keyboard interactions.'
    },
    {
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button on the home page, provide your email address and create a secure password. You\'ll receive a verification email to activate your account.'
    },
    {
      category: 'account',
      question: 'I forgot my password. How do I reset it?',
      answer: 'On the login page, click "Forgot Password" and enter your email address. You\'ll receive instructions to reset your password. If you don\'t see the email, check your spam folder.'
    },
    {
      category: 'account',
      question: 'How do I delete my account?',
      answer: 'To delete your account, log in and go to your profile settings. Scroll down to find the "Delete Account" option. This action is permanent and will remove all your data from our system.'
    },
    {
      category: 'privacy',
      question: 'How is my personal information protected?',
      answer: 'We use industry-standard encryption and security measures to protect your data. Your information is stored on secure servers and is never shared without your consent. Read our Privacy Policy for complete details.'
    },
    {
      category: 'privacy',
      question: 'Do you share my data with third parties?',
      answer: 'We do not sell or share your personal information with third parties for marketing purposes. We may share anonymized, aggregated data for research purposes only, but this cannot be traced back to individual users.'
    },
    {
      category: 'privacy',
      question: 'Can I download my data?',
      answer: 'Yes, you can request a copy of all your personal data stored on our platform. This includes your assessment results, profile information, and activity history. Contact support to request your data export.'
    }
  ];

  const categories = [
    { key: 'all', label: 'All Questions' },
    { key: 'general', label: 'General' },
    { key: 'assessment', label: 'Assessment' },
    { key: 'technical', label: 'Technical' },
    { key: 'account', label: 'Account' },
    { key: 'privacy', label: 'Privacy' }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

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
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-forest-600 max-w-3xl mx-auto text-professional-large">
              Find answers to common questions about our ADHD assessment and services.
            </p>
          </div>

          {/* Category Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <motion.button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === category.key
                    ? 'bg-forest-600 text-white shadow-lg'
                    : 'bg-forest-100 text-forest-700 hover:bg-forest-200 border border-forest-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.label}
              </motion.button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto space-y-6">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-forest-50/90 backdrop-blur-sm rounded-xl border border-forest-300 shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-forest-100 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-forest-800 pr-4 text-heading">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 text-forest-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-forest-700 leading-relaxed text-professional">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage; 