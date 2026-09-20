import React from 'react';
import { useApp } from '../../context/AppContext';
import { GlobalOratorsLogo } from '../common/GlobalOratorsLogo';

interface LandingFooterProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onStartOnboarding,
  onOpenPartner
}) => {
  const { setCurrentPortal, navigate } = useApp();

  return (
    <footer className="bg-slate-950 py-12 px-4 sm:px-8 text-xs text-slate-400 text-left">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <GlobalOratorsLogo className="w-8 h-8 shrink-0" colorMode="gold" />
              <div className="font-serif font-black text-slate-100 text-sm tracking-tight">
                Global <span className="text-[#7A4B06] dark:text-[#E3B95C]">Orators</span> Project
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
                <li>
                  <a 
                    href="/" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a 
                    href="/about" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/about');
                    }} 
                    className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a 
                    href="/academy" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/academy');
                    }} 
                    className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors"
                  >
                    Academy
                  </a>
                </li>
                <li>
                  <a 
                    href="/foundation" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/foundation');
                    }} 
                    className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors"
                  >
                    Foundation
                  </a>
                </li>
                <li>
                  <a 
                    href="/escapism" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/escapism');
                    }} 
                    className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors"
                  >
                    Escapism
                  </a>
                </li>
                <li>
                  <a 
                    href="/tournaments" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/tournaments');
                    }} 
                    className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors"
                  >
                    Tournaments
                  </a>
                </li>
                <li>
                  <a 
                    href="/testimonials" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/testimonials');
                    }} 
                    className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors"
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a 
                    href="/contact" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-100 font-bold mb-3">
                Platforms
              </div>
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li>
                  <a 
                    href="/" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/');
                      setCurrentPortal('landing');
                    }} 
                    className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors cursor-pointer"
                  >
                    Main Forum Home
                  </a>
                </li>
                <li>
                  <a 
                    href="/speaker" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/speaker');
                      setCurrentPortal('speaker_app');
                    }} 
                    className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors cursor-pointer"
                  >
                    Orators App
                  </a>
                </li>
                <li>
                  <a 
                    href="/coach" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/coach');
                      setCurrentPortal('coach_os');
                    }} 
                    className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors cursor-pointer"
                  >
                    Coach App Portal
                  </a>
                </li>
                <li>
                  <a 
                    href="/apply"
                    onClick={(e) => {
                      e.preventDefault();
                      onStartOnboarding();
                    }} 
                    className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors cursor-pointer"
                  >
                    Speaker Onboarding
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-100 font-bold mb-3">
                Engagement
              </div>
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li>
                  <button onClick={() => onOpenPartner('Foundation')} className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors cursor-pointer">
                    Grant Inquiries
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenPartner('Academy')} className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors cursor-pointer">
                    School Partnerships
                  </button>
                </li>
                <li>
                  <a 
                    href="/contact" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors"
                  >
                    Faculty Dispatch Form
                  </a>
                </li>
                <li>
                  <a href="mailto:director@globaloratorsproject.com" className="inline-flex items-center min-h-[24px] py-1 hover:text-slate-100 transition-colors">
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
