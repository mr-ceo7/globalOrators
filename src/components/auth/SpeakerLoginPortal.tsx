import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  RefreshCw, 
  Globe, 
  ShieldCheck 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sanitizeText } from '../../utils/sanitization';
import { GlobalOratorsLogo } from '../common/GlobalOratorsLogo';
import { GoogleAuthButton } from './GoogleAuthButton';

export const SpeakerLoginPortal: React.FC = () => {
  const { sendSpeakerOtp, verifySpeakerOtp, verifySpeakerMagicLink, setCurrentPortal } = useApp();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkValidating, setMagicLinkValidating] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  // Check for 1-click magic link in URL search params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const magicToken = params.get('magic_token') || params.get('token');
    const emailParam = params.get('email');

    if (magicToken) {
      setMagicLinkValidating(true);
      setErrorMsg(null);
      verifySpeakerMagicLink(magicToken, emailParam || undefined)
        .then((res) => {
          if (!res.success) {
            setErrorMsg(res.error || 'Magic login link is invalid or has expired.');
            setMagicLinkValidating(false);
          } else {
            // Clean magic link token from URL history to avoid repeat triggers on page reload
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        })
        .catch(() => {
          setErrorMsg('Failed to verify magic login link. Please enter your email to request a new link.');
          setMagicLinkValidating(false);
        });
    }
  }, [verifySpeakerMagicLink]);

  useEffect(() => {
    if (step === 'email') {
      emailInputRef.current?.focus();
    } else if (step === 'otp') {
      otpInputRef.current?.focus();
    }
  }, [step]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeText(email, 120).toLowerCase().trim();
    if (!sanitized || !sanitized.includes('@') || !sanitized.includes('.')) {
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
        setErrorMsg(result.error || 'No active speaker profile found with that email address.');
      }
    } catch {
      setErrorMsg('Unable to connect to authentication server. Please verify your connection.');
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
      }
    } catch {
      setErrorMsg('Authentication error. Please check your passcode and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToEmail = () => {
    setStep('email');
    setErrorMsg(null);
    setInfoMsg(null);
    setOtpCode('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-[#C89630] selection:text-slate-950 font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GlobalOratorsLogo className="w-8 h-8" colorMode="gold" />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-sm tracking-tight text-white">Global Orators</span>
            <span className="text-[10px] font-mono tracking-widest text-[#C89630] uppercase">Orators App</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <button
            onClick={() => setCurrentPortal('landing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Public Site</span>
          </button>
          <button
            onClick={() => setCurrentPortal('coach_os')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#C89630]" />
            <span className="hidden sm:inline">Coach App</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        {magicLinkValidating ? (
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-sm text-center">
            <GlobalOratorsLogo className="w-12 h-12 mx-auto mb-4 animate-pulse" colorMode="gold" />
            <h2 className="text-2xl font-serif font-bold text-white mb-2">Authenticating Magic Link</h2>
            <p className="text-xs text-slate-400 mb-6">Verifying your cryptographic token and preparing your Orators App workspace...</p>
            <div className="flex justify-center items-center gap-2 text-xs font-mono text-[#C89630]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Establishing session...</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-sm">
            {/* Header Greeting & Title */}
            <div className="text-center mb-6">
              <div className="text-xs font-serif italic text-[#C89630] mb-2 tracking-wide">
                Welcome, Speaker
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {step === 'email' ? 'Access Your Protocol' : 'Verify Identity'}
              </h1>
              <p className="mt-2 text-xs text-slate-400 font-sans leading-relaxed">
                {step === 'email'
                  ? 'Enter your registered email address to receive an instant 1-click magic link and passcode.'
                  : `Enter the 6-digit passcode or click the 1-click link sent to ${email}.`}
              </p>
            </div>

          {/* Active Email Identity Pill (Step 2) */}
          {step === 'otp' && (
            <div className="mb-5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-4 h-4 text-[#C89630] shrink-0" />
                <div className="truncate text-xs font-mono text-slate-200">
                  {email}
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetToEmail}
                className="text-[11px] font-mono text-[#C89630] hover:text-[#E3B95C] underline shrink-0 cursor-pointer"
              >
                Change
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-medium">{infoMsg}</span>
            </div>
          )}

          {/* STEP 1: Email Form */}
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label 
                  htmlFor="speaker-email-input" 
                  className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Speaker Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 text-[#C89630]" />
                  </div>
                  <input
                    id="speaker-email-input"
                    ref={emailInputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="speaker@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-sm shadow-lg shadow-[#C89630]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Google Sign In option */}
              <div className="mt-5">
                <div className="relative flex items-center justify-center py-3">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-slate-900 px-3 text-[10px] font-mono tracking-widest text-slate-400 uppercase shrink-0">
                    Or Continue With
                  </span>
                  <div className="border-t border-slate-800 w-full" />
                </div>

                <div className="flex justify-center">
                  <GoogleAuthButton
                    role="speaker"
                    text="signin_with"
                    enableOneTap={false}
                    onError={(err) => setErrorMsg(err)}
                  />
                </div>
              </div>

              {/* Apply / Onboard Link */}
              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setCurrentPortal('onboarding')}
                  className="text-xs text-slate-400 hover:text-[#C89630] transition-colors cursor-pointer"
                >
                  New to Global Orators? <span className="underline font-semibold text-slate-300">Apply & Onboard</span>
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Passcode Verification Form */
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label 
                  htmlFor="speaker-otp-input" 
                  className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  6-Digit Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4 text-[#C89630]" />
                  </div>
                  <input
                    id="speaker-otp-input"
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-lg font-mono tracking-widest text-center text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-sm shadow-lg shadow-[#C89630]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="inline-flex items-center gap-1 hover:text-slate-200 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  <span>Resend code</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToEmail}
                  className="inline-flex items-center gap-1 hover:text-slate-200 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change email</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-[11px] text-slate-500 font-sans leading-relaxed text-center">
            Faculty coaches and adjudicators should log in via{' '}
            <button
              onClick={() => setCurrentPortal('coach_os')}
              className="text-[#C89630] hover:text-[#E3B95C] underline font-semibold cursor-pointer"
            >
              Coach App
            </button>
            .
          </div>
        </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-slate-500 text-[11px] border-t border-slate-800/60 font-mono">
        Global Orators Project · Orators App
      </footer>
    </div>
  );
};
