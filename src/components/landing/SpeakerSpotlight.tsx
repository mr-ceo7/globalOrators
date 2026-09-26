import React from 'react';
import { ArrowRight, Quote } from 'lucide-react';

interface SpeakerSpotlightProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
}

export const SpeakerSpotlight: React.FC<SpeakerSpotlightProps> = ({ onStartOnboarding }) => {
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-8 bg-slate-950/60 border-b border-slate-800 text-left">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-14 sm:space-y-20">
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-2">
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
            Speaker Spotlight • The Living Movement
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-slate-100 tracking-tight leading-tight">
            Voices of Conviction: Rigor, Rhetoric, and Courage.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            Debaters, legal scholars, and philosophers defining the Global Orators standard—transforming classrooms, courtrooms, and championship podiums across the continent.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* Spotlight 1: Imani (Public Speaker & Philosopher) */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
              Dispatch 01 · Philosophy & Voice
            </span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Imani's Philosophy Card */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#C89630]/10 border border-[#C89630]/20 text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
                  Philosophy & Rhetoric
                </div>

                <blockquote className="space-y-3">
                  <Quote className="w-8 h-8 text-brand-gold/40 shrink-0" />
                  <p className="font-serif italic text-sm sm:text-base text-slate-100 leading-relaxed">
                    "A public speaker and philosopher passionately enthusiastic about giving a voice to the leaders of tomorrow, believing in the power of structured arguments and eloquent communication to better shape associations amongst future leaders."
                  </p>
                </blockquote>

                <p className="text-xs text-slate-300 leading-relaxed font-normal pt-2 border-t border-slate-800">
                  At Global Orators, Imani embodies the bridge between contemplative research and assembly-floor debate. Her work focuses on dismantling hesitation, mastering dialectics, and shaping youth discourse rooted in moral clarity and continental self-determination.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <picture>
                    <source srcSet="/images/hero-orator.webp" type="image/webp" />
                    <img 
                      src="/images/hero-orator.jpg" 
                      alt="Imani, Public Speaker and Orator Fellow" 
                      className="w-10 h-10 rounded-full object-cover object-top border border-slate-700 shrink-0" 
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                  <div>
                    <div className="font-serif font-bold text-slate-100 text-sm">Imani</div>
                    <div className="text-[10px] text-slate-400 font-mono">Public Speaker & Philosopher · Orator Fellow</div>
                  </div>
                </div>
                <button
                  onClick={() => onStartOnboarding('Academy')}
                  className="px-4 py-2 rounded-lg bg-[#C89630] hover:bg-[#B37D22] text-[#181B1F] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <span>Train With Orators</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Right Column: Dual Authentic Documentary Images for Imani */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Card 1: Debate Preparation (imani-prep.jpg) */}
              <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl h-64 sm:h-80 w-full">
                <picture>
                  <source srcSet="/images/imani-prep.webp" type="image/webp" />
                  <img 
                    src="/images/imani-prep.jpg" 
                    alt="Imani studying and drafting philosophical debate arguments in her notebook" 
                    className="w-full h-full object-cover object-[center_20%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                    loading="lazy" 
                    decoding="async"
                    width={500}
                    height={350}
                  />
                </picture>
              </figure>

              {/* Card 2: Assembly Circle Dialogue (imani-dialogue.jpg) */}
              <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl h-64 sm:h-80 w-full">
                <picture>
                  <source srcSet="/images/imani-dialogue.webp" type="image/webp" />
                  <img 
                    src="/images/imani-dialogue.jpg" 
                    alt="Imani passionately dialoguing and smiling with fellow debaters during an assembly circle" 
                    className="w-full h-full object-cover object-[center_25%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                    loading="lazy" 
                    decoding="async"
                    width={500}
                    height={350}
                  />
                </picture>
              </figure>
            </div>
          </div>
        </div>

        {/* Architectural Divider */}
        <div className="border-t border-slate-800/80" />

        {/* ========================================================================= */}
        {/* Spotlight 2: Milo Brian (Legal Scholar, Award-Winning Debater & Poet) */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">
              Dispatch 02 · Law, Forensics & Poetics
            </span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Milo's Philosophy Card */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">
                  Jurisprudence & Debate
                </div>

                <blockquote className="space-y-3">
                  <Quote className="w-8 h-8 text-emerald-500/40 shrink-0" />
                  <p className="font-serif italic text-sm sm:text-base text-slate-100 leading-relaxed">
                    "Milo, among other things, is a legal scholar, award winning debater, poet and a firm believer in not limiting oneself regardless of the underlying circumstances."
                  </p>
                </blockquote>

                <p className="text-xs text-slate-300 leading-relaxed font-normal pt-2 border-t border-slate-800">
                  Milo Brian channels legal precision and poetic cadence to dismantle institutional complacency. In the heat of British Parliamentary division, he demonstrates how unyielding logic paired with emotional resonance turns abstract constitutional justice into urgent continental reality.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <picture>
                    <source srcSet="/images/milo-podium.webp" type="image/webp" />
                    <img 
                      src="/images/milo-podium.jpg" 
                      alt="Milo Brian, Legal Scholar and Parliamentary Debater" 
                      className="w-10 h-10 rounded-full object-cover object-top border border-slate-700 shrink-0" 
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                  <div>
                    <div className="font-serif font-bold text-slate-100 text-sm">Milo Brian</div>
                    <div className="text-[10px] text-slate-400 font-mono">Legal Scholar · Debater & Poet</div>
                  </div>
                </div>
                <button
                  onClick={() => onStartOnboarding('Academy')}
                  className="px-4 py-2 rounded-lg bg-[#C89630] hover:bg-[#B37D22] text-[#181B1F] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <span>Join Debate Squad</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Right Column: Dual Authentic Documentary Images for Milo */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Card 1: Championship Podium (milo-podium.jpg) */}
              <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl h-64 sm:h-80 w-full">
                <picture>
                  <source srcSet="/images/milo-podium.webp" type="image/webp" />
                  <img 
                    src="/images/milo-podium.jpg" 
                    alt="Milo Brian delivering an award-winning speech at the podium with microphone" 
                    className="w-full h-full object-cover object-[center_15%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                    loading="lazy" 
                    decoding="async"
                    width={500}
                    height={350}
                  />
                </picture>
              </figure>

              {/* Card 2: Poetics & Case Construction (milo-prep.jpg) */}
              <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl h-64 sm:h-80 w-full">
                <picture>
                  <source srcSet="/images/milo-prep.webp" type="image/webp" />
                  <img 
                    src="/images/milo-prep.jpg" 
                    alt="Milo Brian reviewing debate frameworks and poetry in front of a green chalkboard" 
                    className="w-full h-full object-cover object-[center_30%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                    loading="lazy" 
                    decoding="async"
                    width={500}
                    height={350}
                  />
                </picture>
              </figure>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Spotlight 3: Valerie Wanjiku (Debate Coach & Storytelling Specialist) */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
              Dispatch 03 · Narrative Forensics & African Voices
            </span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Valerie's Philosophy Card */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#C89630]/10 border border-[#C89630]/20 text-[10px] font-mono uppercase tracking-widest text-[#7A4B06] dark:text-[#E3B95C] font-bold">
                  Storytelling & Forensics
                </div>

                <blockquote className="space-y-3">
                  <Quote className="w-8 h-8 text-brand-gold/40 shrink-0" />
                  <p className="font-serif italic text-sm sm:text-base text-slate-100 leading-relaxed">
                    "A debater and storyteller at heart, driven by the belief that African voices deserve center stage, for the richness of culture, wisdom, and life it carries, and for stories the world has yet to fully hear. Committed to the pursuit of structured argument and eloquent expression, not just to build tomorrow’s leaders, but to help shape a more profound, self-assured continent."
                  </p>
                </blockquote>

                <p className="text-xs text-slate-300 leading-relaxed font-normal pt-2 border-t border-slate-800">
                  Valerie Wanjiku bridges structured parliamentary argument with authentic narrative courage. She trains speakers to anchor intricate policy debate in lived human reality, proving that oratorical mastery and cultural conviction belong at the very center of continental discourse.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <picture>
                    <source srcSet="/images/valerie.webp" type="image/webp" />
                    <img 
                      src="/images/valerie.jpg" 
                      alt="Valerie Wanjiku, Debate Coach and Storytelling Specialist" 
                      className="w-10 h-10 rounded-full object-cover object-[center_20%] border border-slate-700 shrink-0" 
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                  <div>
                    <div className="font-serif font-bold text-slate-100 text-sm">Valerie Wanjiku</div>
                    <div className="text-[10px] text-slate-400 font-mono">Debate Coach · Storytelling Specialist</div>
                  </div>
                </div>
                <button
                  onClick={() => onStartOnboarding('Academy')}
                  className="px-4 py-2 rounded-lg bg-[#C89630] hover:bg-[#B37D22] text-[#181B1F] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <span>Train With Valerie</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Right Column: Dual Authentic Documentary Images for Valerie */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Card 1: Assembly Rostrum (valerie-assembly.jpg) */}
              <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl h-64 sm:h-80 w-full">
                <picture>
                  <source srcSet="/images/valerie-assembly.webp" type="image/webp" />
                  <img 
                    src="/images/valerie-assembly.jpg" 
                    alt="Valerie Wanjiku addressing the continental assembly forum at the rostrum in Maseru, Lesotho" 
                    className="w-full h-full object-cover object-[center_20%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                    loading="lazy" 
                    decoding="async" 
                    width={500}
                    height={350}
                  />
                </picture>
              </figure>

              {/* Card 2: Podium Delivery & Forensics (valerie-podium.jpg) */}
              <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl h-64 sm:h-80 w-full">
                <picture>
                  <source srcSet="/images/valerie-podium.webp" type="image/webp" />
                  <img 
                    src="/images/valerie-podium.jpg" 
                    alt="Valerie Wanjiku in oratorical delivery at the International Sports and Olympism podium" 
                    className="w-full h-full object-cover object-[center_25%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                    loading="lazy" 
                    decoding="async" 
                    width={500}
                    height={350}
                  />
                </picture>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

