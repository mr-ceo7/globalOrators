import React from 'react';
import { UserCheck, Activity, Mic, Trophy } from 'lucide-react';
import { RevealOnScroll, StaggerContainer, StaggerItem } from '../common/MotionWrapper';
import { KineticHeading } from './KineticHeading';

export const ProcessSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Apply & Track Matching',
      icon: UserCheck,
      desc: 'Select the Academy (competitive debate) or Foundation (100% grant-funded fellowship). Complete our intake self-assessment.'
    },
    {
      num: '02',
      title: 'Diagnostic Evaluation',
      icon: Activity,
      desc: '1-on-1 baseline review covering vocal resonance, argumentation structure, or personal therapeutic release goals.'
    },
    {
      num: '03',
      title: 'Cohort Training & Circles',
      icon: Mic,
      desc: '12 weeks of parliamentary motion drills or 8 weeks of trauma-informed healing voice circles in small supportive cohorts.'
    },
    {
      num: '04',
      title: 'The Arena & Advocacy',
      icon: Trophy,
      desc: 'Fielding at WUDC/PAUDC championships, delivering public addresses, or leading community anti-abuse storytelling.'
    }
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-7xl 2xl:max-w-[1440px] mx-auto text-left border-b border-slate-800">
      <RevealOnScroll className="mb-10">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
          Methodology & Development Model
        </div>
        <KineticHeading
          text="How The Program Operates"
          highlight="Program"
          className="text-2xl sm:text-3xl font-serif font-black text-slate-100 tracking-tight mt-1"
        />
        <p className="text-xs text-slate-400 mt-1 max-w-xl font-normal">
          A structured 4-stage progression, from your first assessment to speaking and competing nationally and internationally.
        </p>
      </RevealOnScroll>

      {/* 2-Column Responsive Grid on Mobile / 4-Column on Desktop */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" staggerDelay={0.08}>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <StaggerItem key={step.num}>
              <div 
                className="p-4 h-full rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-[#C89630]/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#7A4B06] dark:text-[#E3B95C]">
                      {step.num}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300 group-hover:text-[#7A4B06] dark:group-hover:text-[#E3B95C] transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h3 className="font-serif font-bold text-slate-100 text-xs sm:text-sm mt-2 leading-snug">
                    {step.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
};
