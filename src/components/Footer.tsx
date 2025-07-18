import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-sage-950 via-sleek-950 to-emerald-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-sleek-600 to-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">A(rDx)HD</span>
            </div>
            <p className="text-sage-100 text-sm leading-relaxed">
              Transforming ADHD diagnosis through gamification and adaptive assessment technologies.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Icons */}
              <span className="text-sage-300 hover:text-white transition-colors cursor-pointer focus-visible-ring" title="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </span>
              <span className="text-sage-300 hover:text-white transition-colors cursor-pointer focus-visible-ring" title="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                </svg>
              </span>
              <span className="text-sage-300 hover:text-white transition-colors cursor-pointer focus-visible-ring" title="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </span>
              <span className="text-sage-300 hover:text-white transition-colors cursor-pointer focus-visible-ring" title="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </span>
              <span className="text-sage-300 hover:text-white transition-colors cursor-pointer focus-visible-ring" title="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/about-adhd" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  About ADHD
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  Assessment
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:support@adhdassessment.com" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  Email Support
                </a>
              </li>
              <li>
                <Link to="/help-center" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/technical-support" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  Technical Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/data-protection" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  Data Protection
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-sage-100 hover:text-white transition-colors text-sm focus-visible-ring">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>



        {/* Bottom Section */}
        <div className="border-t border-sage-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-sage-200">
              Copyright © {currentYear} Jahanikia NeuroLab LLC. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-sage-200">
              <span>Empowering better ADHD diagnosis</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Powered by adaptive technology</span>
            </div>
          </div>
        </div>


      </div>
    </footer>
  );
};

export default Footer; 