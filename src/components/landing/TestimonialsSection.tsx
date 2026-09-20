import React from 'react';
import { ArrowRight, ShieldCheck, Mail } from 'lucide-react';

interface TestimonialsSectionProps {
  onStartOnboarding: (branch?: 'Academy' | 'Foundation') => void;
  onOpenPartner: (branch: 'Academy' | 'Foundation') => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  onStartOnboarding,
  onOpenPartner
}) => {
  return (
    <>
      {/* 6. Human Catharsis Testimonials */}
      <section id="testimonials" className="py-14 sm:py-20 px-4 sm:px-8 bg-slate-950 border-b border-slate-800 text-left">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
              Chapter IV • Living Proof & Safeguarding
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight mt-1">
              "The Day I Spoke, The Heaviness Lifted."
            </h2>
          </div>

          {/* Explicit Safeguarding & Clinical Disclaimer Banner */}
          <div className="mb-8 p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed space-y-1">
              <div className="font-serif font-bold text-slate-100">
                Safeguarding & Clinical Boundary Disclaimer
              </div>
              <p className="text-[11px] text-slate-400">
                Global Orators speech circles and debate workshops provide educational rhetoric, peer expression, and youth leadership mentorship. They are supportive spaces and <strong className="text-slate-200 font-semibold">do not replace licensed psychotherapy, psychiatric evaluation, or clinical mental health crisis care</strong>. All participant testimonials and dispatches appear with documented informed consent and verified privacy protections.
              </p>
            </div>
          </div>

          {/* Featured Community Storytelling Dispatch */}
          <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl mb-8">
            <picture>
              <source srcSet="/images/mentorship-circle.webp" type="image/webp" />
              <img 
                src="/images/mentorship-circle.jpg" 
                alt="African youth mentor coaching children and teenagers in a community storytelling circle in Nairobi" 
                className="w-full h-56 sm:h-72 md:h-80 object-cover object-[center_35%] filter contrast-[1.05]" 
                loading="lazy" 
                decoding="async"
                width={1000}
                height={500}
              />
            </picture>
            <figcaption className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-mono uppercase tracking-widest text-slate-400">
              <span className="text-[#7A4B06] dark:text-[#E3B95C] font-semibold">Community Storytelling Circle · Nairobi Shelter Network</span>
              <span>Informed Consent Documented • Peer Mentorship</span>
            </figcaption>
          </figure>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-4 shadow-sm">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed font-serif">
                "A public speaker and philosopher passionately enthusiastic about giving a voice to the leaders of tomorrow, believing in the power of structured arguments and eloquent communication to better shape associations amongst future leaders. Global Orators gave me the platform to sharpen rigorous rhetoric while creating safe rooms for others to find their voice."
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
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
                    <div className="font-serif font-bold text-slate-100">Imani</div>
                    <div className="text-[10px] text-slate-400 font-mono">Public Speaker & Philosopher • Orator Fellow</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C89630]/10 text-[#7A4B06] dark:text-[#E3B95C] border border-[#C89630]/20 shrink-0">
                  Orator Fellow
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-4 shadow-sm">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed font-serif">
                "A legal scholar, award-winning debater, poet and a firm believer in not limiting oneself regardless of the underlying circumstances. Global Orators provides the arena where forensic legal precision and poetic voice converge—empowering young advocates to dismantle institutional barriers and argue without fear or concession."
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <picture>
                    <source srcSet="/images/milo-podium.webp" type="image/webp" />
                    <img 
                      src="/images/milo-podium.jpg" 
                      alt="Milo Brian, Legal Scholar and Debater" 
                      className="w-10 h-10 rounded-full object-cover object-top border border-slate-700 shrink-0" 
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                  <div>
                    <div className="font-serif font-bold text-slate-100">Milo Brian</div>
                    <div className="text-[10px] text-slate-400 font-mono">Legal Scholar, Award-Winning Debater & Poet</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  Academy Scholar
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Conversion Section: Specific Operational Actions */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 border-b border-slate-800 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="text-[10px] font-mono tracking-widest text-[#7A4B06] dark:text-[#E3B95C] uppercase font-bold">
            Applications & Partnerships
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight">
            Stand With the Movement.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto font-normal">
            Whether you are a student ready to master parliamentary debate, a children's shelter seeking healing voice circles, or an institution seeking accredited debate training: your voice belongs here.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onStartOnboarding()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-[#181B1F] font-serif font-bold text-xs shadow-xl shadow-[#C89630]/25 flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
            >
              <span>Start Your Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpenPartner('Foundation')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-100 font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-slate-700 focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
            >
              <span>Book Institutional Call / Partnership</span>
            </button>
          </div>

          <div className="pt-2 text-[11px] font-mono text-slate-400">
            Direct Director Governance Inquiries: <a href="mailto:director@globalorators.org" className="text-[#7A4B06] dark:text-[#E3B95C] underline hover:text-[#B37D22]">director@globalorators.org</a>
          </div>
        </div>
      </section>
    </>
  );
};
