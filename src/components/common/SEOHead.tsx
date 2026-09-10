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
  ogImage = '/images/hero-orator.jpg',
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
    const baseDomain = 'https://globalorators.org';
    const canonicalUrl = `${baseDomain}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 4. Set OpenGraph Meta Tags
    const setMetaProperty = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaProperty('og:title', fullTitle);
    setMetaProperty('og:description', description);
    setMetaProperty('og:url', canonicalUrl);
    setMetaProperty('og:type', ogType);
    const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${baseDomain}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;
    setMetaProperty('og:image', ogImageUrl);

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
