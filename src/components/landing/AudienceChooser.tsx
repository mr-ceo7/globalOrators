import React from 'react';
import { GraduationCap, Heart, Building2, Globe, ArrowRight } from 'lucide-react';

interface AudienceChooserProps {
  onSelectBranch: (branch: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
}

export const AudienceChooser: React.FC<AudienceChooserProps> = ({
  onSelectBranch,
  onOpenPartner
}) => {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-6xl mx-auto text-left border-b border-slate-800">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#C85A32] font-bold">
            Audience Orientation • Fast-Track Pathways
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-slate-100 tracking-tight mt-1">
            Choose Your Path
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 sm:mt-0 max-w-md font-normal">
          Direct enrollment for speakers and debaters, accredited curriculums for schools, and grant partnerships for shelters.
        </p>
      </div>

      {/* 2-Column Responsive Mobile Grid / 4-Column Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Aspiring Speaker */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-[#C85A32]/60 transition-all group">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#C85A32]/15 text-[#C85A32] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-mono text-[#C85A32] uppercase font-bold tracking-wider">
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
            className="mt-4 w-full py-2 px-3 rounded-lg bg-[#C85A32] hover:bg-[#D46238] text-[#FFFFFF] font-serif font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Apply to Academy</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 2: Youth Seeking Fellowship */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/60 transition-all group">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-mono text-emerald-500 uppercase font-bold tracking-wider">
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
            className="mt-4 w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-[#FFFFFF] font-serif font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Apply for Fellowship</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3: Schools & Institutions */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-[#C85A32]/60 transition-all group">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-mono text-amber-500 uppercase font-bold tracking-wider">
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
            className="mt-4 w-full py-2 px-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 hover:text-white font-serif font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Partner as School</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 4: Donors & Charities */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/60 transition-all group">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-500 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-mono text-cyan-500 uppercase font-bold tracking-wider">
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
            className="mt-4 w-full py-2 px-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 hover:text-white font-serif font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Grants & Donors</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </section>
  );
};
