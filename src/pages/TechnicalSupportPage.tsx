import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TechnicalSupportPage: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Technical Support</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get help with technical issues and learn how to optimize your assessment experience.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Issue</h3>
            <p className="text-gray-600 text-sm mb-4">Experiencing a problem? Let us know.</p>
            <Link to="/contact" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
              Report Issue
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Check</h3>
            <p className="text-gray-600 text-sm mb-4">Verify your system compatibility.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Run Check
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 text-sm mb-4">Chat with our support team.</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
              Start Chat
            </button>
          </div>
        </div>

        {/* System Requirements */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">System Requirements</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Specifications</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Browser:</strong> Chrome 90+, Firefox 88+, Safari 14+, Edge 90+</li>
                  <li>• <strong>RAM:</strong> 4GB or higher</li>
                  <li>• <strong>Internet:</strong> Stable broadband connection (5+ Mbps)</li>
                  <li>• <strong>Screen:</strong> 1024x768 resolution or higher</li>
                  <li>• <strong>Audio:</strong> Speakers or headphones recommended</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Settings</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• JavaScript enabled</li>
                  <li>• Cookies enabled</li>
                  <li>• Pop-up blocker disabled for our domain</li>
                  <li>• WebGL support enabled</li>
                  <li>• Local storage enabled</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Troubleshooting Guide</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {/* Games Not Loading */}
            <div className="p-6">
              <button
                onClick={() => toggleSection('games-loading')}
                className="flex justify-between items-center w-full text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">Games Not Loading</h3>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    expandedSection === 'games-loading' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSection === 'games-loading' && (
                <div className="mt-4 text-gray-600">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Refresh the page (Ctrl+F5 or Cmd+Shift+R)</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Disable browser extensions temporarily</li>
                    <li>Try using an incognito/private browsing window</li>
                    <li>Switch to a different supported browser</li>
                    <li>Check your internet connection stability</li>
                    <li>Restart your browser completely</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Performance Issues */}
            <div className="p-6">
              <button
                onClick={() => toggleSection('performance')}
                className="flex justify-between items-center w-full text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">Slow Performance or Lag</h3>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    expandedSection === 'performance' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSection === 'performance' && (
                <div className="mt-4 text-gray-600">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Close unnecessary browser tabs and applications</li>
                    <li>Ensure you meet the minimum system requirements</li>
                    <li>Check your internet connection speed</li>
                    <li>Update your browser to the latest version</li>
                    <li>Update your graphics drivers</li>
                    <li>Try using a wired internet connection instead of WiFi</li>
                    <li>Restart your computer if performance is severely degraded</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Audio Issues */}
            <div className="p-6">
              <button
                onClick={() => toggleSection('audio')}
                className="flex justify-between items-center w-full text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">Audio Not Working</h3>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    expandedSection === 'audio' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSection === 'audio' && (
                <div className="mt-4 text-gray-600">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Check your device volume and make sure it's not muted</li>
                    <li>Verify that your speakers or headphones are connected properly</li>
                    <li>Check browser audio permissions for our website</li>
                    <li>Try refreshing the page</li>
                    <li>Test audio in other applications to verify your system audio works</li>
                    <li>Try using different audio output device</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Login Issues */}
            <div className="p-6">
              <button
                onClick={() => toggleSection('login')}
                className="flex justify-between items-center w-full text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">Login Problems</h3>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    expandedSection === 'login' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSection === 'login' && (
                <div className="mt-4 text-gray-600">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Double-check your email address and password</li>
                    <li>Use the "Forgot Password" feature to reset your password</li>
                    <li>Make sure cookies are enabled in your browser</li>
                    <li>Try logging in from an incognito/private window</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Check if your account has been verified via email</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Error Messages */}
            <div className="p-6">
              <button
                onClick={() => toggleSection('errors')}
                className="flex justify-between items-center w-full text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">Error Messages</h3>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    expandedSection === 'errors' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSection === 'errors' && (
                <div className="mt-4 text-gray-600">
                  <p className="mb-4">If you encounter error messages:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Take a screenshot of the error message</li>
                    <li>Note what you were doing when the error occurred</li>
                    <li>Try refreshing the page</li>
                    <li>Check the browser console for additional error details (F12 → Console tab)</li>
                    <li>Contact our support team with the error details</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-emerald-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
          <p className="text-gray-600 mb-6">
            If the troubleshooting steps above don't resolve your issue, please contact our technical support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Contact Technical Support
            </Link>
            <a
              href="mailto:technical@adhdassessment.com"
              className="bg-white text-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-50 transition-colors font-medium border border-emerald-200"
            >
              Email: technical@adhdassessment.com
            </a>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Support Hours: Monday - Friday, 9:00 AM - 6:00 PM EST</p>
            <p>Average Response Time: 2-4 hours during business hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalSupportPage; 