import React from 'react';
import { useApp } from '../../context/AppContext';
import { NubianFitLogo } from '../common/NubianFitLogo';

interface LandingFooterProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onStartOnboarding,
  onOpenPartner
}) => {
  const { setCurrentPortal, showToast } = useApp();

  return (
    <footer className="bg-slate-950 py-12 px-4 sm:px-8 text-xs text-slate-400 text-left">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0D3A35] border border-[#276152]/60 text-white flex items-center justify-center p-0.5">
                <NubianFitLogo className="w-full h-full" colorMode="gold" />
              </div>
              <div className="font-serif font-black text-slate-100 text-sm tracking-tight">
                global <span className="text-[#C85A32]">Orators</span> Project
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm">
              A Pan-African intellectual movement dedicated to cognitive deconditioning, sovereign leadership manifestation, and therapeutic vocal catharsis.
            </p>
            <div className="text-[10px] font-mono text-slate-400">
              Nairobi • London • Johannesburg • Dakar • Global
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-100 font-bold mb-3">
                Navigation
              </div>
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-100 transition-colors cursor-pointer">Home</button></li>
                <li><a href="#mission" className="hover:text-slate-100 transition-colors">About</a></li>
                <li><a href="#academy" className="hover:text-slate-100 transition-colors">Academy</a></li>
                <li><a href="#foundation" className="hover:text-slate-100 transition-colors">Foundation</a></li>
                <li><a href="#escapism" className="hover:text-slate-100 transition-colors">Escapism</a></li>
                <li><a href="#championships" className="hover:text-slate-100 transition-colors">Tournaments</a></li>
                <li><a href="#testimonials" className="hover:text-slate-100 transition-colors">Testimonials</a></li>
              </ul>
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-100 font-bold mb-3">
                Platforms
              </div>
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li>
                  <button onClick={() => setCurrentPortal('landing')} className="hover:text-slate-100 transition-colors cursor-pointer">
                    Main Forum Home
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentPortal('speaker_app')} className="hover:text-slate-100 transition-colors cursor-pointer">
                    Speaker Practice Studio
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentPortal('coach_os')} className="hover:text-slate-100 transition-colors cursor-pointer">
                    Coach OS Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => onStartOnboarding()} className="hover:text-slate-100 transition-colors cursor-pointer">
                    Speaker Onboarding
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-100 font-bold mb-3">
                Engagement
              </div>
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li>
                  <button onClick={() => onOpenPartner('Foundation')} className="hover:text-slate-100 transition-colors cursor-pointer">
                    Grant Inquiries
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenPartner('Academy')} className="hover:text-slate-100 transition-colors cursor-pointer">
                    School Partnerships
                  </button>
                </li>
                <li>
                  <a href="mailto:director@globalorators.org" className="hover:text-slate-100 transition-colors">
                    Contact Governance
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400">
          <div>© {new Date().getFullYear()} Global Orators Project (GOP). All Rights Reserved.</div>
          <div className="font-serif italic text-slate-400">"speak with impact"</div>
        </div>
      </div>
    </footer>
  );
};
