import React from 'react';
import { ArrowRight, Volume2, ShieldAlert, Heart, Mic, Activity, Quote } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { VoiceDispatchPlayer } from '../components/landing/VoiceDispatchPlayer';

interface EscapismPageProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onNavigate: (path: string) => void;
}

export const EscapismPage: React.FC<EscapismPageProps> = ({
  onStartOnboarding,
  onNavigate
}) => {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Speaking as Escapism: The Physiology and Philosophy of Vocal Catharsis',
    'description': 'How vocal expression breaks patriarchal conditioning and generational silence for African youth recovering from trauma.',
    'publisher': {
      '@type': 'Organization',
      'name': 'Global Orators Project'
    }
  };

  const protocols = [
    {
      num: '01',
      title: 'Diaphragmatic Breath & Somatic Grounding',
      desc: 'Anxiety and unvoiced trauma lock the diaphragm into shallow chest breathing. We train the 4-7-8 somatic breath to trigger the vagus nerve and steady heart rate before speech.'
    },
    {
      num: '02',
      title: 'The Cathartic Vocal Journal',
      desc: 'Encrypted 1-minute audio reflections where speakers name the exact burden carried in secrecy. Hearing your own voice speak the fear dissolves subconscious shame.'
    },
    {
      num: '03',
      title: 'Resonance Drills & Pace Calibration',
      desc: 'Trauma survivors frequently speak with rapid, defensive pacing (180+ WPM). We recalibrate resonance to a commanding, grounded cadence (120–140 WPM).'
    },
    {
      num: '04',
      title: 'The Witness Circle',
      desc: 'Speaking truth before peers who have survived comparable hardships. When another person nods and says "I know that silence," the isolation of trauma shatters.'
    }
  ];

  return (
    <div className="text-left">
      <SEOHead
        title="Speaking as Escapism & Catharsis | Vocal Healing for African Youth"
        description="Explore how vocal expression dismantles generational silence, panic, and trauma. Global Orators safe speech circles, breathwork, and acoustic voice dispatches."
        canonicalPath="/escapism"
        jsonLd={articleSchema}
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
          <li className="text-slate-200 font-semibold" aria-current="page">Speaking as Escapism & Catharsis</li>
        </ol>
      </nav>

      {/* Hero Header */}
      <section className="py-10 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="max-w-3xl space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-[#A06C18] dark:text-[#E3B95C] uppercase font-bold">
            Chapter II • The Physiology of Speech & Mental Health
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-100 tracking-tight leading-none">
            Speaking as Escapism: The Liberation of Truth.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed pt-2">
            Growing up under patriarchal conditioning, African boys were told never to weep and girls were instructed to swallow their grief. The result is a quiet epidemic of anxiety. There is a visceral, physiological release that occurs when an individual speaks aloud the burden they carried in secrecy.
          </p>
        </div>
      </section>

      {/* Chapter 1: The Anatomy of Silence */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-5xl mx-auto border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] font-bold mb-2">
              The Somatic Toll
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 tracking-tight leading-snug">
              What Happens When Trauma Is Kept Silent?
            </h2>
          </div>
          <div className="md:col-span-8 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              When an experience of abuse, neglect, or overwhelming grief is suppressed, the body does not simply forget it. It stores it as physical tension: tight throat muscles, erratic breathing patterns, social anxiety, and chronic panic before public address.
            </p>
            <p>
              In many traditional homes, vulnerability was treated as weakness. Young people learned that survival required masking. But silence does not heal—it metastasizes into self-doubt, isolation, and depression.
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-serif italic text-[#A06C18] dark:text-[#E3B95C]">
              "To speak your truth is not a performance—it is your somatic liberation."
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 2: Interactive Voice Dispatch Player */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-4xl mx-auto border-b border-slate-800">
        <div className="text-left mb-6">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] font-bold">
            Acoustic Evidence
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-100 tracking-tight mt-1">
            Listen to the Breakthrough
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg font-normal">
            An authentic demonstration of pause drills, vocal resonance, and pacing recorded during a Foundation speech circle.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <VoiceDispatchPlayer />
        </div>
      </section>

      {/* Chapter 3: The 4 Therapeutic Vocal Protocols */}
      <section className="py-12 sm:py-18 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800">
        <div className="mb-10 text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] font-bold">
            Methodology
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight mt-1">
            The 4 Vocal Release Protocols
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-normal">
            How our facilitators guide participants from somatic panic to calm oratorical composure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left">
          {protocols.map((proto) => (
            <div key={proto.num} className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-xs font-mono font-bold text-[#A06C18] dark:text-[#E3B95C]">
                Protocol {proto.num}
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-100">
                {proto.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {proto.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Explicit Clinical Disclaimer */}
      <section className="py-10 px-4 sm:px-8 max-w-4xl mx-auto border-b border-slate-800">
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-left">
          <ShieldAlert className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed space-y-1">
            <div className="font-serif font-bold text-slate-100">
              Clinical Boundary & Medical Safeguarding Notice
            </div>
            <p className="text-[11px] text-slate-400">
              Global Orators vocal workshops and healing speech circles are educational and peer-mentorship programs designed for emotional expression and speech mastery. They are not licensed medical treatment, clinical psychotherapy, or psychiatric crisis care. If you or someone you know is experiencing acute psychiatric distress, please contact emergency health services or a licensed mental health professional.
            </p>
          </div>
        </div>
      </section>

      {/* Conversion Actions */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-[10px] font-mono tracking-widest text-[#A06C18] dark:text-[#E3B95C] uppercase font-bold">
            Join a Supportive Cohort
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight">
            Release the Silence. Speak Your Truth.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto font-normal">
            Foundation fellowships are 100% grant-funded and free of charge. You do not have to carry the burden alone.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => onStartOnboarding('Foundation')}
              className="px-6 py-3.5 rounded-xl bg-[#2E684D] hover:bg-[#387D5D] text-[#FFFFFF] font-serif font-bold text-xs shadow-xl shadow-[#2E684D]/25 flex items-center gap-2 cursor-pointer"
            >
              <span>Apply for Foundation Fellowship</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
