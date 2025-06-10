import React from 'react';
import { Link } from 'react-router-dom';

const DataProtectionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Protection</h1>
            <p className="text-xl text-gray-600">
              Learn about how we protect your personal information and ensure data security.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            
            {/* Our Commitment */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Data Protection</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At ADHD Assessment Platform, we take data protection seriously. We understand that your personal information, 
                especially health-related data, requires the highest level of security and care.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-emerald-800 text-sm">
                  We are committed to maintaining the highest standards of data protection and privacy in accordance with 
                  international regulations including GDPR, HIPAA guidelines, and other applicable data protection laws.
                </p>
              </div>
            </section>

            {/* Security Measures */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Measures</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Technical Safeguards */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Safeguards</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• End-to-end encryption for all data transmission</li>
                    <li>• AES-256 encryption for data at rest</li>
                    <li>• Secure HTTPS connections</li>
                    <li>• Regular security audits</li>
                    <li>• Multi-factor authentication</li>
                    <li>• Automated backup systems</li>
                  </ul>
                </div>

                {/* Administrative Safeguards */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Administrative Safeguards</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Access controls and role-based permissions</li>
                    <li>• Employee background checks and training</li>
                    <li>• Data handling policies and procedures</li>
                    <li>• Incident response protocols</li>
                    <li>• Regular staff training</li>
                    <li>• Third-party vendor assessments</li>
                  </ul>
                </div>

                {/* Physical Safeguards */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Physical Safeguards</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Secure data centers with 24/7 monitoring</li>
                    <li>• Biometric access controls</li>
                    <li>• Environmental controls and redundancy</li>
                    <li>• Secure hardware disposal procedures</li>
                    <li>• Fire suppression and power backup systems</li>
                    <li>• Physical access logging and monitoring</li>
                  </ul>
                </div>

                {/* Compliance Standards */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-100 p-2 rounded-full mr-3">
                      <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Compliance Standards</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• GDPR (General Data Protection Regulation)</li>
                    <li>• CCPA (California Consumer Privacy Act)</li>
                    <li>• HIPAA Security Rule guidelines</li>
                    <li>• SOC 2 Type II compliance</li>
                    <li>• ISO 27001 security management</li>
                    <li>• Regular compliance audits</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Categories */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Data We Protect</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                We implement appropriate security measures based on the sensitivity and type of data:
              </p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 bg-red-50 p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Highly Sensitive Data</h4>
                  <p className="text-red-700 text-sm mb-2">Assessment results, behavioral data, cognitive measurements</p>
                  <p className="text-red-600 text-xs">Protected with highest-level encryption and access controls</p>
                </div>
                
                <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Personal Information</h4>
                  <p className="text-yellow-700 text-sm mb-2">Name, email address, demographic information</p>
                  <p className="text-yellow-600 text-xs">Protected with standard encryption and access logging</p>
                </div>
                
                <div className="border-l-4 border-green-500 bg-green-50 p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Technical Data</h4>
                  <p className="text-green-700 text-sm mb-2">Usage analytics, performance metrics, error logs</p>
                  <p className="text-green-600 text-xs">Anonymized where possible and protected with standard security measures</p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Data Protection Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Under data protection regulations, you have several rights regarding your personal data:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-2 rounded-full mr-3 mt-1">
                    <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Right to Access</h4>
                    <p className="text-sm text-gray-600">Request a copy of all personal data we hold about you</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-2 rounded-full mr-3 mt-1">
                    <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Right to Rectification</h4>
                    <p className="text-sm text-gray-600">Request correction of inaccurate or incomplete data</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-2 rounded-full mr-3 mt-1">
                    <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Right to Erasure</h4>
                    <p className="text-sm text-gray-600">Request deletion of your personal data</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                We retain your data only as long as necessary for the purposes outlined in our Privacy Policy:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Assessment Data</h4>
                    <p className="text-sm text-gray-600">7 years or until account deletion</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Account Information</h4>
                    <p className="text-sm text-gray-600">Until account deletion or 3 years of inactivity</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Analytics Data</h4>
                    <p className="text-sm text-gray-600">26 months (anonymized after 14 months)</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Incident Response */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Incident Response</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                In the unlikely event of a security incident, we have comprehensive procedures in place:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-red-100 p-2 rounded-full mr-3 mt-1">
                    <span className="text-red-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Immediate Response (0-24 hours)</h4>
                    <p className="text-sm text-gray-600">Incident detection, containment, and initial assessment</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-orange-100 p-2 rounded-full mr-3 mt-1">
                    <span className="text-orange-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Investigation (1-3 days)</h4>
                    <p className="text-sm text-gray-600">Detailed forensic analysis and impact assessment</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3 mt-1">
                    <span className="text-yellow-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Notification (Within 72 hours)</h4>
                    <p className="text-sm text-gray-600">Regulatory notification and affected user communication</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                    <span className="text-green-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Recovery and Learning</h4>
                    <p className="text-sm text-gray-600">System restoration and process improvements</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Data Protection Officer</h4>
                    <a href="mailto:dpo@adhdassessment.com" className="text-emerald-600 hover:text-emerald-700">
                      dpo@adhdassessment.com
                    </a>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">General Contact</h4>
                    <Link to="/contact" className="text-emerald-600 hover:text-emerald-700">
                      Visit our contact page →
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Related Information */}
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/privacy" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="h-5 w-5 text-emerald-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-gray-900 font-medium">Privacy Policy</span>
                </Link>
                
                <Link to="/cookie-policy" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="h-5 w-5 text-emerald-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <span className="text-gray-900 font-medium">Cookie Policy</span>
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

export default DataProtectionPage; 