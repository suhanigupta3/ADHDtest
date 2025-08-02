import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const ConsentPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [age, setAge] = useState<number | null>(null);
  const [region, setRegion] = useState('US');
  const [consentType, setConsentType] = useState<'adult' | 'minor'>('adult');
  const [showAgeError, setShowAgeError] = useState(false);
  
  // Consent checkboxes
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedAssessment, setAcceptedAssessment] = useState(false);
  const [acceptedResearch, setAcceptedResearch] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);

  const isFormValid = () => {
    const basicConsent = acceptedTerms && acceptedPrivacy && acceptedAssessment && acceptedResearch;
    const minorConsent = consentType === 'minor' ? parentalConsent : true;
    const ageProvided = age !== null && age >= 13;
    return basicConsent && minorConsent && ageProvided;
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAge = parseInt(e.target.value);
    setAge(newAge);
    setShowAgeError(false);
    
    if (newAge < 18) {
      setConsentType('minor');
    } else {
      setConsentType('adult');
    }
  };

  const saveConsentToFirebase = async (): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      setLoading(true);
      setError(null);

      const consentData: any = {
        userId: currentUser.uid,
        consentType,
        age,
        region,
        acceptedTerms,
        acceptedPrivacy,
        acceptedAssessment,
        acceptedResearch,
        consentDate: serverTimestamp(),
      };

      // Only include parentalConsent field for minors
      if (consentType === 'minor') {
        consentData.parentalConsent = parentalConsent;
      }

      await setDoc(doc(db, 'userConsents', currentUser.uid), consentData);
      console.log('Consent saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving consent:', error);
        setError('Failed to save consent information. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    if (!isFormValid()) {
      setShowAgeError(true);
      return;
    }

    const consentSaved = await saveConsentToFirebase();
    
    if (consentSaved) {
      // Redirect to assessment
      window.location.href = '/assessment';
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

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-forest-50/90 backdrop-blur-sm rounded-2xl shadow-xl border border-forest-300 p-8"
        >
          {/* Header */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <h1 className="text-4xl font-bold text-forest-800 mb-4 text-heading-large">
              Informed Consent Form
            </h1>
            <p className="text-lg text-forest-700 max-w-3xl mx-auto text-professional-large">
              Please read this form carefully before participating in our ADHD assessment.
            </p>
          </motion.div>

          {/* Study Description */}
          <motion.div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6" variants={itemVariants}>
            <h3 className="text-xl font-semibold text-forest-800 mb-4 text-heading">Study Description</h3>
            <div className="space-y-4 text-gray-700">
              <p>
                You are invited to participate in an ADHD assessment. Your participation 
                in this assessment will take approximately 15-30 minutes in one sitting preferred, wherein you will play interactive games 
                and answer a series of questions that are meant to test whether you have ADHD. This will be 
                done through our secure website and will require no video/audio taping.
              </p>
              <p>
                This survey will be kept in confidentiality and will only be shared between the researchers 
                from the group itself at scientific/professional meetings or in published scientific journals. 
                Names, ages, and personal information will not be released to the public.
              </p>
            </div>
          </motion.div>

          {/* Future Use of Information */}
          <motion.div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6" variants={itemVariants}>
            <h3 className="text-xl font-semibold text-forest-800 mb-4 text-heading">Future Use of Private Information</h3>
            <div className="space-y-4 text-gray-700">
              <p>
                Research using private information is an important way to try to understand human behavior/mind. 
                You are being given this information because the investigators want to save private information 
                for future research.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your information will be stored in a secure database and your identity will remain completely anonymous.</li>
                <li>Because your information will not be linked to your name after it is stored, you cannot withdraw your consent to the use of the information after it is taken.</li>
                <li>Identifiers might be removed from identifiable private information and, after such removal, the information could be used for future research studies or distributed to another investigator for future research studies without additional informed consent from you.</li>
              </ul>
            </div>
          </motion.div>

          {/* Risks and Benefits */}
          <motion.div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6" variants={itemVariants}>
            <h3 className="text-xl font-semibold text-forest-800 mb-4 text-heading">Risks and Benefits</h3>
            <div className="space-y-4 text-gray-700">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2">Risks:</h4>
                <p className="text-emerald-800">There are no risks associated with this assessment; all information about one's health will be protected and only used at scientific meetings (no personal reasons).</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2">Benefits:</h4>
                <p className="text-emerald-800">There are no foreseeable benefits which may reasonably be expected to result from this assessment. We cannot and do not guarantee or promise that you will receive any benefits from this assessment.</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">Voluntary Participation:</h4>
                <p className="text-amber-800">
                                  Participation is voluntary and if you wish to remove yourself/your child from this assessment for any reason, 
                you may do so prior to signing the consent. However, once you sign the consent form, you must gain 
                approval to withdraw from the assessment.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Time Involvement */}
          <motion.div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6" variants={itemVariants}>
            <h3 className="text-xl font-semibold text-forest-800 mb-4 text-heading">Time Involvement</h3>
            <p className="text-gray-700">
              Your participation in this experiment will last for approximately 15-30 minutes in one sitting preferred.
            </p>
          </motion.div>

          {/* Payments */}
          <motion.div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6" variants={itemVariants}>
            <h3 className="text-xl font-semibold text-forest-800 mb-4 text-heading">Payments/Reimbursements</h3>
            <p className="text-gray-700">
              You will receive no compensation for your participation.
            </p>
          </motion.div>

          {/* Certificate of Confidentiality */}
          <motion.div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6" variants={itemVariants}>
            <h3 className="text-xl font-semibold text-forest-800 mb-4 text-heading">Certificate of Confidentiality</h3>
            <div className="space-y-4 text-gray-700">
              <p>
                The researchers with this Certificate may not disclose or use information or documents that may 
                identify you in any federal, state, or local civil, criminal, administrative, legislative, or 
                other action, suit, or proceeding, or be used as evidence, for example, if there is a court 
                subpoena, unless you have consented for this use.
              </p>
              <p>
                Information or documents protected by this Certificate cannot be disclosed to anyone else who 
                is not connected with the research except:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>If there is a federal, state, or local law that requires disclosure (such as to report child abuse or communicable diseases)</li>
                <li>If you have consented to the disclosure, including for your medical treatment</li>
                <li>If it is used for other scientific research, as allowed by federal regulations protecting research subjects</li>
              </ul>
              <p>
                The Certificate cannot be used to refuse a request for information from personnel of the United 
                States federal or state government agency sponsoring the project that is needed for auditing or 
                program evaluation.
              </p>
            </div>
          </motion.div>

          {/* Authorization for Health Information */}
          <motion.div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6" variants={itemVariants}>
            <h3 className="text-xl font-semibold text-forest-800 mb-4 text-heading">Authorization to Use Your Health Information for Assessment Purposes</h3>
            <div className="space-y-4 text-gray-700">
              <p>
                Because information about you and your health is personal and private, it generally cannot be 
                used in this assessment without your written authorization. Once you read and sign this consent, 
                it will provide that authorization.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2">Purpose of Assessment:</h4>
                <p className="text-emerald-800">
                  The purpose of this assessment is to detect any symptoms of ADHD and provide a report on 
                  your results. You will first create an account on our website to store your reports and progress. 
                  Next, you will be given the opportunity to choose the gamified assessment you would like to take. 
                  The results will then be compiled, examined, and stored as a report in your profile. Your responses 
                  to the questionnaire will also be utilized to determine whether you have the possibility of having ADHD. 
                  This will allow you to receive necessary assistance from medical professionals.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2">Personal Information Collected:</h4>
                <p className="text-emerald-800">
                  Your health information related to this assessment may be used or disclosed in connection with this 
                  assessment, including, but not limited to name and email. However, none of this information 
                  is linked to your personal data.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">Authorization Expiration:</h4>
                <p className="text-amber-800">
                  Your authorization for the use and/or disclosure of your health information will end on July 21st, 
                  2027 or when the assessment project ends, whichever is earlier.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Participant Rights */}
          <motion.div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6" variants={itemVariants}>
            <h3 className="text-xl font-semibold text-forest-800 mb-4 text-heading">Participant Rights</h3>
            <div className="space-y-4 text-gray-700">
              <p>
                If you have read this form and have decided to participate in this project, please understand 
                your participation is voluntary and you have the right to withdraw your consent or discontinue 
                participation at any time without penalty or loss of benefits to which you are otherwise entitled. 
                However, once you sign the consent you cannot withdraw from the assessment unless you gain approval.
              </p>
              <p>
                The results of this assessment may be presented at scientific or professional meetings or 
                published in scientific journals. Your identity will not be disclosed.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2">Participants' Bill of Rights:</h4>
                <p className="text-emerald-800 mb-2">As a research participant you have the following rights:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-emerald-800">
                  <li>Be informed of the nature and purpose of the experiment</li>
                  <li>Be given an explanation of the methods of the assessment</li>
                  <li>Be given a description of any attendant discomforts and risks reasonably to be expected</li>
                  <li>Be given an explanation of any benefits to the subject reasonably to be expected, if applicable</li>
                  <li>Be given an opportunity to ask questions concerning the assessment or the procedures involved</li>
                  <li>Be instructed that consent to participate in the assessment may be withdrawn at any time</li>
                  <li>Be given a copy of the signed and dated consent form</li>
                  <li>Be given the opportunity to decide to consent or not to consent without coercion</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Withdrawal Information */}
          <motion.div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6" variants={itemVariants}>
            <h3 className="text-xl font-semibold text-forest-800 mb-4 text-heading">Withdrawal from Assessment</h3>
            <div className="space-y-4 text-gray-700">
              <p>The Protocol Director may withdraw you from the assessment without your consent for one or more of the following reasons:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Failure to follow the instructions of the Protocol Director and study staff</li>
                <li>The Protocol Director decides that continuing your participation could be harmful to you</li>
                <li>Pregnancy</li>
                                  <li>You need treatment not allowed in the assessment</li>
                  <li>The assessment is canceled</li>
                <li>Other administrative reasons</li>
                <li>Unanticipated circumstances</li>
              </ul>
            </div>
          </motion.div>

          {/* Personal Information */}
          <motion.div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6" variants={itemVariants}>
            <h3 className="text-lg font-semibold text-forest-800 mb-4">Personal Information</h3>
            
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
                  className={`input-field ${showAgeError && !age ? 'border-sleek-400 focus:ring-sleek-500 focus:border-sleek-500' : ''}`}
                  placeholder="Enter your age"
                  required
                />
                {showAgeError && !age && (
                  <p className="text-sleek-600 text-sm mt-1">Age is required</p>
                )}
                {age && age < 13 && (
                  <p className="text-sleek-600 text-sm mt-1">You must be at least 13 years old</p>
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

              {consentType === 'minor' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-emerald-900 mb-2">Parental Consent Required</h4>
                <p className="text-emerald-800">
                    As a minor, you need parental or guardian consent to use this assessment. 
                    Please ensure a parent or guardian has reviewed this information and agrees to your participation.
                  </p>
                </div>
              )}
          </motion.div>

          {/* Consent Checkboxes */}
          <motion.div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6" variants={itemVariants}>
            <h3 className="text-lg font-semibold text-forest-800 mb-4">Consent Agreement</h3>
            
            {error && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the <Link to="/terms" className="text-emerald-700 hover:text-emerald-800 underline">Terms of Service</Link>.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the <Link to="/privacy" className="text-emerald-700 hover:text-emerald-800 underline">Privacy Policy</Link>.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedAssessment}
                  onChange={(e) => setAcceptedAssessment(e.target.checked)}
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I understand this assessment is for educational purposes only and does not constitute medical advice or diagnosis.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedResearch}
                  onChange={(e) => setAcceptedResearch(e.target.checked)}
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I have read and understood all the assessment information above and consent to participate in this assessment.
                </span>
              </label>

              {consentType === 'minor' && (
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parentalConsent}
                    onChange={(e) => setParentalConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
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
              {loading ? 'Saving...' : 'I Consent - Proceed to Assessment'}
            </motion.button>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/dashboard" className="btn-secondary text-center block px-8 py-4 text-lg">
                Decline - Return to Dashboard
              </Link>
            </motion.div>
          </motion.div>

          {/* Footer Note */}
          <motion.div className="text-center mt-8" variants={itemVariants}>
            <p className="text-sm text-gray-500">
              By proceeding, your consent will be recorded with timestamp for legal compliance.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConsentPage; 