import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { MotionProductTour } from '../components/landing/MotionProductTour';
import { AudienceChooser } from '../components/landing/AudienceChooser';
import { ProcessSection } from '../components/landing/ProcessSection';
import { MissionSection } from '../components/landing/MissionSection';
import { BranchCards } from '../components/landing/BranchCards';
import { ChampionshipsSection } from '../components/landing/ChampionshipsSection';
import { SpeakerSpotlight } from '../components/landing/SpeakerSpotlight';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { ContactSection } from '../components/landing/ContactSection';
import { SEOHead } from '../components/common/SEOHead';

interface HomePageProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartOnboarding,
  onOpenPartner,
  onNavigate
}) => {
  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Global Orators Project',
    'url': 'https://globaloratorsproject.com',
    'description': 'Premier Pan-African parliamentary debate training, sovereign leadership development, and healing-centered voice programs.',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://globaloratorsproject.com/?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <div>
      <SEOHead
        title="Debate Training, Leadership Development & Voice Programs"
        description="Pan-African debate training, sovereign leadership development, and healing-centered vocal programs for African youth. Master parliamentary forensics and voice."
        canonicalPath="/"
        jsonLd={homeSchema}
      />

      {/* 1. Hero Section with Value Proposition & Direct CTAs */}
      <HeroSection onStartOnboarding={onStartOnboarding} />

      {/* 2. Interactive 3D Programmatic Motion Product Tour (Coach OS & Speaker Portal) */}
      <MotionProductTour onStartOnboarding={onStartOnboarding} />

      {/* 3. Early Audience Fast-Track Chooser */}
      <AudienceChooser
        onSelectBranch={(b) => onStartOnboarding(b)}
        onOpenPartner={onOpenPartner}
      />

      {/* 3. 4-Stage Methodology & Progression Model */}
      <ProcessSection />

      {/* 4. Chapter I: The Diagnosis, The Remedy & Audio Dispatch */}
      <MissionSection />

      {/* 5. Chapter II: Functional Branches */}
      <BranchCards
        onStartOnboarding={onStartOnboarding}
        onOpenPartner={onOpenPartner}
      />

      {/* 6. Chapter III: Continental & World Championships */}
      <ChampionshipsSection />

      {/* 7. Featured Speaker Spotlight: Imani, Milo Brian & Valerie Wanjiku */}
      <SpeakerSpotlight onStartOnboarding={onStartOnboarding} />

      {/* 8. Chapter IV: Living Catharsis Proof & Conversion CTAs */}
      <TestimonialsSection
        onStartOnboarding={onStartOnboarding}
        onOpenPartner={onOpenPartner}
      />

      {/* 9. Direct Faculty Inquiries & Platform Governance */}
      <ContactSection id="contact" />
    </div>
  );
};
