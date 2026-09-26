import React from 'react';
import { ArrowRight, ShieldCheck, Mail, CheckCircle, Quote, Star } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

interface TestimonialsPageProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
  onNavigate: (path: string) => void;
}

export const TestimonialsPage: React.FC<TestimonialsPageProps> = ({
  onStartOnboarding,
  onOpenPartner,
  onNavigate
}) => {
  const testimonialsSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': 'Global Orators Project Testimonials & Living Proof',
    'description': 'Verified testimonials and dispatches from debaters, foundation fellows, coaches, and shelter partners across Africa.',
    'publisher': {
      '@type': 'Organization',
      'name': 'Global Orators Project'
    }
  };

  const stories = [
    {
      author: 'Imani',
      role: 'Public Speaker & Philosopher • Orator Fellow',
      track: 'Academy & Foundation Fellow',
      location: 'Nairobi, Kenya',
      image: '/images/hero-orator.jpg',
      quote: 'A public speaker and philosopher passionately enthusiastic about giving a voice to the leaders of tomorrow, believing in the power of structured arguments and eloquent communication to better shape associations amongst future leaders. Global Orators gave me the platform to sharpen rigorous rhetoric while creating safe rooms for others to find their voice.',
      consent: 'Informed Consent Documented'
    },
    {
      author: 'Milo Brian',
      role: 'Legal Scholar, Award-Winning Debater & Poet',
      track: 'Academy & Legal Forensics Track',
      location: 'Nairobi / Continental Circuit',
      image: '/images/milo-podium.jpg',
      quote: 'A legal scholar, award-winning debater, poet and a firm believer in not limiting oneself regardless of the underlying circumstances. Global Orators provides the arena where forensic legal precision and poetic voice converge—empowering young advocates to dismantle institutional barriers and argue without fear or concession.',
      consent: 'Documented Orator Scholar'
    },
    {
      author: 'Obed',
      role: 'Academy Debate Fellow & Youth Leader',
      track: 'Academy Tournament Track',
      location: 'Nairobi / Pan-African Circuit',
      image: '/images/obed-poi.jpg',
      quote: 'An articulate, thoughtful, and highly motivated young leader whose background in debate has strengthened critical thinking, communication, and the ability to engage with complex issues. He demonstrates intellectual curiosity, resilience, and a strong sense of responsibility, consistently approaching challenges with maturity and integrity. He combines analytical reasoning with empathy, enabling him to contribute meaningfully to discussions.',
      consent: 'Documented Tournament Delegate'
    },
    {
      author: 'Valerie Wanjiku',
      role: 'Debate Coach & Storytelling Specialist',
      track: 'Academy Faculty & Debate Coach',
      location: 'Maseru Assembly / Continental Circuit',
      image: '/images/valerie.jpg',
      quote: 'A debater and storyteller at heart, driven by the belief that African voices deserve center stage, for the richness of culture, wisdom, and life it carries, and for stories the world has yet to fully hear. Committed to the pursuit of structured argument and eloquent expression, not just to build tomorrow’s leaders, but to help shape a more profound, self-assured continent.',
      consent: 'Faculty & Adjudication Dispatch'
    },
    {
      author: 'David Ochieng',
      role: 'Head of Humanities & Debate Coach',
      track: 'Institutional Partner',
      location: 'Kisumu High School Network',
      quote: 'We adopted the Global Orators 12-week forensic syllabus last year. The shift in our students has been profound. They no longer recite regurgitated notes—they dissect government budgets, challenge logic respectfully, and recently reached the semi-finals at the National Schools Forensics League.',
      consent: 'School Accreditation Partner'
    },
    {
      author: 'Sister Grace Mwangi',
      role: 'Shelter Director & Caretaker',
      track: 'Community Shelter Partner',
      location: 'Hope Children\'s Haven, Nairobi',
      quote: 'When the Global Orators mentors arrived, our teenage girls were withdrawn and defensive. By week four of the healing circles, you could feel the atmosphere shift. The girls were laughing, breathing deeply, and advocating for themselves in school meetings. This work heals from the inside out.',
      consent: 'Institutional Safeguarding Partner'
    }
  ];

  return (
    <div className="text-left">
      <SEOHead
        title="Testimonials & Living Proof | Global Orators Project"
        description="Read firsthand dispatches and verified testimonials from Global Orators fellows, scholars, debate coaches, and shelter partners across Africa."
        canonicalPath="/testimonials"
        jsonLd={testimonialsSchema}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="max-w-7xl 2xl:max-w-[1440px] mx-auto pt-6 px-4 sm:px-8">
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
          <li className="text-slate-200 font-semibold" aria-current="page">Living Proof & Testimonials</li>
        </ol>
      </nav>

      {/* Hero Header */}
      <section className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl 2xl:max-w-[1440px] mx-auto border-b border-slate-800">
        <div className="max-w-3xl space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
            Chapter IV • Living Proof & Ethical Safeguarding
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-100 tracking-tight leading-none">
            "The Day I Spoke, The Heaviness Lifted."
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed pt-2">
            The authority of our movement is written in the lived transformation of our scholars, fellows, and partner institutions. These are verified dispatches from the circle and the podium.
          </p>
        </div>
      </section>

      {/* Explicit Safeguarding Disclaimer */}
      <section className="py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto border-b border-slate-800">
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed space-y-1">
            <div className="font-serif font-bold text-slate-100">
              Documented Informed Consent & Privacy Protocols
            </div>
            <p className="text-[11px] text-slate-400">
              All participant testimonials and field dispatches appear with documented informed consent. Where required for minor safeguarding or survivor privacy, verified pseudonyms are utilized. Global Orators speech circles provide educational rhetoric, vocal liberation, and mentorship; they do not replace licensed medical or psychiatric care.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Community Photo Dispatch */}
      <section className="py-8 sm:py-12 px-4 sm:px-8 max-w-7xl 2xl:max-w-[1440px] mx-auto">
        <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
          <img 
            src="/images/mentorship-circle.jpg" 
            alt="African youth mentor coaching children and teenagers in a community storytelling circle in Nairobi" 
            className="w-full h-64 sm:h-80 md:h-96 object-cover object-[center_35%] filter contrast-[1.05]" 
            loading="lazy" 
          />
        </figure>
      </section>

      {/* 2-Column Responsive Testimonials Grid */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-7xl 2xl:max-w-[1440px] mx-auto border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((s, i) => (
            <div key={i} className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 shadow-xs">
              <p className="font-serif italic text-xs sm:text-sm text-slate-200 leading-relaxed">
                "{s.quote}"
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {s.image && (
                    <img 
                      src={s.image} 
                      alt={s.author} 
                      className="w-10 h-10 rounded-full object-cover object-top border border-slate-700 shrink-0" 
                    />
                  )}
                  <div>
                    <div className="font-serif font-bold text-slate-100">{s.author}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{s.role} · {s.location}</div>
                  </div>
                </div>
                <div className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${s.track.includes('Foundation') ? 'bg-[#C89630]/10 text-[#7A4B06] dark:text-[#E3B95C] border border-[#C89630]/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                  {s.track}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Audited Impact Metrics */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-7xl 2xl:max-w-[1440px] mx-auto border-b border-slate-800">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-serif font-black text-slate-100">1,450+</div>
            <div className="text-xs font-bold text-slate-200 mt-1">Youth Trained</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across 4 African nations</div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-serif font-black text-[#7A4B06] dark:text-[#E3B95C]">48</div>
            <div className="text-xs font-bold text-slate-200 mt-1">Partner Institutions</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Schools, shelters & councils</div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-serif font-black text-slate-100">16</div>
            <div className="text-xs font-bold text-slate-200 mt-1">Tournament Squads</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Continental & world circuits</div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-serif font-black text-emerald-500">94%</div>
            <div className="text-xs font-bold text-slate-200 mt-1">Vocal Breakthrough</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cohort self-assessment</div>
          </div>
        </div>
      </section>

      {/* Conversion Actions */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
            Applications & Partnerships
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight">
            Write Your Story With Us.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Whether applying for yourself, your school, or a children's shelter: the movement begins with a single spoken word.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onStartOnboarding()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-on-gold font-serif font-bold text-xs shadow-xl shadow-[#C89630]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start Your Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenPartner('Foundation')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-100 font-serif font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book Institutional Partnership</span>
            </button>
          </div>
          <div className="pt-4 text-[11px] font-mono text-slate-400">
            Director Governance Inquiries: <a href="mailto:director@globaloratorsproject.com" className="text-[#7A4B06] dark:text-[#E3B95C] underline">director@globaloratorsproject.com</a>
          </div>
        </div>
      </section>
    </div>
  );
};
