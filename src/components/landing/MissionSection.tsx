import React from 'react';
import { Quote } from 'lucide-react';
import { VoiceDispatchPlayer } from './VoiceDispatchPlayer';
import { RevealOnScroll } from '../common/MotionWrapper';

export const MissionSection: React.FC = () => {
  return (
    <section id="mission" className="py-14 sm:py-20 px-4 sm:px-8 max-w-5xl mx-auto border-b border-slate-800">
      <RevealOnScroll className="text-left space-y-3 mb-12">
        <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
          Chapter I • The Diagnosis & The Remedy
        </div>
        <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight max-w-2xl">
          What is the Root Crisis Facing African Society?
        </h2>
        <div className="w-16 h-0.5 bg-[#C89630]" />
      </RevealOnScroll>

      {/* Founder's Note: Geoffrey Anyona */}
      <RevealOnScroll delay={0.06} className="mb-10">
        <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#C89630]/40 transition-colors shadow-xl space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <picture>
              <source srcSet="/images/geoffrey-founder.webp" type="image/webp" />
              <img 
                src="/images/geoffrey-founder.jpg" 
                alt="Geoffrey Anyona, Founder and Forensics Director of The Global Orators Project" 
                className="w-12 h-12 rounded-full object-cover object-top border-2 border-[#C89630]/40 shrink-0" 
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div>
              <div className="font-serif font-bold text-slate-100 text-sm sm:text-base">Geoffrey Anyona</div>
              <div className="text-[10px] text-slate-400 font-mono">Founder & Forensics Director · The Global Orators Project</div>
            </div>
          </div>
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold px-2.5 py-1 rounded-md bg-[#C89630]/10 border border-[#C89630]/20 self-start sm:self-center">
            The Founding Conviction
          </div>
        </div>

        <blockquote className="space-y-2">
          <p className="font-serif italic text-sm sm:text-base text-slate-100 leading-relaxed">
            "The Global Orators Project is built around a simple conviction: a generation that can speak must also learn to think."
          </p>
        </blockquote>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          We are working to build a generation that is not simply articulate, but aware, intellectually curious, and courageous enough to participate in shaping its future. Our movement dismantles cognitive conditioning by combining parliamentary forensic discipline with authentic, trauma-informed vocal release.
        </p>
      </div>
    </RevealOnScroll>

    {/* Co-Founder's Note & Forensic Track Record: Tyrese King’ori Nyawira */}
    <RevealOnScroll delay={0.08} className="mb-10">
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#C89630]/40 transition-colors shadow-xl space-y-5 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <picture>
              <source srcSet="/images/tyrese-podium.webp" type="image/webp" />
              <img
                src="/images/tyrese-podium.jpg"
                alt="Tyrese King’ori Nyawira, Co-Founder and Head Debate Coach of The Global Orators Project"
                className="w-12 h-12 rounded-full object-cover object-[center_15%] border-2 border-[#C89630]/40 shrink-0"
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div>
              <div className="font-serif font-bold text-slate-100 text-sm sm:text-base">Tyrese King’ori Nyawira</div>
              <div className="text-[10px] text-slate-400 font-mono">Co-Founder & Head Debate Coach · The Global Orators Project</div>
            </div>
          </div>
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold px-2.5 py-1 rounded-md bg-[#C89630]/10 border border-[#C89630]/20 self-start sm:self-center">
            Co-Founding Conviction
          </div>
        </div>

        <blockquote className="space-y-3">
          <p className="font-serif italic text-sm sm:text-base text-slate-100 leading-relaxed">
            "I believe words can change the trajectory of a life. A voice can awaken courage, challenge injustice, inspire dreams, and give someone the confidence to believe that they are capable of more. I value speaking because it is not simply about being heard—it is about using your voice to move minds, touch lives, and create change. To speak is to have the opportunity to shape the world, one person and one idea at a time."
          </p>
        </blockquote>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          Competitive debater, adjudicator, trainer, and debate academy co-founder. Mashujaa & Indaba V Novice Champion, Ikenga Open finalist, TOC East Africa judge, and assistant coach for Team Ecuador. Tyrese directs forensic preparation across British Parliamentary and World Schools formats, training orators to command global stages with substance and conviction.
        </p>

        {/* Documentary Photo Essay: Tyrese at Rostrum, Laureate Medals, and Championship Delegation */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold mb-3">
            Forensic Track Record · Podium Command & Championship Laurels
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Visual 1: Rostrum Command (Tyrese.jpeg) */}
            <figure className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between">
              <div className="h-44 sm:h-52 w-full overflow-hidden">
                <picture>
                  <source srcSet="/images/tyrese-podium.webp" type="image/webp" />
                  <img
                    src="/images/tyrese-podium.jpg"
                    alt="Tyrese King’ori Nyawira delivering address at the City of Nairobi rostrum"
                    className="w-full h-full object-cover object-[center_15%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
            </figure>

            {/* Visual 2: Solo Championship Laureate with Trophy & Medals (tyrese2.jpeg) */}
            <figure className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between">
              <div className="h-44 sm:h-52 w-full overflow-hidden">
                <picture>
                  <source srcSet="/images/tyrese-laureate.webp" type="image/webp" />
                  <img
                    src="/images/tyrese-laureate.jpg"
                    alt="Tyrese King’ori Nyawira, Championship Laureate holding trophy and gold medals"
                    className="w-full h-full object-cover object-[center_20%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
            </figure>

            {/* Visual 3: Championship Delegation Victory (tyrese1.jpeg) */}
            <figure className="col-span-2 sm:col-span-1 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between">
              <div className="h-44 sm:h-52 w-full overflow-hidden">
                <picture>
                  <source srcSet="/images/tyrese-delegation.webp" type="image/webp" />
                  <img
                    src="/images/tyrese-delegation.jpg"
                    alt="Tyrese King’ori Nyawira and debate champions celebrating tournament victory with trophies and medals"
                    className="w-full h-full object-cover object-center filter contrast-[1.03] hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </RevealOnScroll>

    {/* Editorial 2-Column Split */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-left">
      {/* Pillar 1 */}
      <RevealOnScroll delay={0.06} className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
          The First Pillar • Deconditioning & Pan-African Enlightenment
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
          Cognitive Sovereignty & Deconditioning
        </h3>

        <figure className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-sm my-3 group">
          <img 
            src="/images/geoffrey-contemplation.jpg" 
            alt="Geoffrey Anyona reflecting with pen in hand during an international debate assembly"
            className="w-full h-44 sm:h-52 object-cover object-[center_25%] filter contrast-[1.03] group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            loading="lazy"
            decoding="async"
            width={600}
            height={350}
          />
        </figure>

        <p className="font-serif text-sm sm:text-base text-slate-100 italic leading-snug">
          "A lack of information stemming from colonial social conditioning has conditioned the mentalities of our populace—creating social mediocrity that still struggles with ethnic division, western dependency, and self-doubt."
        </p>
        <p>
          When a generation is deprived of cognitive familiarity with the economic, political, and historical mechanisms governing their lives, leadership default becomes imitation. We settle for the status quo and wait for external validation.
        </p>
        <p>
          The primary mission of Global Orators is to dismantle this intellectual inertia. We teach young Africans to deconstruct policy, debate foundational constitutional and economic dilemmas, and manifest self-development through uncompromising action.
        </p>
      </RevealOnScroll>

      {/* Pillar 2: Speaking as Escapism & Catharsis */}
      <RevealOnScroll delay={0.12} className="h-full">
        <div id="escapism" className="bg-slate-900 border border-slate-800 hover:border-[#C89630]/40 transition-colors rounded-2xl p-5 sm:p-7 space-y-4 shadow-xs flex flex-col justify-between h-full">
          <div className="space-y-3.5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
              The Second Pillar • Mental Health & Voice
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
              Speaking as a Form of Escapism & Catharsis
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Growing up under millennial parentage and decades of patriarchal conditioning, emotional vulnerability has been branded as weakness. African boys were told never to cry; African girls were instructed to swallow their pain.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              The result has been a silent epidemic of anxiety and untreated trauma. There is a raw, physical catharsis that occurs when an individual stands up and speaks aloud the exact burden they carried in secrecy. When you hear a story that matches your own, the isolation shatters.
            </p>

            {/* Interactive Audio Player Component */}
            <VoiceDispatchPlayer />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs font-serif italic text-[#7A4B06] dark:text-[#E3B95C]">
            <Quote className="w-4 h-4 shrink-0" />
            <span>"To speak your truth is not a performance—it is your liberation."</span>
          </div>
        </div>
      </RevealOnScroll>
    </div>
    </section>
  );
};
