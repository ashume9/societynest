import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import PartnerAuth from './components/PartnerAuth';
import PartnerProfileSetup from './components/PartnerProfileSetup';
import PartnerDashboard from './components/PartnerDashboard';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import Navigation from './components/Navigation';
import ProfileSetup from './components/ProfileSetup';
import SimpleIroningService from './components/SimpleIroningService';
import OrderHistory from './components/OrderHistory';
import ProfileEdit from './components/ProfileEdit';
import TermsAndConditions from './components/TermsAndConditions';
import PrivacyPolicy from './components/PrivacyPolicy';
import RefundPolicy from './components/RefundPolicy';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import { User, Partner } from './types/index';
import { auth } from './lib/auth';
import { partnerAuth } from './lib/partnerAuth';

type LegalPage = 'terms' | 'privacy' | 'refund' | 'faq' | null;

function getLegalPageFromPath(): LegalPage {
  const path = window.location.pathname;
  if (path === '/terms' || path === '/terms-and-conditions') return 'terms';
  if (path === '/privacy' || path === '/privacy-policy') return 'privacy';
  if (path === '/refund' || path === '/refund-policy') return 'refund';
  if (path === '/faq') return 'faq';
  return null;
}

if (window.location.pathname === '/download-android-app') {
  window.location.replace('https://1drv.ms/u/c/022e5e87849664e0/IQAUcvrtm9nCRrT8D57CzEVHAU_5JJav_qjX4-KojrXVUTc?e=VH9UCR');
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [needsPartnerProfileSetup, setNeedsPartnerProfileSetup] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showPartnerAuth, setShowPartnerAuth] = useState(false);
  const [showTerms, setShowTerms] = useState(getLegalPageFromPath() === 'terms');
  const [showPrivacy, setShowPrivacy] = useState(getLegalPageFromPath() === 'privacy');
  const [showRefund, setShowRefund] = useState(getLegalPageFromPath() === 'refund');
  const [showFAQ, setShowFAQ] = useState(getLegalPageFromPath() === 'faq');

  const [currentView, setCurrentView] = useState<'dashboard' | 'ironing' | 'profile' | 'orders'>('dashboard');

  useEffect(() => {
    // Check for existing sessions
    const checkSession = async () => {
      try {
        // Check if we're in partner mode based on URL
        const isPartnerMode = window.location.pathname.includes('partner') || window.location.search.includes('partner');
        
        if (isPartnerMode) {
          const currentPartner = await partnerAuth.getCurrentPartner();
          if (currentPartner) {
            setPartner(currentPartner);
            setShowLanding(false);
            setShowPartnerAuth(false);
            // Check if partner profile needs completion
            if (!currentPartner.phone || !currentPartner.society_id || !currentPartner.identity_number) {
              setNeedsPartnerProfileSetup(true);
            }
          } else {
            setShowPartnerAuth(true);
            setShowLanding(false);
          }
        } else {
          // Reset session on app load for testing
          auth.resetSession();
          const currentUser = await auth.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setShowLanding(false);
            // Check if profile needs completion
            if (!currentUser.phone || !currentUser.society_id) {
              setNeedsProfileSetup(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleSignOut = async () => {
    if (partner) {
      await partnerAuth.signOut();
      setPartner(null);
      setNeedsPartnerProfileSetup(false);
      setShowPartnerAuth(false);
      setShowLanding(true);
    } else {
      await auth.signOut();
      setUser(null);
      setNeedsProfileSetup(false);
      setShowLanding(true);
    }
  };

  const handleProfileComplete = (updatedUser: User) => {
    setUser(updatedUser);
    setNeedsProfileSetup(false);
  };

  const handlePartnerProfileComplete = (updatedPartner: Partner) => {
    setPartner(updatedPartner);
    setNeedsPartnerProfileSetup(false);
  };

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleSwitchToPartner = async (mode: 'signup' | 'signin' = 'signup') => {
    // Sign out current user session before switching to partner
    if (user) {
      await auth.signOut();
      setUser(null);
      setNeedsProfileSetup(false);
    }
    setShowLanding(false);
    setShowPartnerAuth(true);
    // Store the mode for the partner auth component
    localStorage.setItem('partner_auth_mode', mode);
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
    setShowPartnerAuth(false);
    // Don't clear sessions here - let users explicitly sign out if they want to
  };

  const handleAuthSuccess = (user: User) => {
    setUser(user);
    setShowLanding(false);
    // Check if profile needs completion
    if (!user.phone || !user.society_id) {
      setNeedsProfileSetup(true);
    }
  };

  const handlePartnerAuthSuccess = (partner: Partner) => {
    setPartner(partner);
    setShowLanding(false);
    setShowPartnerAuth(false);
    // Check if partner profile needs completion
    if (!partner.phone || !partner.society_id || !partner.identity_number) {
      setNeedsPartnerProfileSetup(true);
    }
  };

  const handleBackToCustomer = () => {
    setShowPartnerAuth(false);
    setShowLanding(true);
    // Don't automatically clear partner session here
    // Let the user explicitly sign out if they want to
  };

  const handleShowTerms = () => {
    setShowTerms(true);
    setShowPrivacy(false);
    setShowRefund(false);
    setShowFAQ(false);
    window.history.pushState({}, '', '/terms');
  };

  const handleShowPrivacy = () => {
    setShowPrivacy(true);
    setShowTerms(false);
    setShowRefund(false);
    setShowFAQ(false);
    window.history.pushState({}, '', '/privacy-policy');
  };

  const handleShowRefund = () => {
    setShowRefund(true);
    setShowTerms(false);
    setShowPrivacy(false);
    setShowFAQ(false);
    window.history.pushState({}, '', '/refund-policy');
  };

  const handleShowFAQ = () => {
    setShowFAQ(true);
    setShowTerms(false);
    setShowPrivacy(false);
    setShowRefund(false);
    window.history.pushState({}, '', '/faq');
  };

  const handleBackFromLegal = () => {
    setShowTerms(false);
    setShowPrivacy(false);
    setShowRefund(false);
    setShowFAQ(false);
    window.history.pushState({}, '', '/');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Partner flow
  if (partner) {
    if (needsPartnerProfileSetup) {
      return <PartnerProfileSetup partner={partner} onComplete={handlePartnerProfileComplete} />;
    }
    return <PartnerDashboard partner={partner} onSignOut={handleSignOut} />;
  }

  // Legal pages
  if (showTerms) {
    return <TermsAndConditions onBack={handleBackFromLegal} />;
  }

  if (showPrivacy) {
    return <PrivacyPolicy onBack={handleBackFromLegal} />;
  }

  if (showRefund) {
    return <RefundPolicy onBack={handleBackFromLegal} />;
  }

  if (showFAQ) {
    return <FAQ onBack={handleBackFromLegal} />;
  }

  if (showPartnerAuth) {
    return (
      <PartnerAuth 
        onAuthSuccess={handlePartnerAuthSuccess} 
        onBackToCustomer={handleBackToCustomer}
        onBackToLanding={handleBackToLanding}
      />
    );
  }

  // Customer flow
  if (showLanding && !user) {
    return (
      <div>
        <LandingPage onGetStarted={handleGetStarted} onSwitchToPartner={handleSwitchToPartner} />
        <Footer onTermsClick={handleShowTerms} onPrivacyClick={handleShowPrivacy} onRefundClick={handleShowRefund} onFAQClick={handleShowFAQ} />
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <AuthPage onAuthSuccess={handleAuthSuccess} onBackToLanding={handleBackToLanding} />
        <Footer onTermsClick={handleShowTerms} onPrivacyClick={handleShowPrivacy} onRefundClick={handleShowRefund} onFAQClick={handleShowFAQ} />
      </div>
    );
  }

  if (needsProfileSetup) {
    return <ProfileSetup user={user} onComplete={handleProfileComplete} />;
  }

  if (currentView === 'ironing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation 
          user={user} 
          onSignOut={handleSignOut}
          onDashboardClick={() => setCurrentView('dashboard')}
          onManageProfile={() => setCurrentView('profile')}
        />
        <main className="pt-16">
          <SimpleIroningService user={user} onBack={() => setCurrentView('dashboard')} />
        </main>
        <Footer onTermsClick={handleShowTerms} onPrivacyClick={handleShowPrivacy} onRefundClick={handleShowRefund} onFAQClick={handleShowFAQ} />
      </div>
    );
  }

  if (currentView === 'orders') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation 
          user={user} 
          onSignOut={handleSignOut}
          onDashboardClick={() => setCurrentView('dashboard')}
          onManageProfile={() => setCurrentView('profile')}
        />
        <main className="pt-16">
          <OrderHistory user={user} onBack={() => setCurrentView('dashboard')} />
        </main>
        <Footer onTermsClick={handleShowTerms} onPrivacyClick={handleShowPrivacy} onRefundClick={handleShowRefund} onFAQClick={handleShowFAQ} />
      </div>
    );
  }

  if (currentView === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation 
          user={user} 
          onSignOut={handleSignOut}
          onDashboardClick={() => setCurrentView('dashboard')}
          onManageProfile={() => setCurrentView('profile')}
        />
        <main className="pt-16">
          <ProfileEdit 
            user={user} 
            onSave={(updatedUser) => {
              setUser(updatedUser);
              setCurrentView('dashboard');
            }}
            onCancel={() => setCurrentView('dashboard')} 
          />
        </main>
        <Footer onTermsClick={handleShowTerms} onPrivacyClick={handleShowPrivacy} onRefundClick={handleShowRefund} onFAQClick={handleShowFAQ} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation 
        user={user} 
        onSignOut={handleSignOut}
        onDashboardClick={() => setCurrentView('dashboard')}
        onManageProfile={() => setCurrentView('profile')}
      />
      <main className="pt-16">
        <Dashboard 
          user={user} 
          onUserUpdate={setUser}
          onViewChange={setCurrentView}
        />
      </main>
      <Footer onTermsClick={handleShowTerms} onPrivacyClick={handleShowPrivacy} onRefundClick={handleShowRefund} onFAQClick={handleShowFAQ} />
    </div>
  );
}

export default App;