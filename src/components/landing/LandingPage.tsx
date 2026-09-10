import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronDown, 
  Mic, 
  ShieldCheck, 
  Trophy, 
  Heart, 
  GraduationCap, 
  Check, 
  ExternalLink,
  BookOpen,
  Sparkles,
  Quote,
  Globe,
  Building2,
  Users,
  Sun,
  Moon,
  Menu,
  X,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NubianFitLogo } from '../common/NubianFitLogo';

export const LandingPage: React.FC = () => {
  const { setCurrentPortal, showToast, theme, toggleTheme } = useApp();
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerBranch, setPartnerBranch] = useState<'Academy' | 'Foundation'>('Academy');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlayingDispatch, setIsPlayingDispatch] = useState(false);

  const handleStartOnboarding = (branch?: 'Academy' | 'Foundation') => {
    if (branch) {
      localStorage.setItem('globalorators_selected_branch', branch);
    }
    setCurrentPortal('onboarding');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#C85A32] selection:text-white transition-colors duration-200">
      {/* 1. Unified Editorial Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 lg:px-12 py-3.5 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Wordmark */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#C85A32] text-[#FFFFFF] flex items-center justify-center p-1 shadow-md shadow-[#C85A32]/20 group-hover:bg-[#D46238] transition-colors">
              <NubianFitLogo className="w-full h-full text-[#FFFFFF]" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-serif font-black tracking-tight text-slate-100 leading-none">
                global <span className="text-[#C85A32]">Orators</span>
              </div>
              <div className="text-[10px] text-slate-400 tracking-widest font-mono uppercase mt-1">
                speak with impact
              </div>
            </div>
          </div>

          {/* Standard Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs text-slate-400 font-medium tracking-wide">
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
            {/* Theme Toggle (Light/Dark Mode matching Coach Portal) */}
            <button
              id="landing-theme-toggle"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>

            {/* Portals Dropdown (visible on sm+ screens) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Portals</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${portalsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {portalsDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-fadeIn text-left"
                  onMouseLeave={() => setPortalsDropdownOpen(false)}
                >
                  <div className="text-[9px] uppercase font-mono tracking-widest text-slate-400 px-3 py-1 border-b border-slate-800 mb-1">
                    Environment Routing
                  </div>
                  <button
                    onClick={() => {
                      setPortalsDropdownOpen(false);
                      setCurrentPortal('speaker_app');
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2.5 text-xs text-slate-200 transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5 text-emerald-500" />
                    <div className="text-left">
                      <div className="font-semibold text-slate-100">Speaker Portal</div>
                      <div className="text-[10px] text-slate-400 font-mono">app.globalorators.com</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPortalsDropdownOpen(false);
                      setCurrentPortal('coach_os');
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2.5 text-xs text-slate-200 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
                    <div className="text-left">
                      <div className="font-semibold text-slate-100">Coach OS</div>
                      <div className="text-[10px] text-slate-400 font-mono">coach.globalorators.com</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPortalsDropdownOpen(false);
                      handleStartOnboarding();
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2.5 text-xs text-slate-200 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <div className="text-left">
                      <div className="font-semibold text-slate-100">Speaker Onboarding</div>
                      <div className="text-[10px] text-slate-400 font-mono">onboard.globalorators.com</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Primary Get Started Button (hidden on narrow screens to prevent clutter, accessible in mobile menu) */}
            <button
              onClick={() => handleStartOnboarding()}
              className="hidden sm:flex px-3.5 sm:px-4 py-1.5 rounded-lg bg-[#C85A32] hover:bg-[#D46238] text-[#FFFFFF] font-serif font-bold text-xs shadow-md shadow-[#C85A32]/20 items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
            >
              <span>Take the Floor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              id="mobile-toc-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              title="Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Standard Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 bg-slate-950 text-left animate-fadeIn">
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

            {/* Mobile Actions: Take the Floor CTA + Portals */}
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleStartOnboarding();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#C85A32] hover:bg-[#D46238] text-[#FFFFFF] font-serif font-bold text-xs shadow-md shadow-[#C85A32]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Take the Floor</span>
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

      {/* 2. Hero Section: Editorial & Warm Humanist */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Hero Narrative */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-slate-100 leading-[1.08]">
                Words Shape Nations.<br />
                <span className="italic font-serif font-normal text-[#C85A32]">
                  Silence Breaks Them.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-xl">
                For generations, the intellectual potential of African youth has been constrained by colonial social conditioning, western dependency, and a cultural taboo against emotional vulnerability.
              </p>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                The <strong className="text-slate-100 font-semibold">Global Orators Project (GOP)</strong> cultivates minds capable of sovereign critical thought and champion debate—while establishing <strong className="text-slate-100 font-semibold">Speaking as a Form of Escapism</strong> to heal trauma, break patriarchal silence, and champion honest emotional truth.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => handleStartOnboarding('Academy')}
                  className="px-6 py-3.5 rounded-xl bg-[#C85A32] text-[#FFFFFF] font-serif font-bold text-sm hover:bg-[#D46238] shadow-lg shadow-[#C85A32]/20 flex items-center justify-center gap-2 transition-all"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>The Academy Track</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleStartOnboarding('Foundation')}
                  className="px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-100 font-serif font-bold text-sm flex items-center justify-center gap-2 transition-all hover:border-[#C85A32]/50"
                >
                  <Heart className="w-4 h-4 text-[#C85A32]" />
                  <span>The Foundation Fellowship</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C85A32]/15 text-[#C85A32] border border-[#C85A32]/30">
                    Grant Funded
                  </span>
                </button>
              </div>
            </div>

            {/* Right Hero Documentary Photography Frame */}
            <div className="lg:col-span-5">
              <figure className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 flex flex-col">
                <img 
                  src="/images/hero-orator.jpg" 
                  alt="Young African orator speaking passionately at a wooden podium" 
                  className="w-full h-80 sm:h-[420px] object-cover object-top filter contrast-[1.05]"
                  loading="eager"
                />
                <figcaption className="p-3.5 sm:p-4 bg-slate-900 border-t border-slate-800 text-left">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#C85A32] font-semibold">
                    <span>Field Dispatch • Assembly Floor</span>
                    <span className="text-slate-400">Nairobi, Kenya</span>
                  </div>
                  <div className="text-xs text-slate-300 font-serif italic mt-1 leading-snug">
                    "When youth speak with radical honesty, the future of the continent is rewritten."
                  </div>
                </figcaption>
              </figure>
            </div>
          </div>

          {/* 2-Column Responsive Stats Grid on Mobile (Compliant with Design Guidelines) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 pt-8 border-t border-slate-800">
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 text-left shadow-xs">
              <div className="text-2xl sm:text-3xl font-serif font-black text-slate-100">1,450+</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Youth Enlightened</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 text-left shadow-xs">
              <div className="text-2xl sm:text-3xl font-serif font-black text-[#C85A32]">48</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Charity & School Partners</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 text-left shadow-xs">
              <div className="text-2xl sm:text-3xl font-serif font-black text-slate-100">16</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Global Debate Squads</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 text-left shadow-xs">
              <div className="text-2xl sm:text-3xl font-serif font-black text-emerald-500">96%</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Catharsis Breakthrough</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Core Manifesto: Diagnosing African Society */}
      <section id="mission" className="py-16 sm:py-24 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="text-left space-y-4 mb-14">
          <div className="text-[11px] font-mono tracking-widest text-[#C85A32] uppercase font-bold">
            Chapter I • The Diagnosis & The Remedy
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-slate-100 tracking-tight max-w-2xl">
            What is the Root Crisis Facing African Society?
          </h2>
          <div className="w-16 h-0.5 bg-[#C85A32]" />
        </div>

        {/* Editorial 2-Column Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-left">
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#C85A32] font-bold">
              The First Pillar • Deconditioning & Pan-African Enlightenment
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
              Cognitive Sovereignty & Deconditioning
            </h3>
            <p className="font-serif text-base text-slate-100 italic">
              "A lack of information stemming from colonial social conditioning has conditioned the mentalities of our populace—creating social mediocrity that still struggles with ethnic division, western dependency, and self-doubt."
            </p>
            <p>
              When a generation is deprived of cognitive familiarity with the economic, political, and historical mechanisms governing their lives, leadership default becomes imitation. We settle for the status quo and wait for external validation.
            </p>
            <p>
              The primary mission of Global Orators is to dismantle this intellectual inertia. We teach young Africans to deconstruct policy, debate foundational constitutional and economic dilemmas, and manifest self-development through uncompromising action.
            </p>
          </div>

          {/* Pillar 2: Speaking as Escapism & Catharsis */}
          <div id="escapism" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#C85A32] font-bold">
                The Second Pillar • Mental Health & Voice
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                Speaking as a Form of Escapism & Catharsis
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Growing up under millennial parentage and decades of patriarchal conditioning, emotional vulnerability has been branded as weakness. African boys were told never to cry; African girls were instructed to swallow their pain.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                The result has been a silent epidemic of anxiety and untreated trauma. There is a raw, physical catharsis that occurs when an individual stands up and speaks aloud the exact burden they carried in secrecy. When you hear a story that matches your own, the isolation shatters.
              </p>

              {/* Interactive Voice Dispatch Player */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#C85A32] uppercase tracking-widest font-semibold flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-[#C85A32]" />
                    Voice Dispatch • Circle 07 (Nairobi)
                  </span>
                  <span className="text-slate-400">{isPlayingDispatch ? '0:24 / 1:18' : '1:18'}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlayingDispatch(!isPlayingDispatch)}
                    className="w-10 h-10 rounded-full bg-[#C85A32] hover:bg-[#D46238] text-[#FFFFFF] flex items-center justify-center shrink-0 shadow-md shadow-[#C85A32]/25 transition-all cursor-pointer"
                    aria-label={isPlayingDispatch ? 'Pause voice dispatch' : 'Play voice dispatch'}
                  >
                    {isPlayingDispatch ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  {/* Simulated Acoustic Waveform Bars */}
                  <div className="flex-1 flex items-center gap-1 h-8 overflow-hidden px-1">
                    {[35, 60, 25, 80, 95, 50, 75, 45, 90, 60, 30, 85, 100, 70, 45, 80, 65, 40, 75, 85, 60, 40, 80, 50, 30, 70, 85, 45].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          isPlayingDispatch
                            ? 'bg-[#C85A32] opacity-90'
                            : 'bg-slate-700 opacity-50'
                        }`}
                        style={{
                          height: isPlayingDispatch 
                            ? `${Math.max(20, (h + (i % 3) * 20) % 100)}%` 
                            : `${Math.max(15, h * 0.35)}%`
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 font-serif italic border-t border-slate-800/80 pt-2 leading-relaxed">
                  "{isPlayingDispatch ? 'Now Playing: ' : ''}For six years I believed silence was safety. The day I spoke my truth in the circle, the fear left my body."
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  Recorded at Hope Children's Home Healing Circle • Voice used with informed consent
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs font-serif italic text-[#C85A32]">
              <Quote className="w-4 h-4 shrink-0" />
              <span>"To speak your truth is not a performance—it is your liberation."</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Two Functional Branches: Academy vs Foundation */}
      <section id="branches" className="py-16 sm:py-24 px-4 sm:px-8 bg-slate-950 border-y border-slate-800">
        <div className="max-w-6xl mx-auto text-left">
          <div className="mb-14">
            <div className="text-[11px] font-mono tracking-widest text-[#C85A32] uppercase font-bold">
              Chapter II • The Structure
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-slate-100 tracking-tight mt-1">
              Two Functional Branches. One Sovereign Vision.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl">
              An ecosystem balancing world-class professional oratory with radical philanthropic accessibility.
            </p>
          </div>

          {/* 2-Column Responsive Card Grid (Scaled proportionally for mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Branch 1: Global Orators Academy */}
            <div id="academy" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-lg">
              <div>
                <figure className="rounded-xl overflow-hidden mb-6 border border-slate-800 bg-slate-950/40">
                  <img 
                    src="/images/academy-debate.jpg" 
                    alt="Young African debaters at parliamentary debate table" 
                    className="w-full h-48 sm:h-56 object-cover"
                    loading="lazy"
                  />
                  <figcaption className="px-3.5 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-300 uppercase tracking-wider font-semibold">Championship Debate Chamber</span>
                    <span className="text-[#C85A32] uppercase tracking-widest">Competitive Wing</span>
                  </figcaption>
                </figure>

                <div className="text-[10px] font-mono tracking-widest uppercase text-[#C85A32] font-bold">
                  Professional Fee & Corporate Partnerships
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-100 mt-1 mb-3">
                  Global Orators Academy
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  Accessing and training young individuals from early learning institutions through tertiary universities. We build disciplined debaters, public keynote speakers, and corporate executives capable of holding ground on the global stage.
                </p>

                {/* 2-Column Mobile Grid for Features */}
                <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs text-slate-200">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-slate-100">Parliamentary Debate</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">BP, Worlds & Karl Popper mastery</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-slate-100">Tournament Squads</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Fielding national & global delegations</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-slate-100">Executive Pitching</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Boardroom & venture negotiation</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-slate-100">Institutional Syllabi</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Accredited school curriculums</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => handleStartOnboarding('Academy')}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#C85A32] text-[#FFFFFF] font-serif font-bold text-xs hover:bg-[#D46238] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Enroll in Academy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setPartnerBranch('Academy');
                    setPartnerModalOpen(true);
                  }}
                  className="py-2.5 px-4 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
                >
                  School / Corporate Partnership
                </button>
              </div>
            </div>

            {/* Branch 2: Global Orators Foundation */}
            <div id="foundation" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-lg">
              <div>
                <figure className="rounded-xl overflow-hidden mb-6 border border-slate-800 bg-slate-950/40">
                  <img 
                    src="/images/foundation-circle.jpg" 
                    alt="African youth and children sitting in a warm library healing circle" 
                    className="w-full h-48 sm:h-56 object-cover"
                    loading="lazy"
                  />
                  <figcaption className="px-3.5 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-300 uppercase tracking-wider font-semibold">Community Healing Circle</span>
                    <span className="text-emerald-500 uppercase tracking-widest">Grant Fellowship</span>
                  </figcaption>
                </figure>

                <div className="text-[10px] font-mono tracking-widest uppercase text-emerald-500 font-bold">
                  Grant-Funded & Community Supported
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-100 mt-1 mb-3">
                  Global Orators Foundation
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  Access to enlightenment and public speech has become elitist. We partner with children's homes, charities, and shelters to work with youth who have survived abusive homes and systemic oppression—helping them voice what they endured and advocate against it happening to others.
                </p>

                {/* 2-Column Mobile Grid for Features */}
                <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs text-slate-200">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-slate-100">Children's Homes</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">On-site therapeutic speech circles</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-slate-100">Trauma-to-Advocacy</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Giving survivors sovereign authority</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-slate-100">Anti-Abuse Campaign</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Youth-led community storytelling</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-slate-100">100% Fellowships</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Zero-cost training, travel & mentorship</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => handleStartOnboarding('Foundation')}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#2E684D] hover:bg-[#387D5D] text-[#FFFFFF] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Apply for Foundation Fellowship</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setPartnerBranch('Foundation');
                    setPartnerModalOpen(true);
                  }}
                  className="py-2.5 px-4 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
                >
                  Grant / Charity Partnership
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Tournament & Conventions Track Record */}
      <section id="championships" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-[#C85A32] uppercase font-bold">
              Chapter III • The Global Arena
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight mt-1">
              Fielding Champions On Continental & World Stages
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm mt-3 md:mt-0 font-normal">
            We prove the progress and rigor of our movement by fielding African teams at premier debate conventions across the globe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xs">
            <div className="text-[10px] font-mono text-[#C85A32] uppercase font-bold tracking-wider">
              WUDC 2026 • Grand Finalists
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-100">World Universities Debating Championship</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Competing in British Parliamentary format against 300+ universities worldwide. Defending motions on continental resource sovereignty and post-colonial trade reform.
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              8 Speakers Fielded • 2 Grand Finalist Awards
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xs">
            <div className="text-[10px] font-mono text-emerald-500 uppercase font-bold tracking-wider">
              PAUDC 2026 • Overall Champions
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-100">Pan-African Universities Debating Championship</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Leading the debate on African developmental sovereignty, intra-continental migration, and educational independence across 40 African nations.
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              14 Speakers Fielded • 1st Place Team Trophy
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xs">
            <div className="text-[10px] font-mono text-[#C85A32] uppercase font-bold tracking-wider">
              WorldMUN 2026 • Best Delegation
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-100">Harvard World Model United Nations</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Defending African strategic interests in multilateral treaty negotiations, international humanitarian law, and sovereign debt restructuring.
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              6 Delegates Fielded • 4 Diplomacy Gavels
            </div>
          </div>
        </div>

        {/* Debated Motions: Real British Parliamentary Clashes */}
        <div className="mt-12 pt-10 border-t border-slate-800 text-left">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#C85A32] uppercase font-bold">
                The Motions • Real British Parliamentary Clashes
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-slate-100 tracking-tight mt-1">
                Sovereignty Defended On The Floor
              </h3>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1 sm:mt-0">
              15-minute prep • No internet • Pure cognitive sovereignty
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#C85A32] font-semibold">PAUDC Grand Finals</span>
                <span className="text-slate-400">Addis Ababa</span>
              </div>
              <p className="text-xs font-serif font-bold text-slate-100 leading-snug">
                "This House Would Condition All Foreign Mineral Concessions on 100% Domestic In-Country Refining & Value-Addition."
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-500 font-semibold flex items-center justify-between">
                <span>Opening Government</span>
                <span>Unanimous Champions</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#C85A32] font-semibold">WUDC Semi-Finals</span>
                <span className="text-slate-400">Belgrade</span>
              </div>
              <p className="text-xs font-serif font-bold text-slate-100 leading-snug">
                "This House Believes That Post-Colonial States Should Form a Sovereign Cartel to Repudiate Odious Historical Debts."
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-500 font-semibold flex items-center justify-between">
                <span>Closing Opposition</span>
                <span>Grand Finalist Award</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#C85A32] font-semibold">Pan-African Youth Assembly</span>
                <span className="text-slate-400">Nairobi</span>
              </div>
              <p className="text-xs font-serif font-bold text-slate-100 leading-snug">
                "This House Would Abolish Institutional Language and Dress Codes That Subordinate Indigenous Expression to Colonial Norms."
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-500 font-semibold flex items-center justify-between">
                <span>Opening Opposition</span>
                <span>Highest Speaker Score</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Human Catharsis Testimonials */}
      <section id="testimonials" className="py-16 sm:py-24 px-4 sm:px-8 bg-slate-950 border-t border-slate-800 text-left">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <div className="text-[11px] font-mono tracking-widest text-[#C85A32] uppercase font-bold">
              Chapter IV • Living Proof
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight mt-1">
              "The Day I Spoke, The Heaviness Lifted."
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed font-serif">
                "Growing up in an abusive home, silence was my survival mechanism. I carried guilt that wasn't mine for fifteen years. Global Orators Foundation gave me the first safe room in my life to speak without fear. The moment I said it aloud, it lost its grip over me. Today, I coach younger kids in the children's home on how to tell their stories."
              </p>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-serif font-bold text-slate-100">Nia Muthoni</div>
                  <div className="text-[10px] text-slate-400">Foundation Fellow • Age 19 • Anti-Abuse Youth Advocate</div>
                </div>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C85A32]/10 text-[#C85A32]">
                  Foundation Track
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed font-serif">
                "As an African young man, men in my family taught me that crying or speaking about mental anxiety was weakness. I developed severe panic attacks before any speech. Learning that speaking is catharsis—and that emotional vulnerability requires ten times more bravery than suppression—saved my mental health and my university career."
              </p>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-serif font-bold text-slate-100">Tariq Bakari</div>
                  <div className="text-[10px] text-slate-400">Academy Scholar • Age 22 • Pan-African Debate Finalist</div>
                </div>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                  Academy Track
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Institutional Partnership & Grant Funding CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-slate-100 tracking-tight">
            Stand With the Movement.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto font-normal">
            Whether you are a student ready to master parliamentary debate, a children's home seeking healing circles, or a philanthropic foundation funding fellowships: your voice matters here.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleStartOnboarding()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#C85A32] hover:bg-[#D46238] text-[#FFFFFF] font-serif font-bold text-xs shadow-xl shadow-[#C85A32]/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>Take the Floor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setPartnerBranch('Foundation');
                setPartnerModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-100 font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>Partner With Us / Grants</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. Editorial Footer with Full Domain Index */}
      <footer className="bg-slate-950 border-t border-slate-800 py-14 px-4 sm:px-8 text-xs text-slate-400 text-left">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#C85A32] text-white flex items-center justify-center p-0.5">
                  <NubianFitLogo className="w-full h-full text-white" />
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
                  Environments
                </div>
                <ul className="space-y-2 text-[11px] text-slate-400">
                  <li>
                    <button onClick={() => setCurrentPortal('landing')} className="hover:text-slate-100 transition-colors">
                      globalorators.com (Main)
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentPortal('speaker_app')} className="hover:text-slate-100 transition-colors">
                      app.globalorators.com (Speaker)
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentPortal('coach_os')} className="hover:text-slate-100 transition-colors">
                      coach.globalorators.com (Coach)
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleStartOnboarding()} className="hover:text-slate-100 transition-colors">
                      onboard.globalorators.com
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
                    <button onClick={() => { setPartnerBranch('Foundation'); setPartnerModalOpen(true); }} className="hover:text-slate-100 transition-colors">
                      Grant Inquiries
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setPartnerBranch('Academy'); setPartnerModalOpen(true); }} className="hover:text-slate-100 transition-colors">
                      School Partnerships
                    </button>
                  </li>
                  <li>
                    <button onClick={() => showToast('Direct inquiries: director@globalorators.org')} className="hover:text-slate-100 transition-colors">
                      Contact Governance
                    </button>
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

      {/* Institutional / Grant Partnership Modal */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-serif font-bold text-slate-100">
                Partner with Global Orators {partnerBranch}
              </h3>
              <button
                onClick={() => setPartnerModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-normal">
              {partnerBranch === 'Academy'
                ? 'Equip your university, school, or corporate leadership council with premier debate training, keynote coaching, and accredited speech syllabi.'
                : 'Connect your children\'s home, orphanage, or charitable shelter with our grant-funded cathartic voice circles, or contribute directly to our non-profit fellowship grant pool.'}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPartnerModalOpen(false);
                showToast(`Thank you! Our ${partnerBranch} director will connect with you within 24 hours.`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1">
                  Organization / Institution Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Alliance High School or Hope Children's Home"
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-[#C85A32] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1">
                  Contact Email
                </label>
                <input
                  required
                  type="email"
                  placeholder="director@organization.org"
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-[#C85A32] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1">
                  Collaboration Focus
                </label>
                <select className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-[#C85A32] focus:outline-hidden">
                  <option>Institutional Speech Training & Tournament Sponsorship</option>
                  <option>Charity / Children's Home Voice Healing Circles</option>
                  <option>Philanthropic Grant or Foundation Donation</option>
                  <option>Corporate Executive Oratory Masterclass</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPartnerModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#C85A32] text-[#FFFFFF] text-xs font-serif font-bold hover:bg-[#D46238]"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
