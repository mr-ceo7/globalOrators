import React, { useState } from 'react';
import { GraduationCap, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartOnboarding }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="relative pt-8 sm:pt-14 pb-12 sm:pb-20 px-4 sm:px-8 border-b border-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Mobile: 1-Column sequential rhythm (Headline -> Value Prop -> Image -> Paragraph -> CTAs -> Proof Points)
            Desktop (lg:): 2-Column editorial split (Col 1-7 Left narrative rows 1-5, Col 8-12 Right Image spanning rows 1-5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-4 sm:gap-y-5 lg:gap-x-12 lg:items-center">
          {/* 1. Headline */}
          <div className="order-1 lg:col-span-7 lg:col-start-1 lg:row-start-1 text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-slate-100 leading-[1.1]">
              Words Shape Nations.<br />
              <span className="italic font-serif font-normal text-[#A06C18] dark:text-[#E3B95C]">
                Silence Breaks Them.
              </span>
            </h1>
          </div>

          {/* 2. Short Value Proposition */}
          <div className="order-2 lg:col-span-7 lg:col-start-1 lg:row-start-2 text-left">
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm font-serif font-bold text-slate-100 leading-snug">
              Debate training, sovereign leadership development, and healing-centered voice programs for African youth.
            </div>
          </div>

          {/* 3. Hero Documentary Photography Frame (Brought immediately after Value Proposition on mobile) */}
          <figure className="order-3 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl flex flex-col justify-between self-stretch">
            {!imgError ? (
              <img 
                src="/images/hero-orator.jpg" 
                alt="African orator articulating debate points into microphone during Global Orators session" 
                className="h-64 sm:h-80 lg:h-full lg:min-h-[380px] w-full object-cover object-[center_32%] filter contrast-[1.02]"
                loading="eager"
                fetchPriority="high"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="h-64 sm:h-80 lg:h-full lg:min-h-[380px] w-full bg-slate-950 flex items-center justify-center p-6 text-center text-slate-400">
                <div className="font-serif italic text-sm">
                  "Words Shape Nations. Silence Breaks Them."
                </div>
              </div>
            )}
            <figcaption className="border-t border-slate-800 px-3.5 py-2 sm:py-2.5 text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] flex items-center justify-between shrink-0 bg-slate-900">
              <span className="font-semibold">Assembly Floor · Nairobi</span>
              <span className="text-slate-400 font-normal">Field Dispatch</span>
            </figcaption>
          </figure>

          {/* 4. One short supporting paragraph */}
          <div className="order-4 lg:col-span-7 lg:col-start-1 lg:row-start-3 text-left">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-xl">
              The <strong className="text-slate-100 font-semibold">Global Orators Project (GOP)</strong> cultivates minds capable of sovereign critical thought and champion debate—paired with safe, trauma-informed vocal release to heal trauma, break patriarchal silence, and champion honest emotional truth.
            </p>
          </div>

          {/* 5. Specific Action CTAs (Primary Academy vs Secondary Fellowship) */}
          <div className="order-5 lg:col-span-7 lg:col-start-1 lg:row-start-4 text-left">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                onClick={() => onStartOnboarding('Academy')}
                className="px-5 py-3 rounded-xl bg-[#C89630] text-slate-950 font-serif font-bold text-xs sm:text-sm hover:bg-[#B37D22] hover:text-white shadow-lg shadow-[#C89630]/20 flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Apply to Academy</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onStartOnboarding('Foundation')}
                className="px-4 py-2.5 rounded-xl border border-transparent hover:border-slate-800 text-slate-300 hover:text-slate-100 font-serif font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
              >
                <Heart className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Apply for Fellowship</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  Grant Funded
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* 6. Proof Points (Moved below CTAs to avoid delaying image) */}
          <div className="order-6 lg:col-span-7 lg:col-start-1 lg:row-start-5 text-left">
            <div className="grid grid-cols-2 gap-2.5 text-[11px] font-mono text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>British Parliamentary Rigor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>100% Grant-Funded Fellowships</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Continental & World Delegations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Safe Therapeutic Circles</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Stats Grid on Mobile */}
        <div className="mt-8 sm:mt-12 pt-6 border-t border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 text-left shadow-xs">
              <div className="text-2xl sm:text-3xl font-serif font-black text-slate-100">1,450+</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-0.5">Youth Trained</div>
              <div className="text-[9px] text-slate-400 font-mono mt-0.5">Kenya, Uganda, Ghana, SA</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 text-left shadow-xs">
              <div className="text-2xl sm:text-3xl font-serif font-black text-[#A06C18] dark:text-[#E3B95C]">48</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-0.5">Partner Institutions</div>
              <div className="text-[9px] text-slate-400 font-mono mt-0.5">Schools, shelters, councils</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 text-left shadow-xs">
              <div className="text-2xl sm:text-3xl font-serif font-black text-slate-100">16</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-0.5">Tournament Squads</div>
              <div className="text-[9px] text-slate-400 font-mono mt-0.5">PAUDC, WUDC & Opens</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 text-left shadow-xs">
              <div className="text-2xl sm:text-3xl font-serif font-black text-emerald-500">94%</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-0.5">Vocal Breakthrough</div>
              <div className="text-[9px] text-slate-400 font-mono mt-0.5">Cohort self-assessment</div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 text-left mt-2.5">
            * Metrics reflect active participants across Academy workshops and Foundation community circles from 2024 to present.
          </div>
        </div>
      </div>
    </section>
  );
};
