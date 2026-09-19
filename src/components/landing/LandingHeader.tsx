import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronDown, 
  Mic, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Building2,
  LogIn
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlobalOratorsLogo } from '../common/GlobalOratorsLogo';
import { SpeakerLoginModal } from './SpeakerLoginModal';

interface LandingHeaderProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onStartOnboarding,
  onOpenPartner
}) => {
  const { setCurrentPortal, theme, toggleTheme, currentPath, navigate } = useApp();
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [speakerLoginOpen, setSpeakerLoginOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 lg:px-12 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Wordmark */}
        <div 
          onClick={() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
        >
          <GlobalOratorsLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 transition-transform group-hover:scale-105" colorMode="gold" />
          <div>
            <div className="text-sm sm:text-base lg:text-lg font-serif font-black tracking-tight text-slate-100 leading-none">
              Global <span className="text-[#A06C18] dark:text-[#E3B95C]">Orators</span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 tracking-widest font-mono uppercase mt-0.5 whitespace-nowrap">
              speak with impact
            </div>
          </div>
        </div>

        {/* Desktop Standard Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-serif tracking-wide">
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            className={`transition-colors cursor-pointer ${currentPath === '/' ? 'text-slate-100 font-bold border-b-2 border-[#C89630] pb-0.5' : 'text-slate-400 hover:text-slate-100'}`}
          >
            Home
          </a>
          <a 
            href="/about" 
            onClick={(e) => { e.preventDefault(); navigate('/about'); }}
            className={`transition-colors cursor-pointer ${currentPath === '/about' ? 'text-slate-100 font-bold border-b-2 border-[#C89630] pb-0.5' : 'text-slate-400 hover:text-slate-100'}`}
          >
            About
          </a>
          <a 
            href="/academy" 
            onClick={(e) => { e.preventDefault(); navigate('/academy'); }}
            className={`transition-colors cursor-pointer ${currentPath === '/academy' ? 'text-slate-100 font-bold border-b-2 border-[#C89630] pb-0.5' : 'text-slate-400 hover:text-slate-100'}`}
          >
            Academy
          </a>
          <a 
            href="/foundation" 
            onClick={(e) => { e.preventDefault(); navigate('/foundation'); }}
            className={`transition-colors cursor-pointer ${currentPath === '/foundation' ? 'text-slate-100 font-bold border-b-2 border-[#C89630] pb-0.5' : 'text-slate-400 hover:text-slate-100'}`}
          >
            Foundation
          </a>
          <a 
            href="/escapism" 
            onClick={(e) => { e.preventDefault(); navigate('/escapism'); }}
            className={`transition-colors cursor-pointer ${currentPath === '/escapism' ? 'text-slate-100 font-bold border-b-2 border-[#C89630] pb-0.5' : 'text-slate-400 hover:text-slate-100'}`}
          >
            Escapism
          </a>
          <a 
            href="/tournaments" 
            onClick={(e) => { e.preventDefault(); navigate('/tournaments'); }}
            className={`transition-colors cursor-pointer ${currentPath === '/tournaments' ? 'text-slate-100 font-bold border-b-2 border-[#C89630] pb-0.5' : 'text-slate-400 hover:text-slate-100'}`}
          >
            Tournaments
          </a>
          <a 
            href="/testimonials" 
            onClick={(e) => { e.preventDefault(); navigate('/testimonials'); }}
            className={`transition-colors cursor-pointer ${currentPath === '/testimonials' ? 'text-slate-100 font-bold border-b-2 border-[#C89630] pb-0.5' : 'text-slate-400 hover:text-slate-100'}`}
          >
            Testimonials
          </a>
          <a 
            href="/contact" 
            onClick={(e) => { e.preventDefault(); navigate('/contact'); }}
            className={`transition-colors cursor-pointer ${currentPath === '/contact' ? 'text-slate-100 font-bold border-b-2 border-[#C89630] pb-0.5' : 'text-slate-400 hover:text-slate-100'}`}
          >
            Contact
          </a>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            id="landing-theme-toggle"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          {/* User-Facing Portals Dropdown (Replaces developer jargon) */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
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
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C89630]" />
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

                <button
                  onClick={() => {
                    setPortalsDropdownOpen(false);
                    setSpeakerLoginOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2.5 text-xs text-slate-200 transition-colors cursor-pointer border-t border-slate-800 mt-1 pt-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#C89630]" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-100">Sign In to Profile</div>
                    <div className="text-[10px] text-slate-400 font-mono">Existing speaker re-entry</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Speaker Sign In Button (Desktop) */}
          <button
            onClick={() => setSpeakerLoginOpen(true)}
            className="hidden sm:flex px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-white font-serif text-xs items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
          >
            <LogIn className="w-3.5 h-3.5 text-[#C89630]" />
            <span>Sign In</span>
          </button>

          {/* Primary Action Button (Desktop/Tablet) */}
          <button
            onClick={() => onStartOnboarding()}
            className="hidden sm:flex px-3.5 sm:px-4 py-1.5 rounded-lg bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-xs shadow-md shadow-[#C89630]/20 items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            id="mobile-toc-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
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
            <a 
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-2 rounded-lg font-semibold text-left transition-colors cursor-pointer ${currentPath === '/' ? 'text-[#C89630] bg-slate-900/70' : 'text-slate-200 hover:bg-slate-900 hover:text-[#C89630]'}`}
            >
              Home
            </a>
            <a 
              href="/about" 
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                navigate('/about');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors ${currentPath === '/about' ? 'text-[#C89630] bg-slate-900/70' : 'text-slate-200 hover:bg-slate-900 hover:text-[#C89630]'}`}
            >
              About
            </a>
            <a 
              href="/academy" 
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                navigate('/academy');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors ${currentPath === '/academy' ? 'text-[#C89630] bg-slate-900/70' : 'text-slate-200 hover:bg-slate-900 hover:text-[#C89630]'}`}
            >
              Academy
            </a>
            <a 
              href="/foundation" 
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                navigate('/foundation');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors ${currentPath === '/foundation' ? 'text-[#C89630] bg-slate-900/70' : 'text-slate-200 hover:bg-slate-900 hover:text-[#C89630]'}`}
            >
              Foundation
            </a>
            <a 
              href="/escapism" 
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                navigate('/escapism');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors ${currentPath === '/escapism' ? 'text-[#C89630] bg-slate-900/70' : 'text-slate-200 hover:bg-slate-900 hover:text-[#C89630]'}`}
            >
              Escapism
            </a>
            <a 
              href="/tournaments" 
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                navigate('/tournaments');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors ${currentPath === '/tournaments' ? 'text-[#C89630] bg-slate-900/70' : 'text-slate-200 hover:bg-slate-900 hover:text-[#C89630]'}`}
            >
              Tournaments
            </a>
            <a 
              href="/testimonials" 
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                navigate('/testimonials');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors ${currentPath === '/testimonials' ? 'text-[#C89630] bg-slate-900/70' : 'text-slate-200 hover:bg-slate-900 hover:text-[#C89630]'}`}
            >
              Testimonials
            </a>
            <a 
              href="/contact" 
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                navigate('/contact');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors ${currentPath === '/contact' ? 'text-[#C89630] bg-slate-900/70' : 'text-slate-200 hover:bg-slate-900 hover:text-[#C89630]'}`}
            >
              Contact
            </a>
          </div>

          {/* Mobile Actions: Apply CTA + Portals */}
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onStartOnboarding();
                }}
                className="py-2.5 px-3 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-xs shadow-md shadow-[#C89630]/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSpeakerLoginOpen(true);
                }}
                className="py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-200 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 text-[#C89630]" />
                <span>Sign In</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentPortal('speaker_app');
                }}
                className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-500" />
                <span>Orators App</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentPortal('coach_os');
                }}
                className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C89630]" />
                <span>Coach App</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Speaker Re-Entry Login Modal */}
      <SpeakerLoginModal
        isOpen={speakerLoginOpen}
        onClose={() => setSpeakerLoginOpen(false)}
        onStartOnboarding={() => {
          setSpeakerLoginOpen(false);
          onStartOnboarding();
        }}
      />
    </header>
  );
};
