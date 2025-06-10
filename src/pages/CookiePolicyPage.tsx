import React from 'react';
import { Link } from 'react-router-dom';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
            <p className="text-xl text-gray-600">
              Learn about how we use cookies and similar technologies on our platform.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            
            {/* What are Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What are Cookies?</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and improving our services.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Cookies contain information about your use of our website, but they do not contain personal information that identifies you directly.
              </p>
            </section>

            {/* Types of Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="border-l-4 border-emerald-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="text-gray-600 mb-2">
                    These cookies are necessary for our website to function properly. They enable core functionality such as:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>User authentication and session management</li>
                    <li>Security features and fraud prevention</li>
                    <li>Loading balance and performance optimization</li>
                    <li>Remembering your consent preferences</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Duration:</strong> Session and up to 1 year
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                  <p className="text-gray-600 mb-2">
                    These cookies help us provide enhanced functionality and personalization:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Remembering your language preferences</li>
                    <li>Saving assessment progress and results</li>
                    <li>Customizing user interface preferences</li>
                    <li>Remembering your accessibility settings</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Duration:</strong> Up to 2 years
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                  <p className="text-gray-600 mb-2">
                    These cookies help us understand how visitors use our website:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Counting visits and traffic sources</li>
                    <li>Understanding which pages are most popular</li>
                    <li>Measuring website performance</li>
                    <li>Identifying user journey patterns</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Third-party services:</strong> Google Analytics, Hotjar<br/>
                    <strong>Duration:</strong> Up to 2 years
                  </p>
                </div>

                {/* Performance Cookies */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Cookies</h3>
                  <p className="text-gray-600 mb-2">
                    These cookies help us optimize website performance:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Measuring page load times</li>
                    <li>Identifying technical issues</li>
                    <li>Optimizing content delivery</li>
                    <li>Monitoring system stability</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Duration:</strong> Session and up to 1 year
                  </p>
                </div>
              </div>
            </section>

            {/* Third-Party Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may use third-party services that set their own cookies. These services include:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Google Analytics</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Helps us understand website usage and improve user experience.
                    </p>
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 text-sm">
                      Google Privacy Policy →
                    </a>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Firebase</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Provides authentication, database, and hosting services.
                    </p>
                    <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 text-sm">
                      Firebase Privacy Policy →
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Managing Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Browser Settings</h3>
                  <p className="text-gray-600 mb-4">
                    You can control and manage cookies through your browser settings. Most browsers allow you to:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>View what cookies are stored on your device</li>
                    <li>Delete cookies individually or all at once</li>
                    <li>Block cookies from specific sites</li>
                    <li>Block all cookies (though this may affect website functionality)</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Important Note</h4>
                      <p className="text-sm text-yellow-700">
                        Disabling essential cookies may prevent you from using certain features of our website, including the ADHD assessment.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Cookie Preference Center</h3>
                  <p className="text-gray-600 mb-4">
                    You can manage your cookie preferences for our website using our preference center:
                  </p>
                  <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                    Manage Cookie Preferences
                  </button>
                </div>
              </div>
            </section>

            {/* Browser-Specific Instructions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Browser-Specific Cookie Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Google Chrome</h4>
                    <p className="text-sm text-gray-600">Settings → Privacy and Security → Cookies and other site data</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">Mozilla Firefox</h4>
                    <p className="text-sm text-gray-600">Options → Privacy & Security → Cookies and Site Data</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">Safari</h4>
                    <p className="text-sm text-gray-600">Preferences → Privacy → Manage Website Data</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Microsoft Edge</h4>
                    <p className="text-sm text-gray-600">Settings → Cookies and site permissions → Cookies and site data</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">Opera</h4>
                    <p className="text-sm text-gray-600">Settings → Advanced → Privacy & security → Site Settings</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">Internet Explorer</h4>
                    <p className="text-sm text-gray-600">Tools → Internet Options → Privacy → Advanced</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Updates to This Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Cookie Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. 
                When we make significant changes, we will notify you by posting the updated policy on our website and updating 
                the "Last updated" date at the top of this page.
              </p>
            </section>

            {/* Contact Information */}
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Our Cookie Policy</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                    <a href="mailto:privacy@adhdassessment.com" className="text-emerald-600 hover:text-emerald-700">
                      privacy@adhdassessment.com
                    </a>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Page</h4>
                    <Link to="/contact" className="text-emerald-600 hover:text-emerald-700">
                      Visit our contact page →
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Related Policies */}
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Policies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/privacy" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="h-5 w-5 text-emerald-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-gray-900 font-medium">Privacy Policy</span>
                </Link>
                
                <Link to="/terms" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="h-5 w-5 text-emerald-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-gray-900 font-medium">Terms of Service</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage; 