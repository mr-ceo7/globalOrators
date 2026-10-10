import React from 'react';
import { MotionProductTour } from '../components/landing/MotionProductTour';
import { SEOHead } from '../components/common/SEOHead';
import { GraduationCap, Heart, ArrowRight, Download, Film, Sparkles, CheckCircle2 } from 'lucide-react';

interface DemoPageProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
  onNavigate: (path: string) => void;
}

export const DemoPage: React.FC<DemoPageProps> = ({
  onStartOnboarding,
  onOpenPartner,
  onNavigate,
}) => {
  const demoSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Interactive Motion Tour & Launch Demo - Global Orators Project',
    url: 'https://globaloratorsproject.com/demo',
    description:
      'Experience the programmatic motion design of GOP Coach OS and Orators Speaker Chamber in interactive 3D.',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SEOHead
        title="Interactive 3D Motion Tour & Launch Demo"
        description="Experience the programmatic motion design and synchronized architecture of GOP Coach OS and Orators Speaker Chamber."
        canonicalPath="/demo"
        jsonLd={demoSchema}
      />

      {/* Main Interactive 3D Showcase */}
      <MotionProductTour onStartOnboarding={onStartOnboarding} isStandalonePage={true} />

      {/* Architectural Capabilities Deep-Dive */}
      <section className="py-12 sm:py-20 px-4 sm:px-8 border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono tracking-widest text-[#E3B95C] uppercase bg-[#C89630]/10 px-2 py-0.5 rounded border border-[#C89630]/30 font-bold">
              Engineering Specs
            </span>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              // Motion Physics & WebGL Architecture
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-black text-slate-100 mb-6">
            Two Unified Portals. Zero Latency Forensics.
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-[#C89630]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#C89630]/15 border border-[#C89630]/30 flex items-center justify-center text-[#E3B95C] mb-4">
                <Film className="w-5 h-5" />
              </div>
              <h4 className="text-base font-serif font-bold text-slate-100 mb-2">
                Programmatic Remotion Suite
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Render pixel-perfect launch films directly from code. Automated 60fps/30fps video compilation
                using Chromium headless rendering with high-dynamic range color grading.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-[#C89630]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#C89630]/15 border border-[#C89630]/30 flex items-center justify-center text-[#E3B95C] mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-serif font-bold text-slate-100 mb-2">
                Three.js WebGL Spatial Rig
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Real-time GPU accelerated particle constellation and dynamic architectural coordinate grid
                providing ambient depth that tracks cursor coordinates and device orientation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-[#C89630]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#C89630]/15 border border-[#C89630]/30 flex items-center justify-center text-[#E3B95C] mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-serif font-bold text-slate-100 mb-2">
                Kinetic Spring Physics
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Smooth damping and natural inertia simulating physical weight, cursor ripples, and
                tactile card tilt modeled after Stripe and Apple launch demonstrations.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-12 p-8 rounded-3xl bg-slate-900 border border-[#C89630]/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-serif font-black text-slate-100">
                Ready to Experience Sovereign Forensics Training?
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Join our championship varsity cohorts or apply for a grant-funded foundation fellowship.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onStartOnboarding('Academy')}
                className="px-5 py-3 rounded-xl bg-[#C89630] text-[#181B1F] font-serif font-bold text-xs sm:text-sm hover:bg-[#B37D22] flex items-center gap-2 shadow-lg shadow-[#C89630]/20 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Apply to Academy</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onStartOnboarding('Foundation')}
                className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-[#C89630]/50 text-slate-300 hover:text-white font-serif font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-[#E3B95C]" />
                <span>Apply for Fellowship</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
