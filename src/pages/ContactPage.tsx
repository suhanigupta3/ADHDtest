import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import emailjs from '@emailjs/browser';

const ContactPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    // Clear message when user starts typing
    if (message) setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', formData);
    setLoading(true);
    setMessage(null);

    try {
      // Get EmailJS configuration from environment variables
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_5te9p1n';
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_p3qvhj4';
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'c8YGtVlBPTgYLii-H';

      console.log('EmailJS config:', { serviceId, templateId, publicKey: publicKey ? '***' : 'missing' });

      if (!serviceId || !templateId || !publicKey) {
        console.error('Missing EmailJS configuration:', { serviceId, templateId, publicKey });
        throw new Error('EmailJS configuration is missing. Please check your environment variables.');
      }

      // Prepare template parameters
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: 'ardxhd@gmail.com', // Your support email
      };

      console.log('Sending email with params:', templateParams);

      // Initialize EmailJS with public key
      emailjs.init(publicKey);

      // Send email using EmailJS
      const response = await emailjs.send(serviceId, templateId, templateParams);
      
      console.log('EmailJS response:', response);

      // Success
      setMessage({ type: 'success', text: 'Thank you for your message! We will get back to you soon.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('EmailJS error:', error);
      setMessage({ 
        type: 'error', 
        text: error.text || error.message || 'Failed to send message. Please try again or contact us directly at ardxhd@gmail.com.' 
      });
    } finally {
      setLoading(false);
    }
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
              
              {/* Success/Error Message */}
              {message && (
                <div
                  className={`mb-4 p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

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
                  disabled={loading}
                  className={`w-full bg-sleek-600 text-white py-3 px-6 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-sleek-500 focus:ring-offset-2 ${
                    loading
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-sleek-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
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
                      <p className="text-black">ardxhd@gmail.com</p>
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