import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ContactPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Prefill form with user data when logged in
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.displayName || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement backend integration (Firebase Functions, EmailJS, or backend API)
    // Currently messages are logged locally - needs integration with email service
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon. (Note: This form currently requires backend integration to send emails)');
    setFormData({ name: '', email: '', subject: '', message: '' });
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
              Contact Us
            </h1>
            <p className="text-xl text-forest-600 max-w-3xl mx-auto text-professional-large">
              Have questions? We're here to help. Reach out to our support team.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-forest-50/90 backdrop-blur-sm rounded-2xl p-8 border border-forest-300 shadow-lg"
            >
              <h2 className="text-2xl font-semibold text-forest-800 mb-6 text-heading">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sleek-500 focus:border-transparent transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sleek-500 focus:border-transparent transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-black mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sleek-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="assessment">Assessment Questions</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sleek-500 focus:border-transparent transition-colors resize-vertical"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-sleek-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-sleek-700 transition-colors focus:ring-2 focus:ring-sleek-500 focus:ring-offset-2"
                >
                  Send Message
                </button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-8"
            >
              <div className="bg-[#DDEBDD]/80 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-[#C8D8C8]">
                <h2 className="text-2xl font-semibold text-forest-800 mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-sleek-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-sleek-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black">Email</h3>
                      <p className="text-black">support@adhdassessment.com</p>
                      <p className="text-sm text-black mt-1">We'll respond within 24 hours</p>
                    </div>
                  </div>


                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-[#DDEBDD]/80 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-[#C8D8C8]">
                <h2 className="text-2xl font-semibold text-forest-800 mb-6">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  <div>
                                    <h4 className="font-semibold text-black mb-2">How long does the assessment take?</h4>
                <p className="text-black text-sm">Our comprehensive assessment typically takes approximately 15-30 minutes in one sitting preferred to complete.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-black mb-2">Is my data secure?</h4>
                    <p className="text-black text-sm">Yes, we use industry-standard encryption and follow strict privacy protocols to protect your information.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-black mb-2">Can I retake the assessment?</h4>
                    <p className="text-black text-sm">Yes, you can retake the assessment after 30 days for the most accurate results.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage; 