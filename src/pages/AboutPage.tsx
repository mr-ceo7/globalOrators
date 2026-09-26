import React from 'react';
import { ArrowRight, BookOpen, Compass, ShieldCheck, Globe, Users, Award, ChevronRight, Quote } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

interface AboutPageProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
  onNavigate: (path: string) => void;
}

interface TeamMember {
  name: string;
  role: string;
  category: string;
  initials: string;
  specialty: string;
  bio: string;
  image?: string;
  imagePosition?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Geoffrey Anyona',
    role: 'Founder & Forensics Director',
    category: 'Founder',
    initials: 'GA',
    image: '/images/geoffrey-founder.jpg',
    specialty: 'Strategic Communication & Forensics',
    bio: 'Debater, public speaker, writer, and Founder of The Global Orators Project. Dedicated to the conviction that a generation that can speak must also learn to think, extending from youth debate mentorship to corporate communications training.'
  },
  {
    name: 'Tyrese King’ori Nyawira',
    role: 'Co-Founder & Head Debate Coach',
    category: 'Founder',
    initials: 'TN',
    image: '/images/tyrese.jpg',
    imagePosition: 'object-[center_15%]',
    specialty: 'WSDC & BP Debate · Adjudication',
    bio: 'Competitive debater, adjudicator, trainer, and debate academy co-founder. Mashujaa & Indaba V Novice Champion, Ikenga Open finalist, TOC East Africa judge, and assistant coach for Team Ecuador. Driven by the conviction that words change the trajectory of a life, he trains students in rigorous argumentation, rebuttal, and stage command.'
  },
  {
    name: 'Milo Brian',
    role: 'Debate Coach & Forensics Adjudicator',
    category: 'Debate Coach',
    initials: 'MB',
    image: '/images/milo-podium.jpg',
    specialty: 'British Parliamentary & Poetics',
    bio: 'Legal scholar, award-winning collegiate debater, and poet. Specializes in British Parliamentary debate frameworks, point-of-information tactics, and bridging legal forensics with poetic rhetorical power.'
  },
  {
    name: 'Obed Imbusi',
    role: 'Debate Coach & Tournament Strategist',
    category: 'Debate Coach',
    initials: 'OI',
    image: '/images/obed-arena.jpg',
    specialty: 'Arena Rebuttals & Policy Clash',
    bio: 'Championship finalist and elite collegiate debater. Prepares speakers for high-pressure tournament arenas, teaching policy modeling, strategic rebuttal architecture, and deep dialectical clash on continental circuits.'
  },
  {
    name: 'Valerie Wanjiku',
    role: 'Debate Coach & Storytelling Specialist',
    category: 'Debate Coach',
    initials: 'VW',
    image: '/images/valerie.jpg',
    imagePosition: 'object-[center_20%]',
    specialty: 'Structured Argument & Narrative Storytelling',
    bio: 'A debater and storyteller at heart, driven by the belief that African voices deserve center stage, for the richness of culture, wisdom, and life it carries, and for stories the world has yet to fully hear. Committed to the pursuit of structured argument and eloquent expression, not just to build tomorrow’s leaders, but to help shape a more profound, self-assured continent.'
  },
  {
    name: 'Liz Imani',
    role: 'Public Speaking Coach & Philosophy Fellow',
    category: 'Speaking Coach',
    initials: 'LI',
    image: '/images/imani-dialogue.jpg',
    specialty: 'Voice Resonance & Deconditioning',
    bio: 'Public speaker, philosopher, and debate fellow. Focuses on authentic vocal resonance, dismantling colonial cognitive conditioning, and empowering speakers to overcome fear and command the assembly floor.'
  },
  {
    name: 'Rachael',
    role: 'Public Speaking Coach & Vocal Presence Specialist',
    category: 'Speaking Coach',
    initials: 'RC',
    image: '/images/rachael.jpg',
    specialty: 'Vocal Presence & Executive Delivery',
    bio: 'Dedicated public speaking coach specializing in vocal presence, breathwork, diaphragm control, and delivery cadence. Helps young speakers and emerging leaders unlock confident, articulate stage command.'
  },
  {
    name: 'Qassim Musa',
    role: 'Tech Lead & Platforms Engineer',
    category: 'Technology',
    initials: 'QM',
    image: '/images/qassim-musa.jpg',
    specialty: 'Platform Architecture & Speech Tools',
    bio: 'Architects and engineers the Global Orators digital suite, drill studio tools, encrypted voice vaults, and interactive coaching portals to support Pan-African oratorical training across all devices.'
  },
  {
    name: 'Michelle Kinanga',
    role: 'Marketing, Branding & Social Media Specialist',
    category: 'Brand & Media',
    initials: 'MK',
    image: '/images/michelle.jpg',
    imagePosition: 'object-[center_25%]',
    specialty: 'Brand Identity & Digital Storytelling',
    bio: 'Directs brand identity, social media storytelling, and movement communications. Crafts documentary visual narratives and digital campaigns that amplify African voices across continental networks.'
  }
];

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
          <li className="text-slate-200 font-semibold" aria-current="page">About the Movement</li>
        </ol>
      </nav>

      {/* Editorial Hero Header */}
      <section className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl 2xl:max-w-[1440px] mx-auto border-b border-slate-800">
        <div className="max-w-3xl space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
            Chapter I • Intellectual Genesis & Movement Manifesto
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-100 tracking-tight leading-none">
            Words Shape Nations. <br />
            <span className="italic font-normal text-[#7A4B06] dark:text-[#E3B95C]">
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
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold mb-2">
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

        {/* Documentary Photo Dispatch: Proposition Deconstruction */}
        <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl my-10">
          <img 
            src="/images/geoffrey-panel-debate.jpg" 
            alt="Geoffrey Anyona and debate delegates analyzing proposition arguments at the International Sports & Debate Assembly" 
            className="w-full h-60 sm:h-80 md:h-96 object-cover object-[center_35%] filter contrast-[1.03]" 
            loading="lazy" 
          />
        </figure>
      </section>

      {/* Chapter 2: The Founder's Conviction & Leadership */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-7xl 2xl:max-w-[1440px] mx-auto border-b border-slate-800 text-left">
        <div className="mb-10 text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
            Chapter II • Leadership & Founding Conviction
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight mt-1">
            "A Generation That Can Speak Must Also Learn to Think."
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-normal">
            A founding manifesto on intellectual curiosity, critical discourse, and continental leadership from Geoffrey Anyona.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Dual Documentary Visuals of Founder */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
            <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex flex-col justify-between">
              <div className="h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
                <img 
                  src="/images/geoffrey-founder.jpg" 
                  alt="Geoffrey Anyona, Founder of The Global Orators Project, at the debate rostrum" 
                  className="w-full h-full object-cover object-[center_20%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                  loading="lazy" 
                />
              </div>
            </figure>

            <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex flex-col justify-between">
              <div className="h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
                <img 
                  src="/images/geoffrey-keynote.jpg" 
                  alt="Geoffrey Anyona delivering keynote address at the International Sports and Olympism Assembly in Maseru, Lesotho" 
                  className="w-full h-full object-cover object-[center_25%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                  loading="lazy" 
                />
              </div>
            </figure>
          </div>

          {/* Right Column: Founder's Bio & Conviction */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#C89630]/10 border border-[#C89630]/20 text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
                Founder's Dispatch
              </div>

              <blockquote className="space-y-3">
                <Quote className="w-8 h-8 text-brand-gold/40 shrink-0" />
                <p className="font-serif italic text-base sm:text-lg text-slate-100 leading-relaxed">
                  "Geoffrey Anyona is a debater, public speaker, writer and Founder of The Global Orators Project; an initiative built around a simple conviction: a generation that can speak must also learn to think."
                </p>
              </blockquote>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                <p>
                  His work centres on public speaking, debate, critical thinking, youth leadership and strategic communication, extending from the mentorship of young speakers to curated corporate communications training for professionals and organisations.
                </p>
                <p>
                  With a growing interest in international affairs and global discourse, Geoffrey is passionate about the ideas that shape societies and the voices that have the power to challenge them.
                </p>
                <p>
                  Through The Global Orators Project, he is working to build a generation that is not simply articulate, but aware, intellectually curious and courageous enough to participate in shaping its future.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/images/geoffrey-founder.jpg" 
                  alt="Geoffrey Anyona" 
                  className="w-10 h-10 rounded-full object-cover object-top border border-slate-700 shrink-0" 
                />
                <div>
                  <div className="font-serif font-bold text-slate-100 text-sm">Geoffrey Anyona</div>
                  <div className="text-[10px] text-slate-400 font-mono">Founder · Forensics Director · Writer</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#7A4B06] dark:text-[#E3B95C] px-3 py-1.5 rounded-lg bg-[#C89630]/10 border border-[#C89630]/20 font-semibold shrink-0">
                Nairobi • London • Global
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 3: Movement Directorate & Faculty */}
      <section id="team" className="py-12 sm:py-18 px-4 sm:px-8 max-w-7xl 2xl:max-w-[1440px] mx-auto border-b border-slate-800 text-left">
        <div className="mb-10 text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
            Chapter III • Directorate & Movement Faculty
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight mt-1">
            The Minds Behind the Movement
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-normal">
            Orators, debaters, strategists, and technologists committed to cultivating cognitive sovereignty and vocal courage across Africa.
          </p>
        </div>

        {/* 2-Column Responsive Grid on Mobile / 3-Column on Desktop (3x3 for 9 faculty members) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {teamMembers.map((member) => (
            <div 
              key={member.name}
              className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex flex-col justify-between group hover:border-[#C89630]/40 transition-colors"
            >
              <div>
                {/* Photo or Architectural Monogram */}
                <div className="h-44 sm:h-56 w-full overflow-hidden bg-slate-950 relative">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={`${member.name}, ${member.role}`}
                      className={`w-full h-full object-cover ${member.imagePosition || 'object-[center_20%]'} filter contrast-[1.03] group-hover:scale-102 transition-transform duration-500`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-[#C89630]/30 flex items-center justify-center shadow-inner group-hover:border-[#C89630] transition-colors">
                        <span className="font-serif font-black text-lg sm:text-xl text-brand-gold tracking-wider">
                          {member.initials}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 mt-2.5 text-center line-clamp-1">
                        {member.specialty}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-xs border border-slate-800 text-[9px] font-mono tracking-widest uppercase text-brand-gold font-bold">
                    {member.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 sm:p-5 space-y-2 text-left">
                  <div>
                    <h3 className="font-serif font-bold text-slate-100 text-sm sm:text-base leading-snug">
                      {member.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-mono mt-0.5">
                      {member.role}
                    </p>
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-normal">
                    {member.bio}
                  </p>
                </div>
              </div>

              {/* Card Footer Tag */}
              <div className="px-3.5 sm:px-5 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="truncate">{member.specialty}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Chapter 4: The Two Sovereign Pillars */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-7xl 2xl:max-w-[1440px] mx-auto border-b border-slate-800">
        <div className="mb-10 text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
            Chapter IV • The Structural Architecture
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
              <div className="w-10 h-10 rounded-xl bg-[#C89630]/15 text-brand-gold flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
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
                className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#7A4B06] dark:text-[#E3B95C] hover:underline"
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

      {/* Chapter 5: Pan-African Footprint */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-7xl 2xl:max-w-[1440px] mx-auto border-b border-slate-800">
        <div className="mb-8 text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
            Chapter V • Regional Hubs
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-100 tracking-tight mt-1">
            Continental & Global Footprint
          </h2>
        </div>

        {/* 2-Column Responsive Grid on Mobile / 4-Column on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#7A4B06] dark:text-[#E3B95C]">Nairobi, Kenya</div>
            <div className="font-serif font-bold text-xs sm:text-sm text-slate-100">Directorate & Head Chamber</div>
            <div className="text-[11px] text-slate-400">East African tournament delegations and shelter circle coordination.</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#7A4B06] dark:text-[#E3B95C]">Johannesburg, SA</div>
            <div className="font-serif font-bold text-xs sm:text-sm text-slate-100">Southern African Circuit</div>
            <div className="text-[11px] text-slate-400">Parliamentary varsity debaters and constitutional policy forums.</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#7A4B06] dark:text-[#E3B95C]">Dakar, Senegal</div>
            <div className="font-serif font-bold text-xs sm:text-sm text-slate-100">Francophone Division</div>
            <div className="text-[11px] text-slate-400">West African youth forensic exchange and bilingual debate preparation.</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#7A4B06] dark:text-[#E3B95C]">London & Global</div>
            <div className="font-serif font-bold text-xs sm:text-sm text-slate-100">Diaspora Liaison</div>
            <div className="text-[11px] text-slate-400">WUDC championship logistics and international foundation grants.</div>
          </div>
        </div>
      </section>

      {/* Chapter 6: Movement FAQs */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-4xl mx-auto border-b border-slate-800">
        <div className="mb-8 text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
            Chapter VI • Frequently Asked Questions
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
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
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
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-on-gold font-serif font-bold text-xs shadow-xl shadow-[#C89630]/25 flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C89630]"
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
