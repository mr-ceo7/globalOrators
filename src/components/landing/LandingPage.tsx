import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { PartnerModal } from './PartnerModal';
import { HomePage } from '../../pages/HomePage';
import { AboutPage } from '../../pages/AboutPage';
import { AcademyPage } from '../../pages/AcademyPage';
import { FoundationPage } from '../../pages/FoundationPage';
import { EscapismPage } from '../../pages/EscapismPage';
import { TournamentsPage } from '../../pages/TournamentsPage';
import { TestimonialsPage } from '../../pages/TestimonialsPage';
import { ContactPage } from '../../pages/ContactPage';
import { DemoPage } from '../../pages/DemoPage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { IntroCurtain } from './IntroCurtain';
import { INTRO_HERO_DELAY, shouldShowIntro } from './introCurtain';
import { startSmoothScroll } from './smoothScroll';

export const LandingPage: React.FC = () => {
  const { currentPath, navigate, setCurrentPortal } = useApp();
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerBranch, setPartnerBranch] = useState<'Academy' | 'Foundation'>('Academy');
  // Decided once on first render so the hero entrance can wait for the curtain
  const [showIntro] = useState(shouldShowIntro);

  // Momentum scrolling only while the marketing site is mounted; the apps keep native scroll
  useEffect(() => startSmoothScroll(), []);

  const handleStartOnboarding = (branch?: 'Academy' | 'Foundation') => {
    if (branch) {
      localStorage.setItem('globalorators_selected_branch', branch);
    }
    navigate('/onboarding');
    setCurrentPortal('onboarding');
  };

  const handleOpenPartner = (branch: 'Academy' | 'Foundation') => {
    setPartnerBranch(branch);
    setPartnerModalOpen(true);
  };

  const renderActivePage = () => {
    const normalized = currentPath.toLowerCase().replace(/\/$/, '') || '/';

    switch (normalized) {
      case '/about':
      case '/mission':
        return (
          <AboutPage 
            onStartOnboarding={handleStartOnboarding} 
            onOpenPartner={handleOpenPartner} 
            onNavigate={navigate} 
          />
        );
      case '/academy':
        return (
          <AcademyPage 
            onStartOnboarding={handleStartOnboarding} 
            onOpenPartner={handleOpenPartner} 
            onNavigate={navigate} 
          />
        );
      case '/foundation':
        return (
          <FoundationPage 
            onStartOnboarding={handleStartOnboarding} 
            onOpenPartner={handleOpenPartner} 
            onNavigate={navigate} 
          />
        );
      case '/escapism':
        return (
          <EscapismPage 
            onStartOnboarding={handleStartOnboarding} 
            onNavigate={navigate} 
          />
        );
      case '/tournaments':
      case '/championships':
        return (
          <TournamentsPage 
            onStartOnboarding={handleStartOnboarding} 
            onNavigate={navigate} 
          />
        );
      case '/testimonials':
        return (
          <TestimonialsPage 
            onStartOnboarding={handleStartOnboarding} 
            onOpenPartner={handleOpenPartner} 
            onNavigate={navigate} 
          />
        );
      case '/contact':
      case '/contact-us':
        return (
          <ContactPage 
            onStartOnboarding={handleStartOnboarding} 
            onOpenPartner={handleOpenPartner} 
            onNavigate={navigate} 
          />
        );
      case '/demo':
      case '/tour':
      case '/motion':
        return (
          <DemoPage 
            onStartOnboarding={handleStartOnboarding} 
            onOpenPartner={handleOpenPartner} 
            onNavigate={navigate} 
          />
        );
      case '/':
        return (
          <HomePage 
            onStartOnboarding={handleStartOnboarding} 
            onOpenPartner={handleOpenPartner} 
            onNavigate={navigate} 
            heroDelay={showIntro ? INTRO_HERO_DELAY : 0}
          />
        );
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="landing-root min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#C89630] selection:text-white transition-colors duration-200">
      {showIntro && <IntroCurtain />}

      {/* 1. Header Navigation & Portals */}
      <LandingHeader
        onStartOnboarding={handleStartOnboarding}
        onOpenPartner={handleOpenPartner}
      />

      {/* Main Editorial Content Routed View */}
      <main>
        <motion.div
          key={currentPath.toLowerCase().replace(/\/$/, '') || '/'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderActivePage()}
        </motion.div>
      </main>

      {/* Architectural Editorial Footer */}
      <div className="band band-ink dark">
        <LandingFooter
          onStartOnboarding={handleStartOnboarding}
          onOpenPartner={handleOpenPartner}
        />
      </div>

      {/* Direct Institutional & Partnership Dialog */}
      <PartnerModal
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
        branch={partnerBranch}
      />
    </div>
  );
};
