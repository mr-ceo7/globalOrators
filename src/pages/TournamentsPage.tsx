import React from 'react';
import { ArrowRight, Trophy, Award, Globe, CheckCircle, Scale, Shield, Calendar } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

interface TournamentsPageProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onNavigate: (path: string) => void;
}

export const TournamentsPage: React.FC<TournamentsPageProps> = ({
  onStartOnboarding,
  onNavigate
}) => {
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': 'Pan-African & World Universities Debating Championships Delegations',
    'description': 'Global Orators tournament squads competing in British Parliamentary debate at PAUDC, WUDC, and WorldMUN.',
    'organizer': {
      '@type': 'Organization',
      'name': 'Global Orators Academy'
    }
  };

  const motions = [
    {
      tournament: 'PAUDC Grand Finals',
      city: 'Addis Ababa',
      motion: 'This House Would Condition All Foreign Mineral Concessions on 100% Domestic In-Country Refining & Value-Addition.',
      position: 'Opening Government',
      result: 'Unanimous Champions'
    },
    {
      tournament: 'WUDC Semi-Finals',
      city: 'Belgrade',
      motion: 'This House Believes That Post-Colonial States Should Form a Sovereign Cartel to Repudiate Odious Historical Debts.',
      position: 'Closing Opposition',
      result: 'Grand Finalist Award'
    },
    {
      tournament: 'Pan-African Youth Assembly',
      city: 'Nairobi',
      motion: 'This House Would Abolish Institutional Language and Dress Codes That Subordinate Indigenous Expression to Colonial Norms.',
      position: 'Opening Opposition',
      result: 'Highest Speaker Score'
    },
    {
      tournament: 'WorldMUN Diplomatic Assembly',
      city: 'Geneva',
      motion: 'This House Would Mandate Sovereign Resource Royalties to Capitalize Autonomous Pan-African Sovereign Wealth Funds.',
      position: 'Sovereign Delegation',
      result: 'Best Delegation Gavel'
    }
  ];

  return (
    <div className="text-left">
      <SEOHead
        title="Tournaments & Debating Championships | PAUDC, WUDC, WorldMUN"
        description="Explore the championship record of Global Orators debaters. World-class British Parliamentary forensic clashes, debated motions on sovereignty, and squad selection criteria."
        canonicalPath="/tournaments"
        jsonLd={eventSchema}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto pt-6 px-4 sm:px-8">
        <ol className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-slate-400">
          <li>
            <a 
              href="/" 
              onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
              className="hover:text-[#C89630] transition-colors"
            >
              Home
            </a>
          </li>
          <li className="text-slate-600">/</li>
          <li className="text-slate-200 font-semibold" aria-current="page">Tournaments & Championships</li>
        </ol>
      </nav>

      {/* Hero Header */}
      <section className="py-10 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="max-w-3xl space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
            Chapter III • The Global Arena & Forensic Podiums
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-100 tracking-tight leading-none">
            Fielding Champions on World Stages.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed pt-2">
            We prove the rigor and intellectual authority of our movement by fielding African teams at premier debate conventions across the globe—defending motions on continental sovereignty, economics, and post-colonial law.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onStartOnboarding('Academy')}
              className="px-6 py-3 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-xs shadow-xl shadow-[#C89630]/25 flex items-center gap-2 cursor-pointer"
            >
              <span>Try Out for Tournament Squad</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Arena Visual Dispatch: Authentic Championship Photography */}
      <section className="py-8 sm:py-12 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <figure className="md:col-span-7 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex flex-col justify-between">
            <div className="h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-950">
              <img 
                src="/images/obed-arena.jpg" 
                alt="Global Orators debater standing at the international tournament adjudication rostrum with pan-African flags" 
                className="w-full h-full object-cover object-[center_20%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                loading="lazy" 
              />
            </div>
            <figcaption className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono uppercase tracking-widest text-slate-400">
              <span className="text-[#7A4B06] dark:text-[#E3B95C] font-semibold">International Adjudication Chamber</span>
              <span>Continental Flags & Delegations</span>
            </figcaption>
          </figure>

          <figure className="md:col-span-5 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex flex-col justify-between">
            <div className="h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-950">
              <img 
                src="/images/obed-deliberation.jpg" 
                alt="Debate squad preparing arguments in the motion deliberation chamber" 
                className="w-full h-full object-cover object-[center_35%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                loading="lazy" 
              />
            </div>
            <figcaption className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono uppercase tracking-widest text-slate-400">
              <span className="text-emerald-500 font-semibold">15-Min Prep Room</span>
              <span>Timed Case Construction</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Major Championships Grid */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="mb-10 text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
            Podium Track Record
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight mt-1">
            Continental & International Honors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 text-left">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xs">
            <div className="text-[10px] font-mono text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold tracking-wider">
              WUDC 2026 • Grand Finalists
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-100">
              World Universities Debating Championship
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
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
            <h3 className="text-lg font-serif font-bold text-slate-100">
              Pan-African Universities Championship
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Leading the debate on African developmental sovereignty, intra-continental migration, and educational independence across 40 African nations.
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              14 Speakers Fielded • 1st Place Team Trophy
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xs">
            <div className="text-[10px] font-mono text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold tracking-wider">
              WorldMUN 2026 • Best Delegation
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-100">
              Harvard World Model United Nations
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Defending African strategic interests in multilateral treaty negotiations, international humanitarian law, and sovereign debt restructuring.
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              6 Delegates Fielded • 4 Diplomacy Gavels
            </div>
          </div>
        </div>
      </section>

      {/* Debated Motions Archive */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="mb-8 text-left">
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
            The Motions • Real British Parliamentary Clashes
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight mt-1">
            Sovereignty Defended On The Floor
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            15-minute preparation without internet • Dialectical rigour
          </p>
        </div>

        {/* 2-Column Responsive Grid on Mobile / Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {motions.map((m, i) => (
            <div key={i} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#7A4B06] dark:text-[#E3B95C] font-semibold">{m.tournament}</span>
                <span className="text-slate-400">{m.city}</span>
              </div>
              <p className="text-xs sm:text-sm font-serif font-bold text-slate-100 leading-snug">
                "{m.motion}"
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-500 font-semibold flex items-center justify-between">
                <span>{m.position}</span>
                <span>{m.result}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Squad Selection Standards */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-5xl mx-auto border-b border-slate-800">
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-left">
          <div className="text-xs font-mono text-[#7A4B06] dark:text-[#E3B95C] uppercase tracking-widest font-bold">
            Squad Tryout Criteria
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
            How Debaters Earn a Seat on Championship Squads
          </h3>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              Every semester, Global Orators Academy conducts blind diagnostic tryouts for continental and world tournament squads. Candidates complete 3 rounds of unseen 15-minute motion preparation followed by a 7-minute British Parliamentary speech before a panel of PAUDC/WUDC grand final adjudicators.
            </p>
            <p>
              Selected speakers receive full travel grants, cohort accommodations, and tournament registration fees sponsored by our institutional and alumni partners.
            </p>
          </div>
        </div>
      </section>

      {/* Conversion CTAs */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
            Selection for 2026 Delegations
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight">
            Represent Your Nation on the World Stage.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Applications for tournament squad prep cohorts are evaluated rolling weekly.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => onStartOnboarding('Academy')}
              className="px-6 py-3.5 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-xs shadow-xl shadow-[#C89630]/25 flex items-center gap-2 cursor-pointer"
            >
              <span>Apply for Tournament Squad</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
