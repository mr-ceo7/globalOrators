import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Loader2, AlertCircle, Mail, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sanitizeText } from '../../utils/sanitization';
import { GoogleAuthButton } from '../auth/GoogleAuthButton';

interface SpeakerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOnboarding?: () => void;
}

export const SpeakerLoginModal: React.FC<SpeakerLoginModalProps> = ({
  isOpen,
  onClose,
  onStartOnboarding
}) => {
  const { sendSpeakerOtp, verifySpeakerOtp } = useApp();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setErrorMsg(null);
      setInfoMsg(null);
      setEmail('');
      setOtpCode('');
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 60);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 60);
    }
  }, [step]);

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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeText(email, 120).toLowerCase().trim();
    if (!sanitized || !sanitized.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const result = await sendSpeakerOtp(sanitized);
      if (result.success) {
        setStep('otp');
        setInfoMsg(`A 1-click magic login link and 6-digit passcode were sent to ${sanitized}. Check your inbox.`);
      } else {
        setErrorMsg(result.error || 'Unable to dispatch verification passcode. Please verify your email.');
      }
    } catch {
      setErrorMsg('Unable to connect to authentication server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim() || resending) return;
    setResending(true);
    setErrorMsg(null);
    try {
      const result = await sendSpeakerOtp(email.trim().toLowerCase());
      if (result.success) {
        setInfoMsg(`A fresh magic link and passcode were dispatched to ${email.trim().toLowerCase()}.`);
      } else {
        setErrorMsg(result.error || 'Failed to resend code.');
      }
    } catch {
      setErrorMsg('Failed to resend passcode.');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = sanitizeText(otpCode, 10).trim();
    const cleanEmail = sanitizeText(email, 120).toLowerCase().trim();

    if (!cleanCode || cleanCode.length < 6) {
      setErrorMsg('Please enter the complete 6-digit passcode.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await verifySpeakerOtp(cleanEmail, cleanCode);
      if (!result.success) {
        setErrorMsg(result.error || 'Invalid or expired verification passcode.');
      } else {
        onClose();
      }
    } catch {
      setErrorMsg('Authentication failed. Please verify your code and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('email');
    setErrorMsg(null);
    setInfoMsg(null);
    setOtpCode('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="speaker-login-title"
    >
      {/* Backdrop click handler */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 shadow-2xl shadow-black/80 z-10 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="text-[10px] font-mono tracking-widest text-brand-gold uppercase mb-1">
            Orators App Re-Entry
          </div>
          <h2
            id="speaker-login-title"
            className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white"
          >
            {step === 'email' ? 'Orators App' : 'Verify Identity'}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {step === 'email'
              ? 'Enter your registered email address to receive an instant 1-click magic link and passcode.'
              : `Enter the 6-digit passcode or click the 1-click link sent to ${email}.`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">{errorMsg}</span>
              {onStartOnboarding && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartOnboarding();
                    }}
                    className="text-brand-gold hover:text-[#E3B95C] underline font-semibold cursor-pointer"
                  >
                    Enroll as a new speaker &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Alert */}
        {infoMsg && !errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="flex-1 font-medium">{infoMsg}</span>
          </div>
        )}

        {step === 'email' ? (
          <>
            {/* Google One Tap & Google Sign In */}
            <div className="mb-5 space-y-3">
              <GoogleAuthButton
                role="speaker"
                text="continue_with"
                enableOneTap={true}
                onSuccess={() => onClose()}
                onError={(err) => setErrorMsg(err)}
              />

              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-[#101318] px-2.5 text-[10px] font-mono tracking-widest text-slate-500 uppercase shrink-0">
                  Or Email Passcode
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label htmlFor="speaker-email-input" className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4 text-brand-gold" />
                  </div>
                  <input
                    id="speaker-email-input"
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="e.g. kassimmusa322@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] outline-hidden text-sm text-white placeholder-slate-500 transition-all font-sans"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3 px-4 rounded-xl bg-[#C89630] hover:bg-[#B37D22] disabled:opacity-50 text-on-gold font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C89630]/20 transition-all cursor-pointer disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Dispatching Passcode...</span>
                  </>
                ) : (
                  <>
                    <span>Send Login Passcode</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

          </>
        ) : (
          /* Step 2: 6-Digit Passcode Form */
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="speaker-otp-input" className="block text-[11px] font-mono uppercase tracking-wider text-slate-300">
                  6-Digit Passcode
                </label>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-[11px] text-brand-gold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change email</span>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4 text-brand-gold" />
                </div>
                <input
                  id="speaker-otp-input"
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] outline-hidden text-lg tracking-[0.3em] font-mono text-center text-white placeholder-slate-600 transition-all font-bold"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full py-3 px-4 rounded-xl bg-[#C89630] hover:bg-[#B37D22] disabled:opacity-50 text-on-gold font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C89630]/20 transition-all cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Authenticating Session...</span>
                </>
              ) : (
                <>
                  <span>Enter Orators App</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Didn't receive passcode?</span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="text-brand-gold hover:underline flex items-center gap-1 cursor-pointer font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Resending...' : 'Resend code'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
