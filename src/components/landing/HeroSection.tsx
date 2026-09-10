import React, { useState } from 'react';
import { GraduationCap, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartOnboarding }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="relative pt-10 sm:pt-16 pb-12 sm:pb-20 px-4 sm:px-8 border-b border-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Narrative */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-slate-100 leading-[1.1]">
              Words Shape Nations.<br />
              <span className="italic font-serif font-normal text-[#C85A32]">
                Silence Breaks Them.
              </span>
            </h1>

            {/* Clear One-Sentence Value Proposition */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm font-serif font-bold text-slate-100 leading-snug">
              Debate training, sovereign leadership development, and healing-centered voice programs for African youth.
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-xl">
              The <strong className="text-slate-100 font-semibold">Global Orators Project (GOP)</strong> cultivates minds capable of sovereign critical thought and champion debate—paired with safe, trauma-informed vocal release to heal trauma, break patriarchal silence, and champion honest emotional truth.
            </p>

            {/* Value Pillars Checklist */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1">
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

            {/* Specific Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onStartOnboarding('Academy')}
                className="px-5 py-3 rounded-xl bg-[#C85A32] text-[#FFFFFF] font-serif font-bold text-xs sm:text-sm hover:bg-[#D46238] shadow-lg shadow-[#C85A32]/20 flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C85A32] focus-visible:outline-hidden"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Apply to Academy</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onStartOnboarding('Foundation')}
                className="px-5 py-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-100 font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:border-emerald-500/50 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C85A32] focus-visible:outline-hidden"
              >
                <Heart className="w-4 h-4 text-emerald-500" />
                <span>Apply for Fellowship</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  Grant Funded
                </span>
              </button>
            </div>
          </div>

          {/* Right Hero Documentary Photography Frame */}
          <div className="lg:col-span-5">
            <figure className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 flex flex-col">
              {!imgError ? (
                <img 
                  src="/images/hero-orator.jpg" 
                  alt="Young African orator speaking passionately at a wooden podium" 
                  className="w-full h-72 sm:h-[380px] object-cover object-top filter contrast-[1.05]"
                  loading="eager"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-72 sm:h-[380px] bg-slate-950 flex items-center justify-center p-6 text-center text-slate-400">
                  <div className="font-serif italic text-sm">
                    "Words Shape Nations. Silence Breaks Them."
                  </div>
                </div>
              )}
              <figcaption className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 text-left">
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

        {/* 2-Column Responsive Stats Grid on Mobile */}
        <div className="mt-10 pt-6 border-t border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 text-left shadow-xs">
              <div className="text-2xl sm:text-3xl font-serif font-black text-slate-100">1,450+</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-0.5">Youth Trained</div>
              <div className="text-[9px] text-slate-400 font-mono mt-0.5">Kenya, Uganda, Ghana, SA</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 text-left shadow-xs">
              <div className="text-2xl sm:text-3xl font-serif font-black text-[#C85A32]">48</div>
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
