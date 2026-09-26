import React from 'react';
import { GraduationCap, Heart, Building2, Globe, ArrowRight } from 'lucide-react';
import { RevealOnScroll, StaggerContainer, StaggerItem } from '../common/MotionWrapper';

interface AudienceChooserProps {
  onSelectBranch: (branch: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
}

export const AudienceChooser: React.FC<AudienceChooserProps> = ({
  onSelectBranch,
  onOpenPartner
}) => {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-7xl 2xl:max-w-[1440px] mx-auto text-left border-b border-slate-800">
      <RevealOnScroll className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
            Audience Orientation • Fast-Track Pathways
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-slate-100 tracking-tight mt-1">
            Choose Your Path
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 sm:mt-0 max-w-md font-normal">
          Direct enrollment for speakers and debaters, accredited curriculums for schools, and grant partnerships for shelters.
        </p>
      </RevealOnScroll>

      {/* 2-Column Responsive Mobile Grid / 4-Column Desktop */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" staggerDelay={0.07}>
        {/* Card 1: Aspiring Speaker */}
        <StaggerItem>
          <div className="p-3.5 sm:p-5 h-full rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-[#C89630]/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#C89630]/15 text-[#7A4B06] dark:text-[#E3B95C] flex items-center justify-center transition-transform group-hover:scale-105">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="text-[10px] font-mono text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold tracking-wider">
                For Speakers
              </div>
              <h3 className="text-xs sm:text-sm font-serif font-bold text-slate-100 leading-snug">
                I want to become a champion debater
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed hidden sm:block">
                Master British Parliamentary debate, impromptu speaking, and executive rhetoric.
              </p>
            </div>
            <button
              onClick={() => onSelectBranch('Academy')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-[#C89630] hover:bg-[#B37D22] text-[#181B1F] font-serif font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Apply to Academy</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </StaggerItem>

        {/* Card 2: Youth Seeking Fellowship */}
        <StaggerItem>
          <div className="p-3.5 sm:p-5 h-full rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-105">
                <Heart className="w-4 h-4" />
              </div>
              <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold tracking-wider">
                For Fellows
              </div>
              <h3 className="text-xs sm:text-sm font-serif font-bold text-slate-100 leading-snug">
                I need a safe space & fellowship
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed hidden sm:block">
                100% grant-funded therapeutic circles for vocal release, trauma-to-advocacy, and healing.
              </p>
            </div>
            <button
              onClick={() => onSelectBranch('Foundation')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-[#FFFFFF] font-serif font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Apply for Fellowship</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </StaggerItem>

        {/* Card 3: Schools & Institutions */}
        <StaggerItem>
          <div className="p-3.5 sm:p-5 h-full rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-[#C89630]/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center transition-transform group-hover:scale-105">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-[10px] font-mono text-amber-700 dark:text-amber-400 uppercase font-bold tracking-wider">
                For Schools
              </div>
              <h3 className="text-xs sm:text-sm font-serif font-bold text-slate-100 leading-snug">
                I represent a school or university
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed hidden sm:block">
                Deploy accredited speech syllabi, coach development, and tournament squad preparation.
              </p>
            </div>
            <button
              onClick={() => onOpenPartner('Academy')}
              className="mt-4 w-full py-2 px-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 hover:text-white font-serif font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Partner as School</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </StaggerItem>

        {/* Card 4: Donors & Charities */}
        <StaggerItem>
          <div className="p-3.5 sm:p-5 h-full rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center transition-transform group-hover:scale-105">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 uppercase font-bold tracking-wider">
                For Funders
              </div>
              <h3 className="text-xs sm:text-sm font-serif font-bold text-slate-100 leading-snug">
                I want to fund or sponsor youth
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed hidden sm:block">
                Sponsor youth in children's homes, support tournament travel, or fund clinical advisors.
              </p>
            </div>
            <button
              onClick={() => onOpenPartner('Foundation')}
              className="mt-4 w-full py-2 px-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 hover:text-white font-serif font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Grants & Donors</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </section>
  );
};
