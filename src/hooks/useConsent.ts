import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export interface ConsentStatus {
  hasConsent: boolean;
  loading: boolean;
  error: string | null;
  consentDate?: string;
}

export const useConsent = (): ConsentStatus => {
  const { currentUser } = useAuth();
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>({
    hasConsent: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    const checkConsentStatus = async () => {
      if (!currentUser) {
        setConsentStatus({
          hasConsent: false,
          loading: false,
          error: null
        });
        return;
      }

      try {
        setConsentStatus(prev => ({ ...prev, loading: true, error: null }));
        
        const consentDoc = await getDoc(doc(db, 'userConsents', currentUser.uid));
        
        if (consentDoc.exists()) {
          const consentData = consentDoc.data();
          setConsentStatus({
            hasConsent: true,
            loading: false,
            error: null,
            consentDate: consentData.consentDate?.toDate?.()?.toISOString() || 'Unknown'
          });
        } else {
          setConsentStatus({
            hasConsent: false,
            loading: false,
            error: null
          });
        }
      } catch (error: any) {
        console.error('Error checking consent status:', error);
        setConsentStatus({
          hasConsent: false,
          loading: false,
          error: error.message || 'Failed to check consent status'
        });
      }
    };

    checkConsentStatus();
  }, [currentUser]);

  return consentStatus;
}; 