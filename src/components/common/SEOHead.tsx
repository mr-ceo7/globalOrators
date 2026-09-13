import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, any>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath = '/',
  ogType = 'website',
  ogImage = '/images/og-preview.jpg',
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Set document title
    const fullTitle = `${title} | Global Orators Project`;
    document.title = fullTitle;

    // 2. Set Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Set Canonical Link (Production canonical domain for SEO indexing)
    const baseDomain = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')
      ? window.location.origin
      : 'https://globalorators.org';
    const canonicalUrl = `${baseDomain}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 4. OpenGraph & Twitter Meta Tag Helpers
    const setMetaProperty = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${baseDomain}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;

    setMetaProperty('og:site_name', 'Global Orators');
    setMetaProperty('og:title', fullTitle);
    setMetaProperty('og:description', description);
    setMetaProperty('og:url', canonicalUrl);
    setMetaProperty('og:type', ogType);
    setMetaProperty('og:image', ogImageUrl);
    setMetaProperty('og:image:secure_url', ogImageUrl);
    setMetaProperty('og:image:type', ogImageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg');
    setMetaProperty('og:image:width', '1200');
    setMetaProperty('og:image:height', '630');
    setMetaProperty('og:image:alt', `${title} - Global Orators`);
    setMetaProperty('og:locale', 'en_US');

    // Twitter Card
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', fullTitle);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', ogImageUrl);
    setMetaName('twitter:image:alt', `${title} - Global Orators`);

    // 5. Inject Structured Data JSON-LD
    if (jsonLd) {
      let scriptTag = document.getElementById('seo-json-ld');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'seo-json-ld';
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    }

    // Scroll to top immediately when mounting a new page
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [title, description, canonicalPath, ogType, ogImage, jsonLd]);

  return null;
};
