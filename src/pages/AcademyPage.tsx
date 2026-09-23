import React from 'react';
import { ArrowRight, GraduationCap, Trophy, CheckCircle, BookOpen, Clock, Users, Shield, Building2, Quote } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

interface AcademyPageProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
  onNavigate: (path: string) => void;
}

export const AcademyPage: React.FC<AcademyPageProps> = ({
  onStartOnboarding,
  onOpenPartner,
  onNavigate
}) => {
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    'name': 'Global Orators Academy 12-Week Debate & Rhetoric Intensive',
    'description': 'Master British Parliamentary debate, impromptu extemporaneous speech, and executive negotiation with Pan-African championship coaches.',
    'provider': {
      '@type': 'Organization',
      'name': 'Global Orators Academy',
      'sameAs': 'https://globalorators.org/academy'
    }
  };

  const modules = [
    {
      num: '01',
      title: 'British Parliamentary & Worlds Format Mechanics',
      duration: 'Weeks 1–3',
      desc: 'Prime Minister cases, Deputy Leader extensions, whip summaries, and 15-minute preparation without internet.'
    },
    {
      num: '02',
      title: 'Geopolitical & Economic Motion Analysis',
      duration: 'Weeks 4–6',
      desc: 'Deconstructing resource sovereignty, post-colonial sovereign debt repudiation, and international treaty law.'
    },
    {
      num: '03',
      title: 'Adjudication, POIs & Cross-Examination',
      duration: 'Weeks 7–9',
      desc: 'Points of Information injection timing, refutation hierarchies, and psychological composure under hostile heckling.'
    },
    {
      num: '04',
      title: 'Executive Negotiation & Boardroom Rhetoric',
      duration: 'Weeks 10–12',
      desc: 'Translating parliamentary debate precision into commercial pitching, policy advocacy, and world keynote delivery.'
    }
  ];

  return (
    <div className="text-left">
      <SEOHead
        title="Global Orators Academy | Premier Parliamentary Debate & Leadership"
        description="Master British Parliamentary forensics, executive rhetoric, and tournament debate with Global Orators Academy. 12-week intensive cohorts, scholarships, and school syllabi."
        canonicalPath="/academy"
        jsonLd={courseSchema}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto pt-6 px-4 sm:px-8">
        <ol className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-slate-400">
          <li>
            <a 
              href="/" 
              onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
              className="hover:text-brand-gold transition-colors"
            >
              Home
            </a>
          </li>
          <li className="text-slate-600">/</li>
          <li className="text-slate-200 font-semibold" aria-current="page">Global Orators Academy</li>
        </ol>
      </nav>

      {/* Hero Header */}
      <section className="py-10 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="max-w-3xl space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
            Competitive & Executive Wing • Professional Fee & Accreditations
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-100 tracking-tight leading-none">
            The Sovereign Chamber of Forensics.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed pt-2">
            Global Orators Academy develops disciplined thinkers, world championship parliamentary debaters, and formidable keynote negotiators capable of holding ground on continental and international stages.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onStartOnboarding('Academy')}
              className="px-6 py-3 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-on-gold font-serif font-bold text-xs shadow-xl shadow-[#C89630]/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Apply to Academy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenPartner('Academy')}
              className="px-5 py-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-serif font-bold text-xs transition-colors cursor-pointer"
            >
              Inquire for School Partnership
            </button>
          </div>
        </div>
      </section>

      {/* Featured Arena Dispatch: Authentic Documentary Visuals */}
      <section className="py-8 sm:py-12 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex flex-col justify-between">
            <div className="h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
              <img 
                src="/images/obed-poi.jpg" 
                alt="Obed raising hand with pen for Point of Information during parliamentary debate" 
                className="w-full h-full object-cover object-[center_20%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                loading="lazy" 
              />
            </div>
            <figcaption className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-slate-400">
              <span className="text-[#7A4B06] dark:text-[#E3B95C] font-semibold">Chamber Point of Information</span>
              <span>Parliamentary Floor Action</span>
            </figcaption>
          </figure>

          <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex flex-col justify-between">
            <div className="h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
              <img 
                src="/images/obed-deliberation.jpg" 
                alt="Obed and debaters collaborating in the motion deliberation chamber at Global Orators Academy" 
                className="w-full h-full object-cover object-[center_35%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                loading="lazy" 
              />
            </div>
            <figcaption className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-slate-400">
              <span className="text-emerald-500 font-semibold">15-Minute Deliberation Room</span>
              <span>Collaborative Case Prep</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Program Specifications Matrix */}
      <section className="py-8 sm:py-12 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Cohort Duration</div>
            <div className="text-sm sm:text-base font-serif font-bold text-slate-100 mt-1">12 Weeks Intensive</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Hybrid: Live & Virtual</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Eligibility</div>
            <div className="text-sm sm:text-base font-serif font-bold text-slate-100 mt-1">Ages 14–26</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Secondary & University</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Tournament Track</div>
            <div className="text-sm sm:text-base font-serif font-bold text-[#7A4B06] dark:text-[#E3B95C] mt-1">WUDC & PAUDC</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Continental delegations</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Tuition Status</div>
            <div className="text-sm sm:text-base font-serif font-bold text-slate-100 mt-1">Tiered Model</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Need & Merit Scholarships</div>
          </div>
        </div>
      </section>

      {/* 12-Week Curriculum Modules */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="mb-10 text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
            Curriculum Structure
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight mt-1">
            The 4 Mastery Modules
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-normal">
            Designed by international chief adjudicators to systematically transform raw enthusiasm into forensic command.
          </p>
        </div>

        {/* 2-Column Responsive Grid on Mobile / 4-Column on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <div key={mod.num} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#7A4B06] dark:text-[#E3B95C]">{mod.num}</span>
                  <span className="text-slate-400">{mod.duration}</span>
                </div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-slate-100 mt-2 leading-snug">
                  {mod.title}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {mod.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Academy Scholar in Focus: Obed */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800 text-left">
        <div className="p-6 sm:p-10 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
              Scholar in Focus · Academy Debate Fellow
            </span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <blockquote className="space-y-3">
                <Quote className="w-8 h-8 text-brand-gold/40 shrink-0" />
                <p className="font-serif italic text-sm sm:text-base text-slate-100 leading-relaxed">
                  "An articulate, thoughtful, and highly motivated young leader whose background in debate has strengthened critical thinking, communication, and the ability to engage with complex issues. He demonstrates intellectual curiosity, resilience, and a strong sense of responsibility, consistently approaching challenges with maturity and integrity. He combines analytical reasoning with empathy, enabling him to contribute meaningfully to discussions."
                </p>
              </blockquote>

              <p className="text-xs text-slate-300 leading-relaxed font-normal pt-2 border-t border-slate-800">
                At Global Orators Academy, Obed exemplifies the balance between razor-sharp competitive forensics and empathetic listening. His growth through tournament division and intensive argument workshops reflects the Academy's core mission: equipping African youth to engage the world's most intricate questions with moral clarity and poise.
              </p>

              <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <img 
                    src="/images/obed-poi.jpg" 
                    alt="Obed" 
                    className="w-10 h-10 rounded-full object-cover object-top border border-slate-700 shrink-0" 
                  />
                  <div>
                    <div className="font-serif font-bold text-slate-100 text-sm">Obed</div>
                    <div className="text-[10px] text-slate-400 font-mono">Academy Debate Fellow · Parliamentary Intervener</div>
                  </div>
                </div>
                <button
                  onClick={() => onStartOnboarding('Academy')}
                  className="px-4 py-2 rounded-lg bg-[#C89630] hover:bg-[#B37D22] text-on-gold font-serif font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <span>Train With Academy Fellows</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
                <img 
                  src="/images/obed-arena.jpg" 
                  alt="Obed at the tournament adjudication arena" 
                  className="w-full h-56 sm:h-64 object-cover object-[center_20%] filter contrast-[1.03]" 
                  loading="lazy" 
                />
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between px-1">
                <span className="text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">Tournament Floor Presence</span>
                <span>Pan-African Circuit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School Accreditation Section */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-5xl mx-auto border-b border-slate-800">
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
              Institutional Accreditation for Schools
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We license accredited speech and debate syllabi to leading secondary schools and universities across Kenya, South Africa, and Ghana. Includes certified teacher coach seminars, judging frameworks, and inter-school tournament circuits.
            </p>
          </div>
          <button
            onClick={() => onOpenPartner('Academy')}
            className="px-6 py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-100 text-xs font-serif font-bold shrink-0 cursor-pointer"
          >
            Partner as Institution
          </button>
        </div>
      </section>

      {/* Conversion CTAs */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
            Applications Open for 2026 Cohorts
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight">
            Step Into the Debate Chamber.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto font-normal">
            Join the continent's most disciplined young debaters and keynote speakers. Applications are reviewed rolling weekly.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onStartOnboarding('Academy')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-on-gold font-serif font-bold text-xs shadow-xl shadow-[#C89630]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Submit Academy Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
