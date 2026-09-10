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
            <div className="text-[10px] font-mono tracking-widest text-[#C85A32] uppercase font-bold">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-4 shadow-sm">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed font-serif">
                "Growing up in an abusive home, silence was my survival mechanism. I carried guilt that wasn't mine for fifteen years. Global Orators Foundation gave me the first safe room in my life to speak without fear. The moment I said it aloud, it lost its grip over me. Today, I coach younger kids in the children's home on how to tell their stories."
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-serif font-bold text-slate-100">Nia Muthoni</div>
                  <div className="text-[10px] text-slate-400 font-mono">Foundation Fellow • Youth Advocate (Consent Documented)</div>
                </div>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/20">
                  Foundation Track
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-4 shadow-sm">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed font-serif">
                "As an African young man, men in my family taught me that crying or speaking about mental anxiety was weakness. I developed severe panic attacks before any speech. Learning that speaking is catharsis—and that emotional vulnerability requires ten times more bravery than suppression—saved my mental health and my university career."
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-serif font-bold text-slate-100">Tariq Bakari</div>
                  <div className="text-[10px] text-slate-400 font-mono">Academy Scholar • Pan-African Debate Finalist</div>
                </div>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Academy Track
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Conversion Section: Specific Operational Actions */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 border-b border-slate-800 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="text-[10px] font-mono tracking-widest text-[#C85A32] uppercase font-bold">
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
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#C85A32] hover:bg-[#D46238] text-[#FFFFFF] font-serif font-bold text-xs shadow-xl shadow-[#C85A32]/25 flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C85A32] focus-visible:outline-hidden"
            >
              <span>Start Your Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpenPartner('Foundation')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-100 font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-slate-700 focus-visible:ring-2 focus-visible:ring-[#C85A32] focus-visible:outline-hidden"
            >
              <span>Book Institutional Call / Partnership</span>
            </button>
          </div>

          <div className="pt-2 text-[11px] font-mono text-slate-400">
            Direct Director Governance Inquiries: <a href="mailto:director@globalorators.org" className="text-[#C85A32] underline hover:text-[#D46238]">director@globalorators.org</a>
          </div>
        </div>
      </section>
    </>
  );
};
