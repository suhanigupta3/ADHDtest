import { useState, useEffect } from 'react';

const DISCLAIMER_DISMISSED_KEY = 'adhd_assessment_disclaimer_dismissed';

export const useDisclaimer = () => {
  const [isDisclaimerDismissed, setIsDisclaimerDismissed] = useState<boolean>(false);

  // Load disclaimer state from localStorage on component mount
  useEffect(() => {
    const dismissed = localStorage.getItem(DISCLAIMER_DISMISSED_KEY);
    if (dismissed === 'true') {
      setIsDisclaimerDismissed(true);
    }
  }, []);

  // Function to dismiss the disclaimer
  const dismissDisclaimer = () => {
    setIsDisclaimerDismissed(true);
    localStorage.setItem(DISCLAIMER_DISMISSED_KEY, 'true');
  };

  return {
    isDisclaimerDismissed,
    dismissDisclaimer,
  };
}; 