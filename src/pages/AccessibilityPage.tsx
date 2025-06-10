import React from 'react';
import { Link } from 'react-router-dom';

const AccessibilityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Accessibility Statement</h1>
            <p className="text-xl text-gray-600">
              Our commitment to making ADHD assessment accessible to everyone.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            
            {/* Our Commitment */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Accessibility</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At ADHD Assessment Platform, we believe that everyone deserves equal access to quality ADHD assessment tools. 
                We are committed to ensuring our digital platform is accessible to people with disabilities, including those with 
                visual, auditory, motor, and cognitive impairments.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-blue-800 text-sm">
                    We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards 
                    and are continuously working to improve accessibility across our platform.
                  </p>
                </div>
              </div>
            </section>

            {/* Accessibility Features */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Features</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Accessibility */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Visual Accessibility</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• High contrast color schemes</li>
                    <li>• Scalable text and UI elements</li>
                    <li>• Screen reader compatibility</li>
                    <li>• Alternative text for images</li>
                    <li>• Focus indicators for keyboard navigation</li>
                    <li>• Color-blind friendly design</li>
                  </ul>
                </div>

                {/* Motor Accessibility */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Motor Accessibility</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Keyboard-only navigation support</li>
                    <li>• Large click targets (minimum 44px)</li>
                    <li>• Adjustable time limits</li>
                    <li>• No rapid flashing content</li>
                    <li>• Alternative input methods</li>
                    <li>• Customizable interaction preferences</li>
                  </ul>
                </div>

                {/* Cognitive Accessibility */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-100 p-2 rounded-full mr-3">
                      <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Cognitive Accessibility</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Clear and simple language</li>
                    <li>• Consistent navigation patterns</li>
                    <li>• Progress indicators</li>
                    <li>• Error prevention and recovery</li>
                    <li>• Customizable pace settings</li>
                    <li>• Context-sensitive help</li>
                  </ul>
                </div>

                {/* Auditory Accessibility */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Auditory Accessibility</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Visual alternatives to audio cues</li>
                    <li>• Adjustable volume controls</li>
                    <li>• Subtitle options where applicable</li>
                    <li>• Sound-independent interactions</li>
                    <li>• Visual feedback for audio events</li>
                    <li>• Customizable audio preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Assistive Technology */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Assistive Technology Support</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our platform is designed to work with various assistive technologies:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Screen Readers</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• JAWS (Windows)</li>
                      <li>• NVDA (Windows)</li>
                      <li>• VoiceOver (macOS/iOS)</li>
                      <li>• TalkBack (Android)</li>
                      <li>• Dragon NaturallySpeaking</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Browser Accessibility</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Browser zoom (up to 200%)</li>
                      <li>• High contrast mode</li>
                      <li>• Custom CSS support</li>
                      <li>• Voice control software</li>
                      <li>• Switch navigation devices</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Testing and Standards */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Standards and Testing</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-emerald-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">WCAG 2.1 Compliance</h4>
                  <p className="text-gray-600 text-sm">
                    We follow the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards, 
                    which provide comprehensive guidance for making web content accessible.
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Regular Testing</h4>
                  <p className="text-gray-600 text-sm">
                    We conduct regular accessibility audits using both automated tools and manual testing 
                    with assistive technologies to ensure our platform remains accessible.
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">User Testing</h4>
                  <p className="text-gray-600 text-sm">
                    We collaborate with users who have disabilities to test our platform and gather 
                    feedback on accessibility improvements.
                  </p>
                </div>
              </div>
            </section>

            {/* Known Issues */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Known Accessibility Issues</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We are committed to transparency about accessibility challenges and our efforts to address them:
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Ongoing Improvements</h4>
                    <p className="text-sm text-yellow-700">
                      Some interactive assessment elements are being enhanced for better screen reader compatibility. 
                      We expect these improvements to be completed by the next major update.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm">
                If you encounter any accessibility barriers, please contact us immediately so we can address them.
              </p>
            </section>

            {/* Accessibility Settings */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Settings</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Users can customize their experience through various accessibility settings:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Visual Preferences</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Text size adjustment</li>
                    <li>• High contrast themes</li>
                    <li>• Color customization</li>
                    <li>• Motion reduction</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Interaction Preferences</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Extended time limits</li>
                    <li>• Simplified navigation</li>
                    <li>• Audio preferences</li>
                    <li>• Keyboard shortcuts</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact and Feedback */}
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Support</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                We welcome feedback about the accessibility of our platform. If you encounter accessibility barriers 
                or have suggestions for improvement, please contact us:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Accessibility Team</h4>
                    <a href="mailto:accessibility@adhdassessment.com" className="text-emerald-600 hover:text-emerald-700 text-sm">
                      accessibility@adhdassessment.com
                    </a>
                    <p className="text-xs text-gray-500 mt-1">Response time: 24-48 hours</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Phone Support</h4>
                    <p className="text-sm text-gray-600">1-800-ADHD-ACCESS</p>
                    <p className="text-xs text-gray-500 mt-1">Monday-Friday, 9 AM - 6 PM EST</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-2">When contacting us, please include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Description of the accessibility issue</li>
                  <li>• Your browser and assistive technology information</li>
                  <li>• Steps to reproduce the issue</li>
                  <li>• Any error messages you received</li>
                </ul>
              </div>
            </section>

            {/* Related Information */}
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/privacy" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="h-5 w-5 text-emerald-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-gray-900 font-medium">Privacy Policy</span>
                </Link>
                
                <Link to="/contact" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="h-5 w-5 text-emerald-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-900 font-medium">Contact Us</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPage; 