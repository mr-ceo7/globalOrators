import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LandingHeader } from './LandingHeader';
import { HeroSection } from './HeroSection';
import { AudienceChooser } from './AudienceChooser';
import { ProcessSection } from './ProcessSection';
import { MissionSection } from './MissionSection';
import { BranchCards } from './BranchCards';
import { ChampionshipsSection } from './ChampionshipsSection';
import { TestimonialsSection } from './TestimonialsSection';
import { LandingFooter } from './LandingFooter';
import { PartnerModal } from './PartnerModal';

export const LandingPage: React.FC = () => {
  const { setCurrentPortal } = useApp();
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerBranch, setPartnerBranch] = useState<'Academy' | 'Foundation'>('Academy');

  const handleStartOnboarding = (branch?: 'Academy' | 'Foundation') => {
    if (branch) {
      localStorage.setItem('globalorators_selected_branch', branch);
    }
    setCurrentPortal('onboarding');
  };

  const handleOpenPartner = (branch: 'Academy' | 'Foundation') => {
    setPartnerBranch(branch);
    setPartnerModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#C85A32] selection:text-white transition-colors duration-200">
      {/* 1. Header Navigation & Portals */}
      <LandingHeader
        onStartOnboarding={handleStartOnboarding}
        onOpenPartner={handleOpenPartner}
      />

      {/* Main Editorial Content */}
      <main>
        {/* 2. Hero Section with Value Proposition & Direct CTAs */}
        <HeroSection onStartOnboarding={handleStartOnboarding} />

        {/* 3. Early Audience Fast-Track Chooser */}
        <AudienceChooser
          onSelectBranch={(b) => handleStartOnboarding(b)}
          onOpenPartner={handleOpenPartner}
        />

        {/* 4. 4-Stage Methodology & Progression Model */}
        <ProcessSection />

        {/* 5. Chapter I: The Diagnosis, The Remedy & Audio Dispatch */}
        <MissionSection />

        {/* 6. Chapter II: The Functional Branches (Academy & Foundation) */}
        <BranchCards
          onStartOnboarding={handleStartOnboarding}
          onOpenPartner={handleOpenPartner}
        />

        {/* 7. Chapter III: Global Arena & Continental Championships */}
        <ChampionshipsSection />

        {/* 8. Chapter IV: Living Proof, Safeguarding & Final Action */}
        <TestimonialsSection
          onStartOnboarding={handleStartOnboarding}
          onOpenPartner={handleOpenPartner}
        />
      </main>

      {/* 9. Architectural Editorial Footer */}
      <LandingFooter
        onStartOnboarding={handleStartOnboarding}
        onOpenPartner={handleOpenPartner}
      />

      {/* 10. Direct Institutional & Partnership Dialog */}
      <PartnerModal
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
        branch={partnerBranch}
      />
    </div>
  );
};
