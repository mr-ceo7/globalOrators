import React from 'react';
import { ArrowRight, BookOpen, Compass, ShieldCheck, Globe, Users, Award, ChevronRight } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

interface AboutPageProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onStartOnboarding,
  onOpenPartner,
  onNavigate
}) => {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What is the Global Orators Project?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'The Global Orators Project (GOP) is a Pan-African intellectual movement dedicated to cognitive deconditioning, sovereign leadership development, and therapeutic vocal catharsis through parliamentary debate and safe speech circles.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How does Global Orators differ from conventional school debate clubs?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Conventional clubs often focus on superficial recitation. Global Orators pairs rigorous British Parliamentary forensics with trauma-informed vocal release, teaching youth to deconstruct policy, defend economic sovereignty, and overcome internal suppression.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is the Foundation fellowship free?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes. Global Orators Foundation fellowships are 100% grant-funded and free of tuition, covering learning materials, meals, transport, and dedicated mentors for youth in shelters and under-resourced communities.'
        }
      }
    ]
  };

  return (
    <div className="text-left">
      <SEOHead
        title="About the Movement | Pan-African Cognitive Sovereignty"
        description="The Global Orators Project is a Pan-African movement dismantling colonial social conditioning through parliamentary debate, sovereign rhetoric, and healing speech circles."
        canonicalPath="/about"
        jsonLd={faqSchema}
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
          <li className="text-slate-200 font-semibold" aria-current="page">About the Movement</li>
        </ol>
      </nav>

      {/* Editorial Hero Header */}
      <section className="py-10 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="max-w-3xl space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-[#A06C18] dark:text-[#E3B95C] uppercase font-bold">
            Chapter I • Intellectual Genesis & Movement Manifesto
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-100 tracking-tight leading-none">
            Words Shape Nations. <br />
            <span className="italic font-normal text-[#A06C18] dark:text-[#E3B95C]">
              Silence Breaks Them.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed pt-2">
            The Global Orators Project was founded on an uncompromising premise: an individual or nation deprived of the capacity to interrogate policy, speak truth to power, and voice suppressed trauma will remain indefinitely subject to the wills of others.
          </p>
        </div>
      </section>

      {/* Chapter 1: The Root Dilemma & Social Conditioning */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-5xl mx-auto border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] font-bold mb-2">
              The Diagnosis
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 tracking-tight leading-snug">
              The Crisis of Cognitive Dependency
            </h2>
          </div>
          <div className="md:col-span-8 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              Across our continent, modern schooling too frequently rewards obedience and memorization over critical skepticism. A century of colonial administrative architecture conditioned our people to view leadership as a posture granted from above, rather than authority commanded through dialectical forensic clarity.
            </p>
            <p>
              When young citizens lack cognitive familiarity with constitutional mechanisms, bilateral concession treaties, and international trade law, they are easily persuaded by ethnic division, political patronage, and defeatism. We produce graduates with certifications but without sovereign voice.
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-serif italic text-slate-200">
              "To decondition the mind is not an academic luxury; it is the prerequisite for African developmental sovereignty. You cannot build what you cannot defend in debate."
            </div>
          </div>
        </div>

        {/* Documentary Photo Dispatch */}
        <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl my-10">
          <img 
            src="/images/sovereign-scholars.jpg" 
            alt="Scholars analyzing policy papers and motion archives in Nairobi library seminar" 
            className="w-full h-60 sm:h-80 md:h-96 object-cover object-center filter contrast-[1.05]" 
            loading="lazy" 
          />
          <figcaption className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono uppercase tracking-widest text-slate-400">
            <span className="text-[#A06C18] dark:text-[#E3B95C] font-semibold">Archive Seminar · Nairobi Library Research Center</span>
            <span>Policy Deconstruction & Constitutional Debate</span>
          </figcaption>
        </figure>
      </section>

      {/* Chapter 2: The Two Sovereign Pillars */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="mb-10 text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] font-bold">
            The Structural Architecture
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight mt-1">
            Two Pillars. One Unified Movement.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-normal">
            Balancing the world's most demanding parliamentary debate standards with trauma-informed vocal release.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Pillar 1 Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#C89630]/15 text-[#C89630] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] font-bold">
                Pillar I • Competitive Mastery
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                Global Orators Academy
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our rigorous 12-week competitive wing. Preparing young debaters for British Parliamentary (BP), Worlds Schools, and Karl Popper formats at international championships (WUDC, PAUDC, WorldMUN). Includes institutional syllabi for secondary schools and executive negotiation modules for rising professionals.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <a 
                href="/academy" 
                onClick={(e) => { e.preventDefault(); onNavigate('/academy'); }}
                className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#A06C18] dark:text-[#E3B95C] hover:underline"
              >
                <span>Explore Academy Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Pillar 2 Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold">
                Pillar II • Radical Accessibility
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                Global Orators Foundation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                100% grant-funded, zero-cost fellowships for youth in children's shelters, charities, and marginalized communities. Providing trauma-informed safe speech circles where young survivors of domestic adversity can speak their truth aloud without shame, transforming trauma into community advocacy.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <a 
                href="/foundation" 
                onClick={(e) => { e.preventDefault(); onNavigate('/foundation'); }}
                className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-emerald-500 hover:underline"
              >
                <span>Explore Foundation Fellowships</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 3: Pan-African Footprint */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="mb-8 text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] font-bold">
            Chapter III • Regional Hubs
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-100 tracking-tight mt-1">
            Continental & Global Footprint
          </h2>
        </div>

        {/* 2-Column Responsive Grid on Mobile / 4-Column on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#A06C18] dark:text-[#E3B95C]">Nairobi, Kenya</div>
            <div className="font-serif font-bold text-xs sm:text-sm text-slate-100">Directorate & Head Chamber</div>
            <div className="text-[11px] text-slate-400">East African tournament delegations and shelter circle coordination.</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#A06C18] dark:text-[#E3B95C]">Johannesburg, SA</div>
            <div className="font-serif font-bold text-xs sm:text-sm text-slate-100">Southern African Circuit</div>
            <div className="text-[11px] text-slate-400">Parliamentary varsity debaters and constitutional policy forums.</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#A06C18] dark:text-[#E3B95C]">Dakar, Senegal</div>
            <div className="font-serif font-bold text-xs sm:text-sm text-slate-100">Francophone Division</div>
            <div className="text-[11px] text-slate-400">West African youth forensic exchange and bilingual debate preparation.</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#A06C18] dark:text-[#E3B95C]">London & Global</div>
            <div className="font-serif font-bold text-xs sm:text-sm text-slate-100">Diaspora Liaison</div>
            <div className="text-[11px] text-slate-400">WUDC championship logistics and international foundation grants.</div>
          </div>
        </div>
      </section>

      {/* Chapter 4: Movement FAQs */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-4xl mx-auto border-b border-slate-800">
        <div className="mb-8 text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] font-bold">
            Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-100 tracking-tight mt-1">
            Questions on Governance & Enrollment
          </h2>
        </div>

        <div className="space-y-4 text-left">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="font-serif font-bold text-sm sm:text-base text-slate-100">
              How does Global Orators differ from traditional Toastmasters or school debate clubs?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Traditional clubs prioritize formal etiquette and polite repetition. Global Orators combines world-class British Parliamentary forensic clash with deep emotional catharsis. Debaters tackle complex African economic, constitutional, and historical dilemmas with 15-minute prep without internet.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="font-serif font-bold text-sm sm:text-base text-slate-100">
              How can schools or children's shelters establish an official partnership?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Schools can license our accredited speech syllabus, train coaches, and enter our tournament leagues. Children's shelters and charities apply for grant-funded on-site healing circles staffed by vetted mentors. Use our Institutional Inquiry form to connect with our partnerships director.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="font-serif font-bold text-sm sm:text-base text-slate-100">
              Is speaking in a healing circle considered psychiatric therapy?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              No. Our speech circles provide educational peer support, vocal liberation, and mentorship. They do not replace licensed psychotherapy or crisis intervention. All sessions operate under child safeguarding protocols with verified referral pathways to licensed medical professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Chapter 5: Conversion Actions */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="text-[10px] font-mono tracking-widest text-[#A06C18] dark:text-[#E3B95C] uppercase font-bold">
            Applications & Partnerships
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight">
            Take Your Place in the Chamber.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Whether preparing for continental debate podiums or seeking a healing circle in your community: your voice belongs here.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onStartOnboarding('Academy')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-xs shadow-xl shadow-[#C89630]/25 flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C89630]"
            >
              <span>Apply to Academy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onStartOnboarding('Foundation')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#2E684D] hover:bg-[#387D5D] text-[#FFFFFF] font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C89630]"
            >
              <span>Apply for Fellowship</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenPartner('Academy')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-100 font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-slate-700"
            >
              <span>Partner as School / Shelter</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
