import React from 'react';
import { Quote } from 'lucide-react';
import { VoiceDispatchPlayer } from './VoiceDispatchPlayer';

export const MissionSection: React.FC = () => {
  return (
    <section id="mission" className="py-14 sm:py-20 px-4 sm:px-8 max-w-5xl mx-auto border-b border-slate-800">
      <div className="text-left space-y-3 mb-12">
        <div className="text-[10px] font-mono tracking-widest text-[#A06C18] dark:text-[#E3B95C] uppercase font-bold">
          Chapter I • The Diagnosis & The Remedy
        </div>
        <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight max-w-2xl">
          What is the Root Crisis Facing African Society?
        </h2>
        <div className="w-16 h-0.5 bg-[#C89630]" />
      </div>

      {/* Editorial 2-Column Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-left">
        {/* Pillar 1 */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] font-bold">
            The First Pillar • Deconditioning & Pan-African Enlightenment
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
            Cognitive Sovereignty & Deconditioning
          </h3>

          <figure className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-sm my-3">
            <img 
              src="/images/sovereign-scholars.jpg" 
              alt="Young African university scholars in debate discussion over policy papers in archive library"
              className="w-full h-44 sm:h-52 object-cover object-center filter contrast-[1.05]"
              loading="lazy"
            />
            <figcaption className="px-3.5 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-300 uppercase tracking-wider font-semibold">Archive Seminar</span>
              <span className="text-[#C89630] uppercase tracking-widest">Pan-African Rigor</span>
            </figcaption>
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
        </div>

        {/* Pillar 2: Speaking as Escapism & Catharsis */}
        <div id="escapism" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] font-bold">
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

          <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs font-serif italic text-[#A06C18] dark:text-[#E3B95C]">
            <Quote className="w-4 h-4 shrink-0" />
            <span>"To speak your truth is not a performance—it is your liberation."</span>
          </div>
        </div>
      </div>
    </section>
  );
};
