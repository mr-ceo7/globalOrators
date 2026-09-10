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
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NubianFitLogo } from '../common/NubianFitLogo';

export const LandingPage: React.FC = () => {
  const { setCurrentPortal, showToast } = useApp();
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerBranch, setPartnerBranch] = useState<'Academy' | 'Foundation'>('Academy');

  const handleStartOnboarding = (branch?: 'Academy' | 'Foundation') => {
    if (branch) {
      localStorage.setItem('globalorators_selected_branch', branch);
    }
    setCurrentPortal('onboarding');
  };

  return (
    <div className="min-h-screen bg-[#0F0C0A] text-[#F4EDE2] font-sans selection:bg-[#C85A32] selection:text-white">
      {/* 1. Unified Editorial Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#0F0C0A]/90 backdrop-blur-xl border-b border-[#2A221E] px-4 sm:px-8 lg:px-12 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Wordmark */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#C85A32] text-white flex items-center justify-center p-1 shadow-md shadow-[#C85A32]/20 group-hover:bg-[#D46238] transition-colors">
              <NubianFitLogo className="w-full h-full text-white" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-serif font-black tracking-tight text-[#FBF8F3] leading-none">
                global <span className="text-[#C85A32]">Orators</span>
              </div>
              <div className="text-[10px] text-[#A89887] tracking-widest font-mono uppercase mt-1">
                speak with impact
              </div>
            </div>
          </div>

          {/* Editorial Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs text-[#C4B5A5] font-medium tracking-wide">
            <a href="#mission" className="hover:text-[#FBF8F3] transition-colors">The Manifesto</a>
            <a href="#academy" className="hover:text-[#FBF8F3] transition-colors">The Academy</a>
            <a href="#foundation" className="hover:text-[#FBF8F3] transition-colors">The Foundation</a>
            <a href="#escapism" className="hover:text-[#FBF8F3] transition-colors">Speaking as Escapism</a>
            <a href="#championships" className="hover:text-[#FBF8F3] transition-colors">Championships</a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Portals Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
                className="px-3 py-1.5 rounded-lg border border-[#362C26] bg-[#1A1412] text-[#E8DDD0] hover:text-white hover:border-[#52433B] text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <span>Portals</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#A89887] transition-transform ${portalsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {portalsDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-[#16110F] border border-[#362C26] rounded-xl shadow-2xl p-1.5 z-50 animate-fadeIn text-left"
                  onMouseLeave={() => setPortalsDropdownOpen(false)}
                >
                  <div className="text-[9px] uppercase font-mono tracking-widest text-[#8C7B6B] px-3 py-1 border-b border-[#2A221E] mb-1">
                    Environment Routing
                  </div>
                  <button
                    onClick={() => {
                      setPortalsDropdownOpen(false);
                      setCurrentPortal('speaker_app');
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-[#251D18] flex items-center gap-2.5 text-xs text-[#E8DDD0] transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5 text-[#34D399]" />
                    <div className="text-left">
                      <div className="font-semibold text-white">Speaker Portal</div>
                      <div className="text-[10px] text-[#A89887] font-mono">app.globalorators.com</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPortalsDropdownOpen(false);
                      setCurrentPortal('coach_os');
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-[#251D18] flex items-center gap-2.5 text-xs text-[#E8DDD0] transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
                    <div className="text-left">
                      <div className="font-semibold text-white">Coach OS</div>
                      <div className="text-[10px] text-[#A89887] font-mono">coach.globalorators.com</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPortalsDropdownOpen(false);
                      handleStartOnboarding();
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-[#251D18] flex items-center gap-2.5 text-xs text-[#E8DDD0] transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <div className="text-left">
                      <div className="font-semibold text-white">Speaker Onboarding</div>
                      <div className="text-[10px] text-[#A89887] font-mono">onboard.globalorators.com</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Primary Get Started Button */}
            <button
              onClick={() => handleStartOnboarding()}
              className="px-4 py-1.5 rounded-lg bg-[#C85A32] hover:bg-[#D46238] text-white font-serif font-bold text-xs shadow-md shadow-[#C85A32]/20 flex items-center gap-1.5 transition-all"
            >
              <span>Begin Journey</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Editorial & Warm Humanist */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-8 border-b border-[#2A221E]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Hero Narrative */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#C85A32] uppercase font-bold">
                <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
                <span>The Pan-African Voice & Catharsis Movement</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-[#FBF8F3] leading-[1.08]">
                Words Shape Nations.<br />
                <span className="italic font-serif font-normal text-[#E28359]">
                  Silence Breaks Them.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#D4C4B5] leading-relaxed font-normal max-w-xl">
                For generations, the intellectual potential of African youth has been constrained by colonial social conditioning, western dependency, and a cultural taboo against emotional vulnerability.
              </p>

              <p className="text-xs sm:text-sm text-[#A89887] leading-relaxed max-w-xl">
                The <strong className="text-[#FBF8F3] font-semibold">Global Orators Project (GOP)</strong> cultivates minds capable of sovereign critical thought and champion debate—while pioneering <strong className="text-[#FBF8F3] font-semibold">Speaking as a Form of Escapism</strong> to heal trauma, break patriarchal silence, and champion honest emotional truth.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => handleStartOnboarding('Academy')}
                  className="px-6 py-3.5 rounded-xl bg-[#C85A32] text-white font-serif font-bold text-sm hover:bg-[#D46238] shadow-lg shadow-[#C85A32]/20 flex items-center justify-center gap-2 transition-all"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>The Academy Track</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleStartOnboarding('Foundation')}
                  className="px-6 py-3.5 rounded-xl border border-[#42352E] bg-[#1A1412] hover:bg-[#241C18] text-[#FBF8F3] font-serif font-bold text-sm flex items-center justify-center gap-2 transition-all hover:border-[#C85A32]/50"
                >
                  <Heart className="w-4 h-4 text-[#E28359]" />
                  <span>The Foundation Fellowship</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C85A32]/15 text-[#E28359] border border-[#C85A32]/30">
                    Grant Funded
                  </span>
                </button>
              </div>
            </div>

            {/* Right Hero Documentary Photography */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#3A2E27] shadow-2xl bg-[#1A1412]">
                <img 
                  src="/images/hero-orator.jpg" 
                  alt="Young African orator speaking passionately at a wooden podium" 
                  className="w-full h-80 sm:h-[440px] object-cover object-top filter contrast-[1.05]"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0C0A] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#E28359] font-bold">
                    Documentary Dispatch • Pan-African Youth Assembly
                  </div>
                  <div className="text-xs text-[#F4EDE2] font-serif italic mt-0.5">
                    "When youth speak with radical honesty, the future of the continent is rewritten."
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Responsive Stats Grid on Mobile (Compliant with Design Guidelines) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 pt-8 border-t border-[#2A221E]">
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#16110F] border border-[#2A221E] text-left">
              <div className="text-2xl sm:text-3xl font-serif font-black text-[#FBF8F3]">1,450+</div>
              <div className="text-[11px] text-[#A89887] font-medium mt-0.5">Youth Enlightened</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#16110F] border border-[#2A221E] text-left">
              <div className="text-2xl sm:text-3xl font-serif font-black text-[#C85A32]">48</div>
              <div className="text-[11px] text-[#A89887] font-medium mt-0.5">Charity & School Partners</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#16110F] border border-[#2A221E] text-left">
              <div className="text-2xl sm:text-3xl font-serif font-black text-[#FBF8F3]">16</div>
              <div className="text-[11px] text-[#A89887] font-medium mt-0.5">Global Debate Squads</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#16110F] border border-[#2A221E] text-left">
              <div className="text-2xl sm:text-3xl font-serif font-black text-[#34D399]">96%</div>
              <div className="text-[11px] text-[#A89887] font-medium mt-0.5">Catharsis Breakthrough</div>
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
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#FBF8F3] tracking-tight max-w-2xl">
            What is the Root Crisis Facing African Society?
          </h2>
          <div className="w-16 h-0.5 bg-[#C85A32]" />
        </div>

        {/* Editorial 2-Column Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-left">
          <div className="space-y-4 text-xs sm:text-sm text-[#D4C4B5] leading-relaxed">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#C85A32] font-bold">
              The First Pillar • Deconditioning & Pan-African Enlightenment
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#FBF8F3]">
              Cognitive Sovereignty & Deconditioning
            </h3>
            <p className="font-serif text-base text-[#FBF8F3] italic">
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
          <div id="escapism" className="bg-[#16110F] border border-[#362C26] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#E28359] font-bold">
              The Second Pillar • Mental Health & Voice
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#FBF8F3]">
              Speaking as a Form of Escapism & Catharsis
            </h3>
            <p className="text-xs sm:text-sm text-[#D4C4B5] leading-relaxed">
              Growing up under millennial parentage and decades of patriarchal conditioning, emotional vulnerability has been branded as weakness. African boys were told never to cry; African girls were instructed to swallow their pain.
            </p>
            <p className="text-xs text-[#A89887] leading-relaxed">
              The result has been a silent epidemic of anxiety and untreated trauma. There is a sacred, transformative catharsis that occurs when an individual stands up and speaks aloud the exact burden they carried in secrecy. When you hear a story that matches your own, the isolation shatters.
            </p>
            <div className="pt-2 border-t border-[#2A221E] flex items-center gap-2 text-xs font-serif italic text-[#E28359]">
              <Quote className="w-4 h-4 shrink-0" />
              <span>"To speak your truth is not a performance—it is your liberation."</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Two Functional Branches: Academy vs Foundation */}
      <section id="branches" className="py-16 sm:py-24 px-4 sm:px-8 bg-[#140F0D] border-y border-[#2A221E]">
        <div className="max-w-6xl mx-auto text-left">
          <div className="mb-14">
            <div className="text-[11px] font-mono tracking-widest text-[#C85A32] uppercase font-bold">
              Chapter II • The Structure
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#FBF8F3] tracking-tight mt-1">
              Two Functional Branches. One Sovereign Vision.
            </h2>
            <p className="text-xs sm:text-sm text-[#A89887] mt-2 max-w-xl">
              An ecosystem balancing world-class professional oratory with radical philanthropic accessibility.
            </p>
          </div>

          {/* 2-Column Responsive Card Grid (Scaled proportionally for mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Branch 1: Global Orators Academy */}
            <div id="academy" className="bg-[#1A1412] border border-[#3A2E27] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
              <div>
                <div className="relative rounded-xl overflow-hidden mb-6 border border-[#3A2E27]">
                  <img 
                    src="/images/academy-debate.jpg" 
                    alt="Young African debaters at parliamentary debate table" 
                    className="w-full h-48 sm:h-56 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#0F0C0A]/85 text-xs font-mono text-[#FBF8F3] border border-[#3A2E27]">
                    The Commercial & Championship Arm
                  </div>
                </div>

                <div className="text-[10px] font-mono tracking-widest uppercase text-[#C85A32] font-bold">
                  Professional Fee & Corporate Partnerships
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#FBF8F3] mt-1 mb-3">
                  Global Orators Academy
                </h3>

                <p className="text-xs sm:text-sm text-[#D4C4B5] leading-relaxed mb-6">
                  Accessing and training young individuals from early learning institutions through tertiary universities. We build disciplined debaters, public keynote speakers, and corporate executives capable of holding ground on the global stage.
                </p>

                {/* 2-Column Mobile Grid for Features */}
                <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs text-[#E8DDD0]">
                  <div className="p-2.5 rounded-lg bg-[#0F0C0A] border border-[#2A221E]">
                    <div className="font-bold text-[#FBF8F3]">Parliamentary Debate</div>
                    <div className="text-[10px] text-[#A89887] mt-0.5">BP, Worlds & Karl Popper mastery</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0F0C0A] border border-[#2A221E]">
                    <div className="font-bold text-[#FBF8F3]">Tournament Squads</div>
                    <div className="text-[10px] text-[#A89887] mt-0.5">Fielding national & global delegations</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0F0C0A] border border-[#2A221E]">
                    <div className="font-bold text-[#FBF8F3]">Executive Pitching</div>
                    <div className="text-[10px] text-[#A89887] mt-0.5">Boardroom & venture negotiation</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0F0C0A] border border-[#2A221E]">
                    <div className="font-bold text-[#FBF8F3]">Institutional Syllabi</div>
                    <div className="text-[10px] text-[#A89887] mt-0.5">Accredited school curriculums</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#2A221E] flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => handleStartOnboarding('Academy')}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#C85A32] text-white font-serif font-bold text-xs hover:bg-[#D46238] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Enroll in Academy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setPartnerBranch('Academy');
                    setPartnerModalOpen(true);
                  }}
                  className="py-2.5 px-4 rounded-lg border border-[#3A2E27] bg-[#0F0C0A] text-[#E8DDD0] hover:text-white text-xs font-semibold transition-colors"
                >
                  School / Corporate Partnership
                </button>
              </div>
            </div>

            {/* Branch 2: Global Orators Foundation */}
            <div id="foundation" className="bg-[#1A1412] border border-[#3A2E27] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
              <div>
                <div className="relative rounded-xl overflow-hidden mb-6 border border-[#3A2E27]">
                  <img 
                    src="/images/foundation-circle.jpg" 
                    alt="African youth and children sitting in a warm library healing circle" 
                    className="w-full h-48 sm:h-56 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#0F0C0A]/85 text-xs font-mono text-[#FBF8F3] border border-[#3A2E27]">
                    The Non-Profit Philanthropic Arm
                  </div>
                </div>

                <div className="text-[10px] font-mono tracking-widest uppercase text-[#34D399] font-bold">
                  Grant-Funded & Community Supported
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#FBF8F3] mt-1 mb-3">
                  Global Orators Foundation
                </h3>

                <p className="text-xs sm:text-sm text-[#D4C4B5] leading-relaxed mb-6">
                  Access to enlightenment and public speech has become elitist. We partner with children's homes, charities, and shelters to work with youth who have survived abusive homes and systemic oppression—helping them voice what they endured and advocate against it happening to others.
                </p>

                {/* 2-Column Mobile Grid for Features */}
                <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs text-[#E8DDD0]">
                  <div className="p-2.5 rounded-lg bg-[#0F0C0A] border border-[#2A221E]">
                    <div className="font-bold text-[#FBF8F3]">Children's Homes</div>
                    <div className="text-[10px] text-[#A89887] mt-0.5">On-site therapeutic speech circles</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0F0C0A] border border-[#2A221E]">
                    <div className="font-bold text-[#FBF8F3]">Trauma-to-Advocacy</div>
                    <div className="text-[10px] text-[#A89887] mt-0.5">Giving survivors sovereign authority</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0F0C0A] border border-[#2A221E]">
                    <div className="font-bold text-[#FBF8F3]">Anti-Abuse Campaign</div>
                    <div className="text-[10px] text-[#A89887] mt-0.5">Youth-led community storytelling</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0F0C0A] border border-[#2A221E]">
                    <div className="font-bold text-[#FBF8F3]">100% Fellowships</div>
                    <div className="text-[10px] text-[#A89887] mt-0.5">Zero-cost training, travel & mentorship</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#2A221E] flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => handleStartOnboarding('Foundation')}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#2E684D] hover:bg-[#387D5D] text-white font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Apply for Foundation Fellowship</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setPartnerBranch('Foundation');
                    setPartnerModalOpen(true);
                  }}
                  className="py-2.5 px-4 rounded-lg border border-[#3A2E27] bg-[#0F0C0A] text-[#E8DDD0] hover:text-white text-xs font-semibold transition-colors"
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
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#FBF8F3] tracking-tight mt-1">
              Fielding Champions On Continental & World Stages
            </h2>
          </div>
          <p className="text-xs text-[#A89887] max-w-sm mt-3 md:mt-0 font-normal">
            We prove the progress and rigor of our movement by fielding African teams at premier debate conventions across the globe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#16110F] border border-[#2A221E] space-y-3">
            <div className="text-[10px] font-mono text-[#C85A32] uppercase font-bold tracking-wider">
              WUDC 2026 • Grand Finalists
            </div>
            <h3 className="text-lg font-serif font-bold text-[#FBF8F3]">World Universities Debating Championship</h3>
            <p className="text-xs text-[#A89887] leading-relaxed">
              Competing in British Parliamentary format against 300+ universities worldwide. Defending motions on continental resource sovereignty and post-colonial trade reform.
            </p>
            <div className="text-[11px] font-mono text-[#E8DDD0] pt-2 border-t border-[#2A221E]">
              8 Speakers Fielded • 2 Grand Finalist Awards
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#16110F] border border-[#2A221E] space-y-3">
            <div className="text-[10px] font-mono text-[#34D399] uppercase font-bold tracking-wider">
              PAUDC 2026 • Overall Champions
            </div>
            <h3 className="text-lg font-serif font-bold text-[#FBF8F3]">Pan-African Universities Debating Championship</h3>
            <p className="text-xs text-[#A89887] leading-relaxed">
              Leading the debate on African developmental sovereignty, intra-continental migration, and educational independence across 40 African nations.
            </p>
            <div className="text-[11px] font-mono text-[#E8DDD0] pt-2 border-t border-[#2A221E]">
              14 Speakers Fielded • 1st Place Team Trophy
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#16110F] border border-[#2A221E] space-y-3">
            <div className="text-[10px] font-mono text-[#E28359] uppercase font-bold tracking-wider">
              WorldMUN 2026 • Best Delegation
            </div>
            <h3 className="text-lg font-serif font-bold text-[#FBF8F3]">Harvard World Model United Nations</h3>
            <p className="text-xs text-[#A89887] leading-relaxed">
              Defending African strategic interests in multilateral treaty negotiations, international humanitarian law, and sovereign debt restructuring.
            </p>
            <div className="text-[11px] font-mono text-[#E8DDD0] pt-2 border-t border-[#2A221E]">
              6 Delegates Fielded • 4 Diplomacy Gavels
            </div>
          </div>
        </div>
      </section>

      {/* 6. Human Catharsis Testimonials */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-[#140F0D] border-t border-[#2A221E] text-left">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <div className="text-[11px] font-mono tracking-widest text-[#E28359] uppercase font-bold">
              Chapter IV • Living Proof
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#FBF8F3] tracking-tight mt-1">
              "The Day I Spoke, The Heaviness Lifted."
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1A1412] border border-[#2A221E] rounded-2xl p-6 sm:p-8 space-y-4">
              <p className="text-xs sm:text-sm text-[#D4C4B5] italic leading-relaxed font-serif">
                "Growing up in an abusive home, silence was my survival mechanism. I carried guilt that wasn't mine for fifteen years. Global Orators Foundation gave me the first safe room in my life to speak without fear. The moment I said it aloud, it lost its grip over me. Today, I coach younger kids in the children's home on how to tell their stories."
              </p>
              <div className="pt-4 border-t border-[#2A221E] flex items-center justify-between text-xs">
                <div>
                  <div className="font-serif font-bold text-white">Nia Muthoni</div>
                  <div className="text-[10px] text-[#A89887]">Foundation Fellow • Age 19 • Anti-Abuse Youth Advocate</div>
                </div>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C85A32]/10 text-[#E28359]">
                  Foundation Track
                </div>
              </div>
            </div>

            <div className="bg-[#1A1412] border border-[#2A221E] rounded-2xl p-6 sm:p-8 space-y-4">
              <p className="text-xs sm:text-sm text-[#D4C4B5] italic leading-relaxed font-serif">
                "As an African young man, men in my family taught me that crying or speaking about mental anxiety was weakness. I developed severe panic attacks before any speech. Learning that speaking is catharsis—and that emotional vulnerability requires ten times more bravery than suppression—saved my mental health and my university career."
              </p>
              <div className="pt-4 border-t border-[#2A221E] flex items-center justify-between text-xs">
                <div>
                  <div className="font-serif font-bold text-white">Tariq Bakari</div>
                  <div className="text-[10px] text-[#A89887]">Academy Scholar • Age 22 • Pan-African Debate Finalist</div>
                </div>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#34D399]/10 text-[#34D399]">
                  Academy Track
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Institutional Partnership & Grant Funding CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 border-t border-[#2A221E] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#FBF8F3] tracking-tight">
            Stand With the Movement.
          </h2>
          <p className="text-xs sm:text-sm text-[#A89887] leading-relaxed max-w-xl mx-auto font-normal">
            Whether you are a student ready to master parliamentary debate, a children's home seeking healing circles, or a philanthropic foundation funding fellowships: your voice matters here.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleStartOnboarding()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#C85A32] hover:bg-[#D46238] text-white font-serif font-bold text-xs shadow-xl shadow-[#C85A32]/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>Begin Speaker Onboarding</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setPartnerBranch('Foundation');
                setPartnerModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#3A2E27] bg-[#1A1412] hover:bg-[#241C18] text-[#FBF8F3] font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>Partner With Us / Grants</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. Editorial Footer with Full Domain Index */}
      <footer className="bg-[#0A0706] border-t border-[#221B17] py-14 px-4 sm:px-8 text-xs text-[#8C7B6B] text-left">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#C85A32] text-white flex items-center justify-center p-0.5">
                  <NubianFitLogo className="w-full h-full text-white" />
                </div>
                <div className="font-serif font-black text-[#FBF8F3] text-sm tracking-tight">
                  global <span className="text-[#C85A32]">Orators</span> Project
                </div>
              </div>
              <p className="text-[11px] text-[#A89887] leading-relaxed max-w-sm">
                A Pan-African intellectual movement dedicated to cognitive deconditioning, sovereign leadership manifestation, and therapeutic vocal catharsis.
              </p>
              <div className="text-[10px] font-mono text-[#8C7B6B]">
                Nairobi • London • Johannesburg • Dakar • Global
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#FBF8F3] font-bold mb-3">
                  Branches
                </div>
                <ul className="space-y-2 text-[11px] text-[#A89887]">
                  <li><a href="#academy" className="hover:text-white transition-colors">Global Orators Academy</a></li>
                  <li><a href="#foundation" className="hover:text-white transition-colors">Global Orators Foundation</a></li>
                  <li><a href="#escapism" className="hover:text-white transition-colors">Speaking as Escapism</a></li>
                  <li><a href="#championships" className="hover:text-white transition-colors">Debate Tournaments</a></li>
                </ul>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#FBF8F3] font-bold mb-3">
                  Environments
                </div>
                <ul className="space-y-2 text-[11px] text-[#A89887]">
                  <li>
                    <button onClick={() => setCurrentPortal('landing')} className="hover:text-white transition-colors">
                      globalorators.com (Main)
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentPortal('speaker_app')} className="hover:text-white transition-colors">
                      app.globalorators.com (Speaker)
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentPortal('coach_os')} className="hover:text-white transition-colors">
                      coach.globalorators.com (Coach)
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleStartOnboarding()} className="hover:text-white transition-colors">
                      onboard.globalorators.com
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#FBF8F3] font-bold mb-3">
                  Engagement
                </div>
                <ul className="space-y-2 text-[11px] text-[#A89887]">
                  <li>
                    <button onClick={() => { setPartnerBranch('Foundation'); setPartnerModalOpen(true); }} className="hover:text-white transition-colors">
                      Grant Inquiries
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setPartnerBranch('Academy'); setPartnerModalOpen(true); }} className="hover:text-white transition-colors">
                      School Partnerships
                    </button>
                  </li>
                  <li>
                    <button onClick={() => showToast('Direct inquiries: director@globalorators.org')} className="hover:text-white transition-colors">
                      Contact Governance
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#221B17] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#7A6B5C]">
            <div>© {new Date().getFullYear()} Global Orators Project (GOP). All Rights Reserved.</div>
            <div className="font-serif italic text-[#A89887]">"speak with impact"</div>
          </div>
        </div>
      </footer>

      {/* Institutional / Grant Partnership Modal */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1A1412] border border-[#3A2E27] rounded-2xl max-w-md w-full p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2A221E]">
              <h3 className="text-base font-serif font-bold text-white">
                Partner with Global Orators {partnerBranch}
              </h3>
              <button
                onClick={() => setPartnerModalOpen(false)}
                className="text-[#A89887] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#D4C4B5] mb-4 leading-relaxed font-normal">
              {partnerBranch === 'Academy'
                ? 'Empower your institution, university, or corporate leadership team with premier debate training, keynote coaching, and accredited speech syllabi.'
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
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#A89887] mb-1">
                  Organization / Institution Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Alliance High School or Hope Children's Home"
                  className="w-full h-9 px-3 rounded-xl bg-[#0F0C0A] border border-[#2A221E] text-xs text-white focus:border-[#C85A32] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#A89887] mb-1">
                  Contact Email
                </label>
                <input
                  required
                  type="email"
                  placeholder="director@organization.org"
                  className="w-full h-9 px-3 rounded-xl bg-[#0F0C0A] border border-[#2A221E] text-xs text-white focus:border-[#C85A32] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#A89887] mb-1">
                  Collaboration Focus
                </label>
                <select className="w-full h-9 px-3 rounded-xl bg-[#0F0C0A] border border-[#2A221E] text-xs text-white focus:border-[#C85A32] focus:outline-hidden">
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
                  className="flex-1 py-2 rounded-xl bg-[#0F0C0A] border border-[#2A221E] text-[#A89887] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-serif font-bold hover:bg-[#D46238]"
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
