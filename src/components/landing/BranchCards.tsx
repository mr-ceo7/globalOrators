import React, { useState } from 'react';
import { ArrowRight, GraduationCap, Heart, Check, Building2 } from 'lucide-react';

interface BranchCardsProps {
  onStartOnboarding: (branch: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
}

export const BranchCards: React.FC<BranchCardsProps> = ({
  onStartOnboarding,
  onOpenPartner
}) => {
  return (
    <section id="branches" className="py-14 sm:py-20 px-4 sm:px-8 bg-slate-950 border-b border-slate-800">
      <div className="max-w-6xl mx-auto text-left">
        <div className="mb-10">
          <div className="text-[10px] font-mono tracking-widest text-[#C85A32] uppercase font-bold">
            Chapter II • The Functional Structure
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight mt-1">
            Two Functional Branches. One Sovereign Vision.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-normal">
            An ecosystem balancing world-class competitive parliamentary debate with radical philanthropic accessibility.
          </p>
        </div>

        {/* 2-Column Responsive Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Branch 1: Global Orators Academy */}
          <div id="academy" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 flex flex-col justify-between shadow-lg">
            <div>
              <figure className="rounded-xl overflow-hidden mb-5 border border-slate-800 bg-slate-950/40">
                <img 
                  src="/images/academy-debate.jpg" 
                  alt="Young African debaters at parliamentary debate table" 
                  className="w-full h-44 sm:h-52 object-cover"
                  loading="lazy"
                />
                <figcaption className="px-3.5 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-300 uppercase tracking-wider font-semibold">Championship Chamber</span>
                  <span className="text-[#C85A32] uppercase tracking-widest">Competitive Wing</span>
                </figcaption>
              </figure>

              <div className="text-[10px] font-mono tracking-widest uppercase text-[#C85A32] font-bold">
                Professional Fee & School Accreditations
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mt-0.5 mb-2">
                Global Orators Academy
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Accessing and training young individuals from early learning through universities. We build disciplined debaters, public keynote speakers, and corporate negotiators capable of holding ground on world stages.
              </p>

              {/* Program Specifications Card */}
              <div className="mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Tuition:</span>
                  <span className="text-slate-200">Tiered / Scholarships Available</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Duration:</span>
                  <span className="text-slate-200">12-Week Intensive (Hybrid)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Eligibility:</span>
                  <span className="text-slate-200">Ages 14–26 (Secondary & Tertiary)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Outcome:</span>
                  <span className="text-emerald-500 font-semibold">Certified Orator • WUDC/PAUDC Roster</span>
                </div>
              </div>

              {/* 2-Column Mobile Feature Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-200 mb-5">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="font-bold text-slate-100">Parliamentary Debate</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">BP, Worlds & Karl Popper mastery</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="font-bold text-slate-100">Tournament Squads</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">National & global delegations</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="font-bold text-slate-100">Executive Pitching</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Boardroom & rhetoric coaching</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="font-bold text-slate-100">Institutional Syllabi</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Accredited school curriculums</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onStartOnboarding('Academy')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#C85A32] text-[#FFFFFF] font-serif font-bold text-xs hover:bg-[#D46238] flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C85A32] focus-visible:outline-hidden"
              >
                <span>Apply to Academy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenPartner('Academy')}
                className="py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Inquire for School Partnership
              </button>
            </div>
          </div>

          {/* Branch 2: Global Orators Foundation */}
          <div id="foundation" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 flex flex-col justify-between shadow-lg">
            <div>
              <figure className="rounded-xl overflow-hidden mb-5 border border-slate-800 bg-slate-950/40">
                <img 
                  src="/images/foundation-circle.jpg" 
                  alt="African youth and children sitting in a warm library healing circle" 
                  className="w-full h-44 sm:h-52 object-cover"
                  loading="lazy"
                />
                <figcaption className="px-3.5 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-300 uppercase tracking-wider font-semibold">Healing Circle</span>
                  <span className="text-emerald-500 uppercase tracking-widest">100% Grant-Funded</span>
                </figcaption>
              </figure>

              <div className="text-[10px] font-mono tracking-widest uppercase text-emerald-500 font-bold">
                100% Free • Supported by Grants & Donors
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mt-0.5 mb-2">
                Global Orators Foundation
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Access to enlightenment and public speech has become elitist. We partner with children's homes, charities, and shelters to work with youth who have survived abusive homes and systemic oppression—helping them voice what they endured and advocate against it happening to others.
              </p>

              {/* Program Specifications Card */}
              <div className="mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Tuition:</span>
                  <span className="text-emerald-500 font-bold">100% Free (Grant Funded)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Duration:</span>
                  <span className="text-slate-200">8-Week Healing Circles + Mentorship</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Eligibility:</span>
                  <span className="text-slate-200">Youth in Shelters & Marginalized Communities</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Outcome:</span>
                  <span className="text-emerald-500 font-semibold">Advocacy Voice • Ongoing Circle Access</span>
                </div>
              </div>

              {/* 2-Column Mobile Feature Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-200 mb-5">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="font-bold text-slate-100">Children's Shelters</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">On-site therapeutic speech circles</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="font-bold text-slate-100">Trauma-to-Advocacy</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Giving survivors sovereign authority</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="font-bold text-slate-100">Anti-Abuse Forums</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Youth-led community storytelling</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="font-bold text-slate-100">Full Fellowships</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Zero-cost training, meals & travel</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onStartOnboarding('Foundation')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#2E684D] hover:bg-[#387D5D] text-[#FFFFFF] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C85A32] focus-visible:outline-hidden"
              >
                <span>Apply for Fellowship</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenPartner('Foundation')}
                className="py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Charity / Grant Partnership
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
