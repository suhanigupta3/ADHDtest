import React from 'react';
import { Navigate } from 'react-router-dom';
import { useConsent } from '../hooks/useConsent';

interface ConsentGuardProps {
  children: React.ReactNode;
}

const ConsentGuard: React.FC<ConsentGuardProps> = ({ children }) => {
  const { hasConsent, loading, error } = useConsent();

  // Show loading state while checking consent
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darkforest-50 via-earth-50 to-darkforest-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-darkforest-300 border-t-darkforest-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking consent status...</p>
        </div>
      </div>
    );
  }

  // Show error state if consent check failed
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darkforest-50 via-earth-50 to-darkforest-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.064 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Check Consent Status
          </h3>
          <p className="text-gray-600 mb-4">
            There was an error checking your consent status. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // If user hasn't given consent, redirect to consent page
  if (!hasConsent) {
    return <Navigate to="/consent" replace />;
  }

  // If user has given consent, render the protected content
  return <>{children}</>;
};

export default ConsentGuard; 