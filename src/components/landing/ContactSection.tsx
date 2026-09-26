import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { RevealOnScroll } from '../common/MotionWrapper';
import { inquiriesApi, InquiryResponse } from '../../services/apiClient';
import { 
  sanitizeText, 
  sanitizeMultiline, 
  sanitizeEmail, 
  validateEmail, 
  validateName 
} from '../../utils/sanitization';

interface ContactSectionProps {
  id?: string;
  isStandalone?: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ 
  id = 'contact',
  isStandalone = false 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [branch, setBranch] = useState<'Academy' | 'Foundation'>('Academy');
  const [focus, setFocus] = useState('Parliamentary Forensics & High-Stakes Debate');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<InquiryResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (fieldName: string, value: string): string => {
    let err = '';
    if (fieldName === 'name') {
      const res = validateName(value, 'Contact name', 2, 80);
      if (!res.isValid) err = res.error || '';
    } else if (fieldName === 'email') {
      const res = validateEmail(value);
      if (!res.isValid) err = res.error || '';
    } else if (fieldName === 'message') {
      if (!value.trim()) {
        err = 'Please provide a message or statement of inquiry.';
      } else if (value.trim().length < 10) {
        err = 'Message must be at least 10 characters long.';
      }
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

    const nameErr = validateField('name', name);
    const emailErr = validateField('email', email);
    const msgErr = validateField('message', message);
    setTouched({ name: true, email: true, message: true });

    if (nameErr || emailErr || msgErr) {
      return;
    }

    setLoading(true);

    try {
      const cleanName = sanitizeText(name, 80);
      const cleanEmail = sanitizeEmail(email);
      const cleanOrg = sanitizeText(organization, 120) || 'Independent Applicant';
      const cleanMessage = sanitizeMultiline(message, 1500);

      // Submit directly to persisted backend inquiry store & trigger faculty notification
      const res = await inquiriesApi.submit({
        organization: `${cleanName} (${cleanOrg})`,
        email: cleanEmail,
        branch,
        focus: sanitizeText(focus, 120),
        message: cleanMessage
      });

      setSuccessData(res);
      // Reset input form
      setName('');
      setEmail('');
      setOrganization('');
      setMessage('');
      setFieldErrors({});
      setTouched({});
    } catch (err: unknown) {
      const displayErr = err instanceof Error ? err.message : 'Unable to dispatch inquiry. Please check network connection or reach us directly via email.';
      setErrorMsg(displayErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id={id} className={`bg-slate-950 text-slate-100 ${isStandalone ? 'py-16 sm:py-24' : 'py-20 sm:py-28 border-t border-slate-800'}`}>
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Editorial Section Kicker & Header */}
        <RevealOnScroll className="max-w-3xl mb-12 sm:mb-16 text-left">
          <div className="text-[10px] sm:text-xs font-mono tracking-widest uppercase text-[#7A4B06] dark:text-[#E3B95C] font-bold mb-3">
            Direct Faculty Dispatch & Platform Governance
          </div>
          <h2 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-slate-100 tracking-tight leading-tight mb-4">
            Contact Global Orators Faculty
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Reach out for institutional partnerships, tournament adjudications, or admissions counseling. Every inquiry enters our faculty queue with a 24-hour response protocol.
          </p>
          <div className="w-16 h-0.5 bg-[#C89630] mt-6"></div>
        </RevealOnScroll>

        {/* 2-Column Content Grid: Left Contact Dossier / Right Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start text-left">
          {/* Left Column: Direct Communication Channels & Regional Hubs */}
          <RevealOnScroll direction="up" delay={0.05} className="lg:col-span-5 space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <h3 className="font-serif font-bold text-lg text-slate-100 border-b border-slate-800 pb-3">
                Official Correspondence Channels
              </h3>

              <div className="space-y-5 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#C89630]/10 border border-[#C89630]/30 flex items-center justify-center shrink-0 text-brand-gold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Institutional & Strategic</div>
                    <a href="mailto:director@globaloratorsproject.com" className="font-medium text-slate-100 hover:text-brand-gold transition-colors">
                      director@globaloratorsproject.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Speaker Admissions & Protocols</div>
                    <a href="mailto:admissions@globaloratorsproject.com" className="font-medium text-slate-100 hover:text-emerald-400 transition-colors">
                      admissions@globaloratorsproject.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Platform Support & Coach OS</div>
                    <a href="mailto:support@globaloratorsproject.com" className="font-medium text-slate-100 hover:text-amber-400 transition-colors">
                      support@globaloratorsproject.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Dispatch Response Cadence</div>
                    <div className="text-slate-200">Monday – Saturday: 08:00 – 19:00 EAT (24-Hour Review)</div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Right Column: Direct Interactive Inquiry Form */}
          <RevealOnScroll direction="up" delay={0.1} className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
              {successData ? (
                <div className="py-8 text-center space-y-5 animate-fadeIn">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                      Inquiry Dispatched Successfully
                    </div>
                    <h3 className="font-serif font-black text-2xl text-slate-100">
                      We Have Received Your Dossier
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                      Your inquiry has been cataloged under reference code:
                    </p>
                    <div className="font-mono text-sm sm:text-base font-bold text-brand-gold bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 inline-block">
                      {successData.inquiryId || successData.id || successData.inquiry_id}
                    </div>
                    <p className="text-slate-400 text-xs max-w-md mx-auto pt-2">
                      An alert has been dispatched to Faculty Coach Qassim. You will receive an official response at <strong className="text-slate-200">{successData.email}</strong> within 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => setSuccessData(null)}
                    className="mt-4 px-6 py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="border-b border-slate-800 pb-4 mb-2">
                    <h3 className="font-serif font-bold text-xl text-slate-100">
                      Submit a Direct Faculty Inquiry
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Complete the transmission form below to route your inquiry directly to platform coaches.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>{errorMsg}</div>
                    </div>
                  )}

                  {/* 2-Column Responsive Inputs: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-medium mb-1.5">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (touched.name) validateField('name', e.target.value);
                        }}
                        onBlur={(e) => handleBlur('name', e.target.value)}
                        placeholder="e.g. Geoffrey Anyona"
                        className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-hidden transition-colors ${
                          touched.name && fieldErrors.name 
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
                            : 'border-slate-800 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]'
                        }`}
                      />
                      {touched.name && fieldErrors.name && (
                        <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-medium mb-1.5">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (touched.email) validateField('email', e.target.value);
                        }}
                        onBlur={(e) => handleBlur('email', e.target.value)}
                        placeholder="name@organization.com"
                        className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-hidden transition-colors ${
                          touched.email && fieldErrors.email 
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
                            : 'border-slate-800 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]'
                        }`}
                      />
                      {touched.email && fieldErrors.email && (
                        <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* 2-Column Responsive: Organization & Program Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-org" className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-medium mb-1.5">
                        Affiliated Campus / School (Optional)
                      </label>
                      <input
                        id="contact-org"
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g. Strathmore University / High School"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-branch" className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-medium mb-1.5">
                        Program Track
                      </label>
                      <select
                        id="contact-branch"
                        value={branch}
                        onChange={(e) => {
                          const val = e.target.value as 'Academy' | 'Foundation';
                          setBranch(val);
                          setFocus(val === 'Academy' ? 'Parliamentary Forensics & High-Stakes Debate' : 'Healing-Centered Rhetoric & Voice Sovereignty');
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] transition-colors cursor-pointer"
                      >
                        <option value="Academy">Global Orators Academy (Debate & Forensics)</option>
                        <option value="Foundation">Global Orators Foundation (Voice Sovereignty)</option>
                      </select>
                    </div>
                  </div>

                  {/* Focus Topic Selection */}
                  <div>
                    <label htmlFor="contact-focus" className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-medium mb-1.5">
                      Strategic Focus of Inquiry
                    </label>
                    <select
                      id="contact-focus"
                      value={focus}
                      onChange={(e) => setFocus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] transition-colors cursor-pointer"
                    >
                      <option value="Institutional Speech Training & Tournament Sponsorship">Institutional Speech Training & Tournament Sponsorship</option>
                      <option value="School Forensics Club Curriculum Implementation">School Forensics Club Curriculum Implementation</option>
                      <option value="Corporate Executive Rhetoric & Speechwriting">Corporate Executive Rhetoric & Speechwriting</option>
                      <option value="Sovereign Leadership & Healing-Centered Cohorts">Sovereign Leadership & Healing-Centered Cohorts</option>
                      <option value="General Strategic Partnership / Grant Inquiry">General Strategic Partnership / Grant Inquiry</option>
                    </select>
                  </div>

                  {/* Message Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="contact-message" className="text-xs font-mono uppercase tracking-wider text-slate-300 font-medium">
                        Statement of Intent / Message <span className="text-rose-400">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                        {message.length}/1500 chars
                      </span>
                    </div>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value.slice(0, 1500));
                        if (touched.message) validateField('message', e.target.value);
                      }}
                      onBlur={(e) => handleBlur('message', e.target.value)}
                      placeholder="Outline your timeline, institutional cohort size, or specific rhetorical goals..."
                      className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-hidden transition-colors resize-y ${
                        touched.message && fieldErrors.message 
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
                          : 'border-slate-800 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]'
                      }`}
                    />
                    {touched.message && fieldErrors.message && (
                      <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#C89630] hover:bg-[#D9A741] text-[#181B1F] font-serif font-black text-sm rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-[#C89630]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#181B1F] border-t-transparent rounded-full animate-spin"></div>
                          <span>Transmitting Dossier...</span>
                        </>
                      ) : (
                        <>
                          <span>Transmit Faculty Dispatch</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-2">
                      Protected by 256-bit encryption. Your details are reviewed strictly by Global Orators faculty.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};
