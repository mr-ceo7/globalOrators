import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Mail, Loader2, ArrowRight, X } from 'lucide-react';
import { inquiriesApi, InquiryResponse } from '../../services/apiClient';
import {
  sanitizeText,
  sanitizeMultiline,
  sanitizeEmail,
  validateEmail,
  validateName
} from '../../utils/sanitization';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSuccessData(null);
      setErrorMsg(null);
      setFieldErrors({});
      setTouched({});
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

  const validateField = (fieldName: string, value: string): string => {
    let err = '';
    if (fieldName === 'organization') {
      const res = validateName(value, 'Organization name', 2, 120);
      if (!res.isValid) err = res.error || '';
    } else if (fieldName === 'email') {
      const res = validateEmail(value);
      if (!res.isValid) err = res.error || '';
    }
    setFieldErrors(prev => ({ ...prev, [fieldName]: err }));
    return err;
  };

  const handleBlur = (fieldName: string, value: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const orgErr = validateField('organization', organization);
    const emailErr = validateField('email', email);
    setTouched({ organization: true, email: true });

    if (orgErr || emailErr) {
      return;
    }

    setLoading(true);

    try {
      const cleanOrg = sanitizeText(organization, 120);
      const cleanEmail = sanitizeEmail(email);
      const cleanNotes = sanitizeMultiline(notes, 1000);

      const res = await inquiriesApi.submit({
        organization: cleanOrg,
        email: cleanEmail,
        branch,
        focus: sanitizeText(focus, 120),
        message: cleanNotes || undefined
      });
      setSuccessData(res);
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      setErrorMsg(err.message || 'Unable to submit inquiry via network. Please use direct email below.');
    } finally {
      setLoading(false);
    }
  };

  const mailtoUrl = `mailto:director@globaloratorsproject.com?subject=${encodeURIComponent(
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
                <span className="text-[#7A4B06] dark:text-[#E3B95C] font-bold">{successData.inquiryId}</span>
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
                className="flex-1 py-2.5 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-on-gold font-serif font-bold text-xs transition-colors cursor-pointer"
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

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label 
                    htmlFor="partner-org-name" 
                    className="block text-[10px] uppercase font-mono tracking-widest text-slate-400"
                  >
                    Organization / Institution Name *
                  </label>
                  {touched.organization && fieldErrors.organization && (
                    <span id="partner-org-error" role="alert" className="text-[10px] font-mono text-rose-400">
                      {fieldErrors.organization}
                    </span>
                  )}
                </div>
                <input
                  id="partner-org-name"
                  name="organization"
                  ref={firstInputRef}
                  required
                  type="text"
                  autoComplete="organization"
                  maxLength={120}
                  spellCheck={false}
                  aria-required="true"
                  aria-invalid={touched.organization && !!fieldErrors.organization}
                  aria-describedby={touched.organization && fieldErrors.organization ? "partner-org-error" : undefined}
                  value={organization}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOrganization(val);
                    if (touched.organization) validateField('organization', val);
                  }}
                  onBlur={() => handleBlur('organization', organization)}
                  placeholder="e.g. Alliance High School or Hope Children's Home"
                  className={`w-full h-10 px-3.5 rounded-xl bg-slate-950 border text-xs text-slate-100 placeholder-slate-600 focus-visible:ring-2 focus-visible:outline-hidden transition-all ${
                    touched.organization && fieldErrors.organization
                      ? 'border-rose-500 focus:border-rose-400 focus-visible:ring-rose-500/30'
                      : 'border-slate-800 focus:border-[#C89630] focus-visible:ring-[#C89630]'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label 
                    htmlFor="partner-email" 
                    className="block text-[10px] uppercase font-mono tracking-widest text-slate-400"
                  >
                    Contact Email *
                  </label>
                  {touched.email && fieldErrors.email && (
                    <span id="partner-email-error" role="alert" className="text-[10px] font-mono text-rose-400">
                      {fieldErrors.email}
                    </span>
                  )}
                </div>
                <input
                  id="partner-email"
                  name="email"
                  required
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={254}
                  aria-required="true"
                  aria-invalid={touched.email && !!fieldErrors.email}
                  aria-describedby={touched.email && fieldErrors.email ? "partner-email-error" : undefined}
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);
                    if (touched.email) validateField('email', val);
                  }}
                  onBlur={() => handleBlur('email', email)}
                  placeholder="director@organization.org"
                  className={`w-full h-10 px-3.5 rounded-xl bg-slate-950 border text-xs text-slate-100 placeholder-slate-600 focus-visible:ring-2 focus-visible:outline-hidden transition-all ${
                    touched.email && fieldErrors.email
                      ? 'border-rose-500 focus:border-rose-400 focus-visible:ring-rose-500/30'
                      : 'border-slate-800 focus:border-[#C89630] focus-visible:ring-[#C89630]'
                  }`}
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
                  name="focus"
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
                <div className="flex items-center justify-between mb-1">
                  <label 
                    htmlFor="partner-notes" 
                    className="block text-[10px] uppercase font-mono tracking-widest text-slate-400"
                  >
                    Objectives / Notes (Optional)
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {notes.length}/1000
                  </span>
                </div>
                <textarea
                  id="partner-notes"
                  name="notes"
                  rows={2}
                  maxLength={1000}
                  spellCheck={true}
                  value={notes}
                  onChange={(e) => setNotes(sanitizeMultiline(e.target.value, 1000))}
                  placeholder="Briefly describe your timeline, student cohort size, or grant objectives..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-[#C89630] focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden transition-all"
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
                  className="flex-1 py-2.5 rounded-xl bg-[#C89630] text-on-gold text-xs font-serif font-bold hover:bg-[#B37D22] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
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
