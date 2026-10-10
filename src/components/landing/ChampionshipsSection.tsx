import React from 'react';
import { RevealOnScroll, StaggerContainer, StaggerItem } from '../common/MotionWrapper';
import { KineticHeading } from './KineticHeading';

export const ChampionshipsSection: React.FC = () => {
  return (
    <section id="championships" className="py-14 sm:py-20 px-4 sm:px-8 max-w-7xl 2xl:max-w-[1440px] mx-auto text-left border-b border-slate-800">
      <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
            Chapter III • The Global Arena
          </div>
          <KineticHeading
            text="Fielding Champions On Continental & World Stages"
            highlight="World Stages"
            className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight mt-1"
          />
        </div>
        <p className="text-xs text-slate-400 max-w-sm mt-2 md:mt-0 font-normal">
          We test our training where it counts: fielding African teams at major debate championships around the world.
        </p>
      </RevealOnScroll>

      {/* Featured championship photo: trophy & medal laureates */}
      <RevealOnScroll delay={0.06} className="mb-8">
        <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl group">
          <picture className="w-full h-full overflow-hidden block">
            <source srcSet="/images/geoffrey-squad-trophy.webp" type="image/webp" />
            <img 
              src="/images/geoffrey-squad-trophy.jpg" 
              alt="Geoffrey Anyona, debaters, and delegation celebrating championship victory with trophy and medals" 
              className="w-full h-56 sm:h-80 md:h-96 object-cover object-[center_25%] filter contrast-[1.03] group-hover:scale-[1.02] transition-transform duration-700 ease-out" 
              loading="lazy" 
              decoding="async"
              width={1200}
              height={600}
            />
          </picture>
        </figure>
      </RevealOnScroll>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6" staggerDelay={0.08}>
        <StaggerItem>
          <div className="p-5 sm:p-6 h-full rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#C89630]/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 space-y-3 shadow-xs">
            <div className="text-[10px] font-mono text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold tracking-wider">
              WUDC 2026 • Grand Finalists
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-100">
              World Universities Debating Championship
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Competing in British Parliamentary format against 300+ universities worldwide. Defending motions on continental resource sovereignty and post-colonial trade reform.
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              8 Speakers Fielded • 2 Grand Finalist Awards
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="p-5 sm:p-6 h-full rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 space-y-3 shadow-xs">
            <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold tracking-wider">
              PAUDC 2026 • Overall Champions
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-100">
              Pan-African Universities Debating Championship
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Leading the debate on African developmental sovereignty, intra-continental migration, and educational independence across 40 African nations.
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              14 Speakers Fielded • 1st Place Team Trophy
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="p-5 sm:p-6 h-full rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#C89630]/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 space-y-3 shadow-xs">
            <div className="text-[10px] font-mono text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold tracking-wider">
              WorldMUN 2026 • Best Delegation
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-100">
              Harvard World Model United Nations
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Defending African strategic interests in multilateral treaty negotiations, international humanitarian law, and sovereign debt restructuring.
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              6 Delegates Fielded • 4 Diplomacy Gavels
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Debated Motions: Real British Parliamentary Clashes */}
      <RevealOnScroll delay={0.08} className="mt-12 pt-8 border-t border-slate-800 text-left">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
              The Motions • Real British Parliamentary Clashes
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-black text-slate-100 tracking-tight mt-1">
              Motions We've Argued on the Floor
            </h3>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1 sm:mt-0">
            15-minute prep • No internet • Just the argument
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#C89630]/50 hover:-translate-y-0.5 transition-all duration-300 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#7A4B06] dark:text-[#E3B95C] font-semibold">PAUDC Grand Finals</span>
              <span className="text-slate-400">Addis Ababa</span>
            </div>
            <p className="text-xs font-serif font-bold text-slate-100 leading-snug">
              "This House Would Condition All Foreign Mineral Concessions on 100% Domestic In-Country Refining & Value-Addition."
            </p>
            <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-between">
              <span>Opening Government</span>
              <span>Unanimous Champions</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#C89630]/50 hover:-translate-y-0.5 transition-all duration-300 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#7A4B06] dark:text-[#E3B95C] font-semibold">WUDC Semi-Finals</span>
              <span className="text-slate-400">Belgrade</span>
            </div>
            <p className="text-xs font-serif font-bold text-slate-100 leading-snug">
              "This House Believes That Post-Colonial States Should Form a Sovereign Cartel to Repudiate Odious Historical Debts."
            </p>
            <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-between">
              <span>Closing Opposition</span>
              <span>Grand Finalist Award</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#C89630]/50 hover:-translate-y-0.5 transition-all duration-300 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#7A4B06] dark:text-[#E3B95C] font-semibold">Pan-African Youth Assembly</span>
              <span className="text-slate-400">Nairobi</span>
            </div>
            <p className="text-xs font-serif font-bold text-slate-100 leading-snug">
              "This House Would Abolish Institutional Language and Dress Codes That Subordinate Indigenous Expression to Colonial Norms."
            </p>
            <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-between">
              <span>Opening Opposition</span>
              <span>Highest Speaker Score</span>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
};
