import React from 'react';
import { ArrowRight, Heart, ShieldCheck, Users, HandHeart, CheckCircle, Lock, ShieldAlert } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

interface FoundationPageProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
  onNavigate: (path: string) => void;
}

export const FoundationPage: React.FC<FoundationPageProps> = ({
  onStartOnboarding,
  onOpenPartner,
  onNavigate
}) => {
  const ngoSchema = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    'name': 'Global Orators Foundation',
    'url': 'https://globalorators.org/foundation',
    'description': '100% grant-funded therapeutic speech circles and leadership fellowships for marginalized youth and survivors in children shelters.',
    'nonprofitStatus': 'NonprofitType'
  };

  const programs = [
    {
      title: "Children's Shelter Healing Circles",
      desc: "Weekly on-site safe circles inside partner shelters and charities. Providing young survivors of domestic trauma with the somatic room to speak aloud what they endured without fear of reprisal."
    },
    {
      title: "Trauma-to-Advocacy Progression",
      desc: "Structured coaching moving beyond pain to sovereign authority. Fellows learn to articulate policy reforms against child neglect, domestic abuse, and institutional discrimination."
    },
    {
      title: "100% Barrier-Free Fellowships",
      desc: "Zero-cost tuition supported entirely by philanthropic grants. We fund transportation, nutrition, training journals, and 1-on-1 mentorship for every admitted fellow."
    },
    {
      title: "Community Anti-Abuse Storytelling",
      desc: "Fellows lead youth community forums in informal settlements, breaking the taboo of silence and teaching younger peers how to voice boundaries and report abuse."
    }
  ];

  return (
    <div className="text-left">
      <SEOHead
        title="Global Orators Foundation | 100% Grant-Funded Fellowships & Shelter Circles"
        description="Global Orators Foundation brings 100% free therapeutic speech circles and leadership fellowships to children shelters and survivors of trauma across Africa."
        canonicalPath="/foundation"
        jsonLd={ngoSchema}
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
          <li className="text-slate-200 font-semibold" aria-current="page">Global Orators Foundation</li>
        </ol>
      </nav>

      {/* Hero Header */}
      <section className="py-10 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="max-w-3xl space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-emerald-500 uppercase font-bold">
            Philanthropic & Community Wing • 100% Grant-Funded
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-100 tracking-tight leading-none">
            Radical Accessibility. Sovereign Voice for All.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed pt-2">
            Access to enlightenment and public speech has become an elitist commodity. Global Orators Foundation exists to tear down that wall—partnering with children's shelters and charities to give trauma survivors the safe room to speak their truth.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onStartOnboarding('Foundation')}
              className="px-6 py-3 rounded-xl bg-[#2E684D] hover:bg-[#387D5D] text-[#FFFFFF] font-serif font-bold text-xs shadow-xl shadow-[#2E684D]/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Apply for Fellowship</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenPartner('Foundation')}
              className="px-5 py-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-serif font-bold text-xs transition-colors cursor-pointer"
            >
              Charity / Shelter Partnership
            </button>
          </div>
        </div>
      </section>

      {/* Featured Youth Outreach Dispatch */}
      <section className="py-8 sm:py-12 px-4 sm:px-8 max-w-6xl mx-auto">
        <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
          <img 
            src="/images/geoffrey-youth-assembly.jpg" 
            alt="Geoffrey Anyona with youth debate scholars and secondary school students in community mentorship assembly" 
            className="w-full h-64 sm:h-80 md:h-96 object-cover object-[center_35%] filter contrast-[1.03]" 
            loading="lazy" 
          />
          <figcaption className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono uppercase tracking-widest text-slate-400">
            <span className="text-emerald-500 font-semibold">Youth Leadership Assembly · Secondary School Outreach</span>
            <span>100% Grant-Funded · Trauma-Informed Peer Mentorship</span>
          </figcaption>
        </figure>
      </section>

      {/* Core Programs Grid */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="mb-10 text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold">
            Foundation Initiatives
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight mt-1">
            Transforming Survival Into Advocacy
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-normal">
            Every program is engineered to remove financial, social, and psychological barriers to vocal expression.
          </p>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {programs.map((p, i) => (
            <div key={i} className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 font-bold uppercase tracking-wider">
                <CheckCircle className="w-4 h-4" />
                <span>Track 0{i + 1}</span>
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-100">
                {p.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Safeguarding & Clinical Boundary Protocol Banner */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-5xl mx-auto border-b border-slate-800">
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono text-emerald-500 uppercase tracking-widest font-bold">
            <Lock className="w-4 h-4" />
            <span>Child Safeguarding & Clinical Boundary Charter</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
            Confidentiality, Protection, and Clinical Care Referrals
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            All Global Orators Foundation facilitators undergo rigorous background checks and child safeguarding training. Our circles provide peer connection, vocal release, and mentorship. They are explicitly supportive and <strong className="text-white">do not replace licensed psychiatric care or crisis hospitalization</strong>. We maintain formal referral relationships with licensed local youth counselors and clinical psychologists.
          </p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            Documented informed consent is mandatory for all dispatches. Pseudonyms are used to protect survivor identities.
          </div>
        </div>
      </section>

      {/* Grant Accountability & Financial Transparency */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-serif font-black text-emerald-500">100%</div>
            <div className="text-xs font-bold text-slate-100 mt-1">Grant Deployment</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Funds go directly to cohorts</div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-serif font-black text-slate-100">$0</div>
            <div className="text-xs font-bold text-slate-100 mt-1">Fellow Tuition Fee</div>
            <div className="text-[10px] text-slate-400 mt-0.5">100% barrier-free entry</div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-serif font-black text-slate-100">48</div>
            <div className="text-xs font-bold text-slate-100 mt-1">Shelter Partners</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Active host institutions</div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-serif font-black text-emerald-500">8 Wks</div>
            <div className="text-xs font-bold text-slate-100 mt-1">Cohort Duration</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Intensive circle sessions</div>
          </div>
        </div>
      </section>

      {/* Conversion Actions */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-emerald-500 uppercase font-bold">
            Stand With Vulnerable Youth
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight">
            Bring a Healing Circle to Your Shelter.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Whether you are a young person who survived hardship or a children's charity director seeking support: our doors are open.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onStartOnboarding('Foundation')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#2E684D] hover:bg-[#387D5D] text-[#FFFFFF] font-serif font-bold text-xs shadow-xl shadow-[#2E684D]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply for Fellowship</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenPartner('Foundation')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-100 font-serif font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Grant / Shelter Partnership Inquiry</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
