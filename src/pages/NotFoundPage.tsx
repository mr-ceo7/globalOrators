import React from 'react';
import { SEOHead } from '../components/common/SEOHead';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

/** Shown for paths the site doesn't have, instead of silently rendering the homepage. */
export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => (
  <section className="max-w-3xl mx-auto px-4 sm:px-8 py-24 sm:py-32 text-center">
    <SEOHead
      title="Page not found"
      description="The page you were looking for doesn't exist on the Global Orators Project site."
      noIndex={true}
    />
    <div className="text-xs font-mono tracking-widest uppercase text-brand-gold font-bold mb-3">404</div>
    <h1 className="font-serif font-black text-3xl sm:text-4xl text-slate-100 mb-4">Page not found</h1>
    <p className="text-slate-300 text-sm sm:text-base mb-8">
      The page you were looking for doesn't exist or has moved.
    </p>
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="px-5 py-2.5 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-on-gold font-serif font-bold text-sm"
      >
        Go to the homepage
      </button>
      <button
        type="button"
        onClick={() => onNavigate('/contact')}
        className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-200 hover:border-slate-700 text-sm"
      >
        Contact us
      </button>
    </div>
  </section>
);
