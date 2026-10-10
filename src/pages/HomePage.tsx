import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { AudienceChooser } from '../components/landing/AudienceChooser';
import { ProcessSection } from '../components/landing/ProcessSection';
import { MissionFounders, MissionPillars } from '../components/landing/MissionSection';
import { BranchCards } from '../components/landing/BranchCards';
import { ChampionshipsSection } from '../components/landing/ChampionshipsSection';
import { SpeakerSpotlight } from '../components/landing/SpeakerSpotlight';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { ContactSection } from '../components/landing/ContactSection';
import { SEOHead } from '../components/common/SEOHead';
import { Band } from '../components/landing/Band';
import { HighlightTicker } from '../components/landing/HighlightTicker';

interface HomePageProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
  onNavigate: (path: string) => void;
  /** Seconds to hold the hero entrance while the intro curtain lifts */
  heroDelay?: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartOnboarding,
  onOpenPartner,
  onNavigate,
  heroDelay = 0
}) => {
  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Global Orators Project',
    'url': 'https://globaloratorsproject.com',
    'description': 'Pan-African parliamentary debate training, leadership development, and healing-centered voice programs.',
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
        description="Pan-African debate training, leadership development, and healing-centered voice programs for African youth: parliamentary debate, public speaking, and safe spaces to speak."
        canonicalPath="/"
        jsonLd={homeSchema}
      />

      {/* Sections alternate cream, charcoal ("ink") and gold bands joined by curved edges */}
      <Band tone="cream" next="ink">
        {/* 1. Hero Section with Value Proposition & Direct CTAs */}
        <HeroSection onStartOnboarding={onStartOnboarding} entranceDelay={heroDelay} />
      </Band>

      {/* 2. Early Audience Fast-Track Chooser */}
      <Band tone="ink" next="cream">
        <AudienceChooser
          onSelectBranch={(b) => onStartOnboarding(b)}
          onOpenPartner={onOpenPartner}
        />
      </Band>

      {/* 4. 4-Stage Methodology & Progression Model */}
      <Band tone="cream" next="gold">
        <ProcessSection />
      </Band>

      {/* 5. Chapter I: The founders' convictions */}
      <Band tone="gold" next="cream">
        <MissionFounders />
      </Band>

      {/* 6. Chapter I continued: the two pillars & audio dispatch */}
      <Band tone="cream" next="ink">
        <MissionPillars />
      </Band>

      {/* Crossed strips of highlights over the cream → charcoal seam */}
      <HighlightTicker />

      {/* 7. Chapter II: Functional Branches */}
      <Band tone="ink" next="cream">
        <BranchCards
          onStartOnboarding={onStartOnboarding}
          onOpenPartner={onOpenPartner}
        />
      </Band>

      {/* 8. Chapter III: Continental & World Championships */}
      <Band tone="cream" next="gold">
        <ChampionshipsSection />
      </Band>

      {/* 9. Featured Speaker Spotlight: Imani, Milo Brian & Valerie Wanjiku */}
      <Band tone="gold" next="ink">
        <SpeakerSpotlight onStartOnboarding={onStartOnboarding} />
      </Band>

      {/* 10. Chapter IV: Living Catharsis Proof & Conversion CTAs */}
      <Band tone="ink" next="cream">
        <TestimonialsSection
          onStartOnboarding={onStartOnboarding}
          onOpenPartner={onOpenPartner}
        />
      </Band>

      {/* 11. Direct Faculty Inquiries */}
      <Band tone="cream" next="ink">
        <ContactSection id="contact" />
      </Band>
    </div>
  );
};
