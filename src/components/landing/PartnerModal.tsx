import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Mail, Loader2, ArrowRight, X } from 'lucide-react';
import { inquiriesApi, InquiryResponse } from '../../services/apiClient';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: 'Academy' | 'Foundation';
}

export const PartnerModal: React.FC<PartnerModalProps> = ({ isOpen, onClose, branch }) => {
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [focus, setFocus] = useState('Institutional Speech Training & Tournament Sponsorship');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<InquiryResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSuccessData(null);
      setErrorMsg(null);
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await inquiriesApi.submit({
        organization: organization.trim(),
        email: email.trim(),
        branch,
        focus,
        message: notes.trim() || undefined
      });
      setSuccessData(res);
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      setErrorMsg(err.message || 'Unable to submit inquiry via network. Please use direct email below.');
    } finally {
      setLoading(false);
    }
  };

  const mailtoUrl = `mailto:director@globalorators.org?subject=${encodeURIComponent(
    `Partnership Inquiry: ${organization || 'Institution'} (${branch})`
  )}&body=${encodeURIComponent(
    `Organization: ${organization}\nEmail: ${email}\nBranch: ${branch}\nFocus: ${focus}\nNotes: ${notes}`
  )}`;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-dialog-title"
      ref={modalRef}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 id="partner-dialog-title" className="text-base font-serif font-bold text-slate-100">
              Partner with Global Orators {branch}
            </h3>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              {branch === 'Academy' ? 'Competitive & Corporate Wing' : 'Philanthropic & Community Fellowship'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
            aria-label="Close dialog"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success State */}
        {successData ? (
          <div className="space-y-4 py-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg text-slate-100">
                Inquiry Successfully Logged
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                Thank you for taking a stand with the movement. Our {branch} director has received your dispatch.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1.5 font-mono">
              <div className="text-slate-400 flex justify-between">
                <span>Reference ID:</span>
                <span className="text-[#A06C18] dark:text-[#E3B95C] font-bold">{successData.inquiryId}</span>
              </div>
              <div className="text-slate-400 flex justify-between">
                <span>Institution:</span>
                <span className="text-slate-200">{successData.organization}</span>
              </div>
              <div className="text-slate-400 flex justify-between">
                <span>Contact Email:</span>
                <span className="text-slate-200">{successData.email}</span>
              </div>
              <div className="text-slate-400 flex justify-between">
                <span>Expected Response:</span>
                <span className="text-emerald-500">Within 1 business day</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
              <a
                href={mailtoUrl}
                className="py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Director Directly</span>
              </a>
            </div>
          </div>
        ) : (
          /* Form State */
          <div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-normal">
              {branch === 'Academy'
                ? 'Equip your university, school, or corporate leadership council with premier debate training, keynote coaching, and accredited speech syllabi.'
                : 'Connect your children\'s home, orphanage, or charitable shelter with our grant-funded cathartic voice circles, or contribute directly to our non-profit fellowship grant pool.'}
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div>{errorMsg}</div>
                  <a href={mailtoUrl} className="underline font-bold mt-1 inline-block text-red-200">
                    Click here to send directly via email &rarr;
                  </a>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label 
                  htmlFor="partner-org-name" 
                  className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1"
                >
                  Organization / Institution Name *
                </label>
                <input
                  id="partner-org-name"
                  ref={firstInputRef}
                  required
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Alliance High School or Hope Children's Home"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-[#C89630] focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
                />
              </div>

              <div>
                <label 
                  htmlFor="partner-email" 
                  className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1"
                >
                  Contact Email *
                </label>
                <input
                  id="partner-email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@organization.org"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-[#C89630] focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
                />
              </div>

              <div>
                <label 
                  htmlFor="partner-focus" 
                  className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1"
                >
                  Collaboration Focus *
                </label>
                <select
                  id="partner-focus"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-[#C89630] focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
                >
                  <option value="Institutional Speech Training & Tournament Sponsorship">Institutional Speech Training & Tournament Sponsorship</option>
                  <option value="Charity / Children's Home Voice Healing Circles">Charity / Children's Home Voice Healing Circles</option>
                  <option value="Philanthropic Grant or Foundation Donation">Philanthropic Grant or Foundation Donation</option>
                  <option value="Corporate Executive Oratory Masterclass">Corporate Executive Oratory Masterclass</option>
                </select>
              </div>

              <div>
                <label 
                  htmlFor="partner-notes" 
                  className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1"
                >
                  Objectives / Notes (Optional)
                </label>
                <textarea
                  id="partner-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Briefly describe your timeline, student cohort size, or grant objectives..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-[#C89630] focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#C89630] text-slate-950 text-xs font-serif font-bold hover:bg-[#B37D22] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Logging Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Inquiry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
