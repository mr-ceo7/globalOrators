import React, { useState } from 'react';
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

export const LandingPage: React.FC = () => {
  const { currentPath, navigate, setCurrentPortal } = useApp();
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerBranch, setPartnerBranch] = useState<'Academy' | 'Foundation'>('Academy');

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
          />
        );
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#C89630] selection:text-white transition-colors duration-200">
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
      <LandingFooter
        onStartOnboarding={handleStartOnboarding}
        onOpenPartner={handleOpenPartner}
      />

      {/* Direct Institutional & Partnership Dialog */}
      <PartnerModal
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
        branch={partnerBranch}
      />
    </div>
  );
};
