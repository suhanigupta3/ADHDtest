import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WelcomePage from './components/WelcomePage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import ConsentPage from './components/ConsentPage';
import ConsentGuard from './components/ConsentGuard';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import AboutADHDPage from './components/AboutADHDPage';
import AssessmentPage from './components/AssessmentPage';
import GameResultsPage from './components/GameResultsPage';
import AboutUsPage from './pages/AboutUsPage';
import ResourcesPage from './pages/ResourcesPage';
import ContactPage from './pages/ContactPage';
import HelpCenterPage from './pages/HelpCenterPage';
import FAQPage from './pages/FAQPage';
import TechnicalSupportPage from './pages/TechnicalSupportPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import DataProtectionPage from './pages/DataProtectionPage';
import AccessibilityPage from './pages/AccessibilityPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/auth" />;
};

// Public Route Component (redirect if authenticated, only for auth pages)
const AuthOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return !currentUser ? <>{children}</> : <Navigate to="/dashboard" />;
};

// Home Route Component (show different pages based on auth status)
const HomeRoute: React.FC = () => {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/dashboard" /> : <WelcomePage />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={<HomeRoute />} 
            />
            <Route 
              path="/auth" 
              element={
                <AuthOnlyRoute>
                  <AuthPage />
                </AuthOnlyRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/consent" 
              element={
                <ProtectedRoute>
                  <ConsentPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Placeholder routes for future pages */}
            <Route 
              path="/assessment" 
              element={
                <ProtectedRoute>
                  <ConsentGuard>
                    <AssessmentPage />
                  </ConsentGuard>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/learn" 
              element={<AboutADHDPage />} 
            />
            
            <Route 
              path="/about-adhd" 
              element={<AboutADHDPage />} 
            />
            
            <Route 
              path="/terms" 
              element={<TermsPage />} 
            />
            
            <Route 
              path="/privacy" 
              element={<PrivacyPage />} 
            />
            
            {/* New Navigation Pages */}
            <Route 
              path="/about-us" 
              element={<AboutUsPage />} 
            />
            
            <Route 
              path="/resources" 
              element={<ResourcesPage />} 
            />
            
            <Route 
              path="/contact" 
              element={<ContactPage />} 
            />
            
            {/* Support Pages */}
            <Route 
              path="/help-center" 
              element={<HelpCenterPage />} 
            />
            
            <Route 
              path="/faq" 
              element={<FAQPage />} 
            />
            
            <Route 
              path="/technical-support" 
              element={<TechnicalSupportPage />} 
            />
            
            {/* Legal Pages */}
            <Route 
              path="/cookie-policy" 
              element={<CookiePolicyPage />} 
            />
            
            <Route 
              path="/data-protection" 
              element={<DataProtectionPage />} 
            />
            
            <Route 
              path="/accessibility" 
              element={<AccessibilityPage />} 
            />
            
            <Route 
              path="/results" 
              element={
                <ProtectedRoute>
                  <GameResultsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
