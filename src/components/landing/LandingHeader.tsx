import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronDown, 
  Mic, 
  ShieldCheck, 
  Sparkles,
  Sun, 
  Moon, 
  Menu, 
  X,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NubianFitLogo } from '../common/NubianFitLogo';

interface LandingHeaderProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onStartOnboarding,
  onOpenPartner
}) => {
  const { setCurrentPortal, theme, toggleTheme } = useApp();
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 lg:px-12 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Wordmark */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#C85A32] text-[#FFFFFF] flex items-center justify-center p-1 shadow-md shadow-[#C85A32]/20 group-hover:bg-[#D46238] transition-colors">
            <NubianFitLogo className="w-full h-full text-[#FFFFFF]" />
          </div>
          <div>
            <div className="text-sm sm:text-base lg:text-lg font-serif font-black tracking-tight text-slate-100 leading-none">
              global <span className="text-[#C85A32]">Orators</span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 tracking-widest font-mono uppercase mt-0.5 whitespace-nowrap">
              speak with impact
            </div>
          </div>
        </div>

        {/* Desktop Standard Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs text-slate-400 font-medium tracking-wide">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="hover:text-slate-100 transition-colors cursor-pointer"
          >
            Home
          </button>
          <a href="#mission" className="hover:text-slate-100 transition-colors">About</a>
          <a href="#academy" className="hover:text-slate-100 transition-colors">Academy</a>
          <a href="#foundation" className="hover:text-slate-100 transition-colors">Foundation</a>
          <a href="#escapism" className="hover:text-slate-100 transition-colors">Escapism</a>
          <a href="#championships" className="hover:text-slate-100 transition-colors">Tournaments</a>
          <a href="#testimonials" className="hover:text-slate-100 transition-colors">Testimonials</a>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            id="landing-theme-toggle"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C85A32] focus-visible:outline-hidden"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          {/* User-Facing Portals Dropdown (Replaces developer jargon) */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C85A32] focus-visible:outline-hidden"
              aria-expanded={portalsDropdownOpen}
              aria-controls="portals-menu"
            >
              <span>Portals</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${portalsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {portalsDropdownOpen && (
              <div 
                id="portals-menu"
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-fadeIn text-left"
                onMouseLeave={() => setPortalsDropdownOpen(false)}
              >
                <div className="text-[9px] uppercase font-mono tracking-widest text-slate-400 px-3 py-1 border-b border-slate-800 mb-1">
                  Access Platform
                </div>
                <button
                  onClick={() => {
                    setPortalsDropdownOpen(false);
                    setCurrentPortal('speaker_app');
                  }}
                  className="w-full px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2.5 text-xs text-slate-200 transition-colors cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5 text-emerald-500" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-100">For Speakers</div>
                    <div className="text-[10px] text-slate-400 font-mono">Speech drills & catharsis vault</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setPortalsDropdownOpen(false);
                    setCurrentPortal('coach_os');
                  }}
                  className="w-full px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2.5 text-xs text-slate-200 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-100">For Coaches</div>
                    <div className="text-[10px] text-slate-400 font-mono">Curriculums & speaker reviews</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setPortalsDropdownOpen(false);
                    onOpenPartner('Academy');
                  }}
                  className="w-full px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2.5 text-xs text-slate-200 transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-100">For Institutions</div>
                    <div className="text-[10px] text-slate-400 font-mono">School & charity partnerships</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Button (Desktop/Tablet) */}
          <button
            onClick={() => onStartOnboarding()}
            className="hidden sm:flex px-3.5 sm:px-4 py-1.5 rounded-lg bg-[#C85A32] hover:bg-[#D46238] text-[#FFFFFF] font-serif font-bold text-xs shadow-md shadow-[#C85A32]/20 items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C85A32] focus-visible:outline-hidden"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            id="mobile-toc-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C85A32] focus-visible:outline-hidden"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            title="Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Standard Navigation Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden mt-3 pt-3 border-t border-slate-800 bg-slate-950 text-left animate-fadeIn">
          <div className="flex flex-col gap-0.5 text-sm font-medium">
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900 hover:text-[#C85A32] font-semibold text-left transition-colors cursor-pointer"
            >
              Home
            </button>
            <a 
              href="#mission" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900 hover:text-[#C85A32] font-semibold transition-colors"
            >
              About
            </a>
            <a 
              href="#academy" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900 hover:text-[#C85A32] font-semibold transition-colors"
            >
              Academy
            </a>
            <a 
              href="#foundation" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900 hover:text-[#C85A32] font-semibold transition-colors"
            >
              Foundation
            </a>
            <a 
              href="#escapism" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900 hover:text-[#C85A32] font-semibold transition-colors"
            >
              Escapism
            </a>
            <a 
              href="#championships" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900 hover:text-[#C85A32] font-semibold transition-colors"
            >
              Tournaments
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900 hover:text-[#C85A32] font-semibold transition-colors"
            >
              Testimonials
            </a>
          </div>

          {/* Mobile Actions: Apply CTA + Portals */}
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onStartOnboarding();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#C85A32] hover:bg-[#D46238] text-[#FFFFFF] font-serif font-bold text-xs shadow-md shadow-[#C85A32]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Apply to Global Orators</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentPortal('speaker_app');
                }}
                className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-500" />
                <span>Speaker App</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentPortal('coach_os');
                }}
                className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Coach OS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
