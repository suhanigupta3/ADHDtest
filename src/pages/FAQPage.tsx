import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
      question: 'What is the ADHD Assessment Platform?',
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
      answer: 'The complete assessment typically takes 30-45 minutes. You can pause and resume the assessment at any time. We recommend taking breaks if needed to ensure accurate results.'
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our ADHD assessment platform.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search FAQ..."
              className="w-full px-4 py-3 pl-12 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-medium text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <div className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-emerald-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Contact Support
              </Link>
              <Link
                to="/help-center"
                className="bg-white text-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-50 transition-colors font-medium border border-emerald-200"
              >
                Visit Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage; 