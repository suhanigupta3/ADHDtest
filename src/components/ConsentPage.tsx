import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const ConsentPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  

  
  const [age, setAge] = useState<number | null>(null);
  const [region, setRegion] = useState('US');
  const [consentType, setConsentType] = useState<'adult' | 'minor'>('adult');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Consent checkboxes
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedAssessment, setAcceptedAssessment] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);
  
  // Form validation
  const [showAgeError, setShowAgeError] = useState(false);
  
  useEffect(() => {
    if (age !== null) {
      setConsentType(age < 18 ? 'minor' : 'adult');
      setShowAgeError(false);
    }
  }, [age]);

  const isFormValid = () => {
    const basicConsent = acceptedTerms && acceptedPrivacy && acceptedAssessment;
    const minorConsent = consentType === 'minor' ? parentalConsent : true;
    const ageProvided = age !== null && age >= 13; // Minimum age requirement
    
    return basicConsent && minorConsent && ageProvided;
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === '') {
      setAge(null);
      return;
    }
    
    const ageValue = parseInt(value);
    
    // Allow any valid number input, validation will be done on submission
    if (!isNaN(ageValue) && ageValue >= 0) {
      setAge(ageValue);
    }
  };

  const saveConsentToFirebase = async (): Promise<boolean> => {
    if (!currentUser || !age) return false;

    try {
      const consentData: any = {
        userId: currentUser.uid,
        consentType,
        age,
        region,
        acceptedTerms,
        acceptedPrivacy,
        acceptedAssessment,
        consentDate: serverTimestamp(),
        userAgent: navigator.userAgent,
      };

      // Only include parentalConsent field for minors
      if (consentType === 'minor') {
        consentData.parentalConsent = parentalConsent;
      }

      await setDoc(doc(db, 'userConsents', currentUser.uid), consentData);
      return true;
    } catch (error: any) {
      console.error('Error saving consent:', error);
      
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please check your account permissions and try again.');
      } else if (error.code === 'network-request-failed') {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('Failed to save consent information. Please try again.');
      }
      
      return false;
    }
  };



  const handleProceed = async () => {
    if (!age) {
      setShowAgeError(true);
      return;
    }

    if (age < 13) {
      setError('You must be at least 13 years old to use this assessment platform.');
      return;
    }

    if (!isFormValid()) {
      setError('Please accept all required terms to continue.');
      return;
    }

    setLoading(true);
    setError('');

    const consentSaved = await saveConsentToFirebase();
    
    if (consentSaved) {
      navigate('/assessment');
    }
    
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkforest-50 via-earth-50 to-darkforest-100">
    
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Informed Consent
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Before we begin your ADHD assessment, we need your informed consent. Please review the information below carefully.
            </p>
          </motion.div>

          {/* Age and Region Selection */}
          <motion.div className="card p-6 mb-6" variants={itemVariants}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  min="13"
                  max="100"
                  value={age || ''}
                  onChange={handleAgeChange}
                  className={`input-field ${showAgeError && !age ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter your age"
                  required
                />
                {showAgeError && !age && (
                  <p className="text-red-600 text-sm mt-1">Age is required</p>
                )}
                {age && age < 13 && (
                  <p className="text-red-600 text-sm mt-1">You must be at least 13 years old</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="input-field"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="EU">European Union</option>
                  <option value="AU">Australia</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Consent Information */}
          <motion.div className="card p-6 mb-6" variants={itemVariants}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {consentType === 'minor' ? 'Minor Consent Information' : 'Assessment Information'}
            </h3>
            
            <div className="text-sm text-gray-700 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Important Notice</h4>
                <p className="text-blue-800">
                  This assessment is for educational and screening purposes only. It is NOT a medical diagnosis 
                  and cannot replace professional medical evaluation by a qualified healthcare provider.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">What This Assessment Involves:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Interactive games designed to assess attention and cognitive patterns</li>
                  <li>Questions about your daily life and experiences</li>
                  <li>Educational content about ADHD</li>
                  <li>Personalized recommendations based on your responses</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Data Collection and Privacy:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>We collect anonymous assessment data to improve our tools</li>
                  <li>Your personal information is encrypted and securely stored</li>
                  <li>We do not share individual results with third parties</li>
                  <li>You can delete your data at any time</li>
                </ul>
              </div>

              {consentType === 'minor' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Parental Consent Required</h4>
                  <p className="text-yellow-800">
                    As a minor, you need parental or guardian consent to use this assessment. 
                    Please ensure a parent or guardian has reviewed this information and agrees to your participation.
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Your Rights:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>You can stop the assessment at any time</li>
                  <li>You can request your data be deleted</li>
                  <li>You can contact us with questions or concerns</li>
                  <li>Results are provided for informational purposes only</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Consent Checkboxes */}
          <motion.div className="card p-6 mb-6" variants={itemVariants}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Consent Agreement</h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-darkforest-600 focus:ring-darkforest-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the <Link to="/terms" className="text-darkforest-700 hover:text-darkforest-800 underline">Terms of Service</Link>.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-1 h-4 w-4 text-darkforest-600 focus:ring-darkforest-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the <Link to="/privacy" className="text-darkforest-700 hover:text-darkforest-800 underline">Privacy Policy</Link>.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedAssessment}
                  onChange={(e) => setAcceptedAssessment(e.target.checked)}
                  className="mt-1 h-4 w-4 text-darkforest-600 focus:ring-darkforest-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I understand this assessment is for educational purposes only and does not constitute medical advice or diagnosis.
                </span>
              </label>

              {consentType === 'minor' && (
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parentalConsent}
                    onChange={(e) => setParentalConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 text-darkforest-600 focus:ring-darkforest-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm that my parent or legal guardian has reviewed this information and consents to my participation in this assessment.
                  </span>
                </label>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={itemVariants}
          >
            <motion.button
              onClick={handleProceed}
              disabled={!isFormValid() || loading}
              className={`px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 ${
                isFormValid() && !loading
                  ? 'btn-primary hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={isFormValid() && !loading ? { scale: 1.05 } : {}}
              whileTap={isFormValid() && !loading ? { scale: 0.95 } : {}}
            >
              {loading ? 'Saving...' : 'I Agree - Proceed to Assessment'}
            </motion.button>



            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/dashboard" className="btn-secondary text-center block px-8 py-4 text-lg">
                Cancel
              </Link>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div 
            className="text-center mt-8 text-sm text-gray-500"
            variants={itemVariants}
          >
            <p>
              By proceeding, your consent will be recorded with timestamp for legal compliance.
            </p>
            <p className="mt-2">
              Questions? Contact us at <a href="mailto:support@adhdassessment.com" className="text-darkforest-700 hover:text-darkforest-800 underline">support@adhdassessment.com</a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConsentPage; 