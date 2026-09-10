import React from 'react';
import { ArrowRight, BookOpen, MessageSquare, Quote, Sparkles } from 'lucide-react';

interface SpeakerSpotlightProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
}

export const SpeakerSpotlight: React.FC<SpeakerSpotlightProps> = ({ onStartOnboarding }) => {
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-8 bg-slate-950/60 border-b border-slate-800 text-left">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-2">
          <div className="text-[10px] font-mono tracking-widest text-[#A06C18] dark:text-[#E3B95C] uppercase font-bold">
            Speaker Spotlight • The Living Movement
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-slate-100 tracking-tight leading-tight">
            Imani: The Architecture of Sovereign Voice.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            Public speaker, philosopher, and orator fellow demonstrating how structured forensic rigor and intellectual vulnerability empower the next generation of African thinkers.
          </p>
        </div>

        {/* Feature Grid: Narrative Manifesto & Dual Documentary Photos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Imani's Philosophy Card */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#C89630]/10 border border-[#C89630]/20 text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] font-bold">
                Philosophy & Rhetoric
              </div>

              <blockquote className="space-y-3">
                <Quote className="w-8 h-8 text-[#C89630]/40 shrink-0" />
                <p className="font-serif italic text-sm sm:text-base text-slate-100 leading-relaxed">
                  "A public speaker and philosopher passionately enthusiastic about giving a voice to the leaders of tomorrow, believing in the power of structured arguments and eloquent communication to better shape associations amongst future leaders."
                </p>
              </blockquote>

              <p className="text-xs text-slate-300 leading-relaxed font-normal pt-2 border-t border-slate-800">
                At Global Orators, Imani embodies the bridge between contemplative research and assembly-floor debate. Her work focuses on dismantling hesitation, mastering dialectics, and shaping youth discourse rooted in moral clarity and continental self-determination.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-serif font-bold text-slate-100 text-sm">Imani</div>
                <div className="text-[10px] text-slate-400 font-mono">Orator Fellow · Parliamentary Debater</div>
              </div>
              <button
                onClick={() => onStartOnboarding('Academy')}
                className="px-4 py-2 rounded-lg bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Train With Fellow Orators</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Right Column: Dual Authentic Documentary Images */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Card 1: Debate Preparation (imani-prep.jpg) */}
            <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex flex-col justify-between">
              <div className="h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
                <img 
                  src="/images/imani-prep.jpg" 
                  alt="Imani studying and drafting philosophical debate arguments in her notebook" 
                  className="w-full h-full object-cover object-[center_20%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                  loading="lazy" 
                />
              </div>
              <figcaption className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] font-bold">
                  <span>Argument Architecture</span>
                  <span className="text-slate-500 font-normal">Fahari Session</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug font-normal">
                  Imani drafting motion points and counter-theses prior to the parliamentary division.
                </p>
              </figcaption>
            </figure>

            {/* Card 2: Assembly Circle Dialogue (imani-dialogue.jpg) */}
            <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex flex-col justify-between">
              <div className="h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
                <img 
                  src="/images/imani-dialogue.jpg" 
                  alt="Imani passionately dialoguing and smiling with fellow debaters during an assembly circle" 
                  className="w-full h-full object-cover object-[center_25%] filter contrast-[1.03] hover:scale-102 transition-transform duration-500" 
                  loading="lazy" 
                />
              </div>
              <figcaption className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#A06C18] dark:text-[#E3B95C] font-bold">
                  <span>Forensic Dialogue</span>
                  <span className="text-slate-500 font-normal">Nairobi Circle</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug font-normal">
                  Collaborative peer critique: sharpening rhetoric through respectful interrogation.
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};
