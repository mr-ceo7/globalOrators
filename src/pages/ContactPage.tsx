import React from 'react';
import { ContactSection } from '../components/landing/ContactSection';
import { SEOHead } from '../components/common/SEOHead';

interface ContactPageProps {
  onStartOnboarding?: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner?: (branch: 'Academy' | 'Foundation') => void;
  onNavigate?: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': 'Contact Global Orators Faculty & Governance',
    'url': 'https://globaloratorsproject.com/contact',
    'description': 'Direct correspondence with Global Orators leadership, debate faculty, and admissions teams in Nairobi, London, and Johannesburg.',
    'mainEntity': {
      '@type': 'Organization',
      'name': 'Global Orators Project',
      'email': 'director@globaloratorsproject.com',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Nairobi',
        'addressCountry': 'Kenya'
      }
    }
  };

  return (
    <div>
      <SEOHead
        title="Contact Faculty & Platform Governance"
        description="Official correspondence channels for Global Orators Project. Connect with forensics coaches, institutional partnership directors, and admissions staff."
        canonicalPath="/contact"
        jsonLd={contactSchema}
      />

      <ContactSection isStandalone={true} />
    </div>
  );
};
