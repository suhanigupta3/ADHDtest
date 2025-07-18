import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-darkforest-50 via-earth-50 to-darkforest-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link to="/consent" className="inline-flex items-center text-darkforest-700 hover:text-darkforest-800">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Consent
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="card p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg mb-6">
                <strong>Effective Date:</strong> July 18, 2025
              </p>

              <p className="mb-6">
                These Terms of Service ("Terms") govern your access to and use of the A(rDx)HD Platform ("we," "us," "our," or "Platform"). By accessing, registering for, or using the Platform, you agree to be bound by these Terms, our Privacy & Disclaimer Policy, and all applicable laws and regulations. If you do not agree, you may not use the Platform.
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Eligibility</h2>
                <p className="mb-4">To use the Platform, you must:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Be at least 13 years old (or older if required by your country's laws)</li>
                  <li>Have legal capacity to enter into a binding agreement</li>
                  <li>Obtain parental or guardian consent if you are under 18</li>
                </ul>
                <p className="mt-4">
                  By using the Platform, you represent that you meet all of the above eligibility criteria.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Non-Diagnostic, Educational Use Only</h2>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                  <p className="text-yellow-800">
                    <strong>Important:</strong> The A(rDx)HD Platform provides interactive tools, games, and assessments for informational and educational purposes only.
                  </p>
                </div>
                <ul className="list-disc list-inside space-y-2">
                  <li>We do not provide medical advice, psychological services, diagnoses, or treatment. Nothing on the Platform is intended to be or should be construed as medical guidance or a diagnostic tool. Any references to ADHD, attention, behavior, or mental health are intended solely for self-reflection and awareness, not clinical evaluation.</li>
                  <li>Always consult a licensed healthcare professional for medical advice, diagnosis, or treatment decisions.</li>
                  <li>Use of the Platform does not create a doctor-patient, therapist-client, or confidential health relationship between you and A(rDx)HD or any of its representatives.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. License and Access</h2>
                <p className="mb-4">
                  We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform solely for your own personal, non-commercial purposes, in accordance with these Terms.
                </p>
                <p className="mb-4">You may not:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Copy, reproduce, sell, rent, or distribute Platform content</li>
                  <li>Modify, reverse-engineer, or create derivative works</li>
                  <li>Use the Platform for commercial or competitive purposes</li>
                  <li>Bypass, disable, or interfere with security or access controls</li>
                  <li>Use automated tools (bots, scrapers) to access the Platform</li>
                </ul>
                <p className="mt-4">
                  We reserve the right to suspend or terminate your license at any time, for any reason, without notice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
                <p className="mb-4">By using the Platform, you agree to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide accurate and honest information in assessments and account creation</li>
                  <li>Use the Platform only as permitted by law</li>
                  <li>Maintain the confidentiality of your login credentials</li>
                  <li>Not impersonate any person or entity</li>
                  <li>Not upload or transmit malicious software or content</li>
                  <li>Not use the Platform to harass, threaten, or exploit others</li>
                </ul>
                <p className="mt-4">
                  You are responsible for all activity that occurs under your account, whether or not authorized by you.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Privacy and Data Use</h2>
                <p className="mb-4">
                  Your use of the Platform is subject to our Privacy & Disclaimer Policy, which explains how we collect, process, and protect your personal data.
                </p>
                <p>
                  By using the Platform, you consent to the collection and use of your data as described in that policy. If you do not agree with our privacy practices, you must not use the Platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
                <p className="mb-4">
                  All content and materials on the Platform—including code, text, images, design elements, games, and assessments—are the property of A(rDx)HD or its licensors and are protected under applicable copyright, trademark, and intellectual property laws.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Nothing in these Terms grants you any rights to use our trademarks, logos, or copyrighted materials without express written permission.</li>
                  <li>You may not remove or alter any copyright, trademark, or proprietary notices.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Disclaimers</h2>
                <p className="mb-4">
                  The Platform and all associated content are provided "as is" and "as available," without warranties of any kind, either express or implied, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Accuracy or reliability of results or content</li>
                  <li>Fitness for a particular purpose</li>
                  <li>Availability, uninterrupted access, or security</li>
                  <li>Freedom from errors, malware, or harmful components</li>
                </ul>
                <p className="mt-4">
                  We do not warrant or guarantee that your use of the Platform will lead to any particular outcome or insight.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                  <p className="text-red-800">
                    <strong>Important:</strong> To the fullest extent permitted by law, A(rDx)HD and its directors, officers, employees, licensors, and affiliates shall not be liable for any direct, indirect, incidental, consequential, punitive, or special damages of any kind arising out of or in connection with:
                  </p>
                </div>
                <ul className="list-disc list-inside space-y-2">
                  <li>Your access to or use of (or inability to use) the Platform</li>
                  <li>Any reliance on Platform-generated feedback or content</li>
                  <li>Unauthorized access to or alteration of your data</li>
                  <li>Any conduct or content of other users</li>
                </ul>
                <p className="mt-4">
                  In jurisdictions that do not allow certain exclusions of liability, our liability will be limited to the maximum extent permitted by law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Indemnification</h2>
                <p className="mb-4">
                  You agree to indemnify, defend, and hold harmless A(rDx)HD, its affiliates, licensors, employees, and agents from and against all claims, damages, liabilities, losses, costs, or expenses (including attorneys' fees) arising from:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Your use or misuse of the Platform</li>
                  <li>Your breach of these Terms</li>
                  <li>Your violation of any third-party rights or applicable law</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Account Suspension or Termination</h2>
                <p className="mb-4">
                  We may suspend or terminate your access to the Platform without notice if we determine, in our sole discretion, that you have violated these Terms, misused the Platform, or engaged in conduct that may harm others or the integrity of the Platform.
                </p>
                <p>
                  You may close your account at any time by contacting legal@adhdassessment.com.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Modifications to the Platform or Terms</h2>
                <p className="mb-4">
                  We reserve the right to modify, suspend, or discontinue the Platform or its content at any time, with or without notice. We may also update these Terms periodically. If we make material changes, we will notify you via email or platform notice.
                </p>
                <p>
                  Your continued use of the Platform after any such update constitutes your acceptance of the revised Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Governing Law and Jurisdiction</h2>
                <p className="mb-4">
                  These Terms shall be governed by the laws of the State of California, United States, without regard to its conflict of law principles.
                </p>
                <p>
                  Any legal dispute arising from or relating to these Terms or your use of the Platform shall be submitted to the exclusive jurisdiction of the state or federal courts located in San Francisco County, California. You consent to personal jurisdiction and venue in these courts.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Severability and Waiver</h2>
                <p className="mb-4">
                  If any provision of these Terms is found to be unlawful, void, or unenforceable, the remaining provisions shall remain valid and enforceable.
                </p>
                <p>
                  Our failure to enforce any right or provision under these Terms shall not be deemed a waiver of such right or provision.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Entire Agreement</h2>
                <p>
                  These Terms, along with our Privacy & Disclaimer Policy, constitute the entire agreement between you and A(rDx)HD regarding your use of the Platform and supersede any prior agreements or understandings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Contact Us</h2>
                <p className="mb-4">
                  If you have any questions, legal requests, or concerns regarding these Terms, please contact:
                </p>
                <div className="mt-4">
                  <p>
                    <strong>Email:</strong> 
                    <a href="mailto:legal@adhdassessment.com" className="text-darkforest-700 hover:text-darkforest-800 underline ml-2">
                      legal@adhdassessment.com
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage; 