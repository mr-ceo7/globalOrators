import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  User, 
  Globe, 
  Mic,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sanitizeText } from '../../utils/sanitization';
import { GlobalOratorsLogo } from '../common/GlobalOratorsLogo';
import { GoogleAuthButton } from './GoogleAuthButton';

type AuthStep = 'email' | 'password' | 'register' | 'google_prompt';

export const CoachLoginPortal: React.FC = () => {
  const { loginCoach, registerCoach, checkCoachEmail, setCurrentPortal } = useApp();

  const [step, setStep] = useState<AuthStep>('email');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Status & loading states
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (step === 'email') {
      emailInputRef.current?.focus();
    } else if (step === 'password') {
      passwordInputRef.current?.focus();
    } else if (step === 'register') {
      nameInputRef.current?.focus();
    }
  }, [step]);

  // Step 1: Handle Email Check
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitizeText(email, 120).toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsCheckingEmail(true);
    setErrorMessage(null);

    try {
      const res = await checkCoachEmail(cleanEmail);

      if (res.exists) {
        if (res.auth_method === 'google') {
          setStep('google_prompt');
        } else {
          setStep('password');
        }
      } else {
        // User is new: proceed directly to account setup
        setStep('register');
      }
    } catch {
      // Graceful fallback to password attempt if check endpoint fails
      setStep('password');
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Step 2A: Handle Password Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitizeText(email, 120).toLowerCase().trim();
    const cleanPassword = password.trim();

    if (!cleanPassword) {
      setErrorMessage('Password is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await loginCoach(cleanEmail, cleanPassword);
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid email or password. Please try again.');
      }
    } catch {
      setErrorMessage('Unable to connect to authentication server. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2B: Handle New Coach Account Creation
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeText(fullName, 100).trim();
    const cleanEmail = sanitizeText(email, 120).toLowerCase().trim();
    const cleanPassword = password.trim();

    if (!cleanName) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await registerCoach({
        email: cleanEmail,
        password: cleanPassword,
        fullName: cleanName
      });

      if (result.success) {
        setSuccessMessage('Coach account created. Loading Coach App...');
      } else {
        setErrorMessage(result.error || 'Registration failed. Please check your details.');
      }
    } catch {
      setErrorMessage('Unable to connect to registration server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToEmail = () => {
    setStep('email');
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-[#C89630] selection:text-slate-950 font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GlobalOratorsLogo className="w-8 h-8" colorMode="gold" />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-sm tracking-tight text-white">Global Orators</span>
            <span className="text-[10px] font-mono tracking-widest text-[#C89630] uppercase">Coach App</span>
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
            onClick={() => setCurrentPortal('speaker_app')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-[#C89630]" />
            <span className="hidden sm:inline">Orators App</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-sm">
          {/* Header Greeting & Title */}
          <div className="text-center mb-6">
            <div className="text-xs font-serif italic text-[#C89630] mb-2 tracking-wide">
              Welcome, Coach
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {step === 'register' ? 'Create Coach Account' : 'Coach App'}
            </h1>
            <p className="mt-2 text-xs text-slate-400 font-sans leading-relaxed">
              {step === 'email' && 'Enter your faculty or staff email to sign in or create your coach profile.'}
              {step === 'password' && 'Enter your password to sign in to Coach App.'}
              {step === 'register' && 'Enter your name and choose a secure password to complete registration.'}
              {step === 'google_prompt' && 'Google authentication required for this account.'}
            </p>
          </div>

          {/* Active Email Identity Pill (Visible when past step 1) */}
          {step !== 'email' && (
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

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* STEP 1: Email First Form */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="coach-email-input" className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Coach Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 text-[#C89630]" />
                  </div>
                  <input
                    id="coach-email-input"
                    ref={emailInputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="coach@globalorators.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCheckingEmail}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-sm shadow-lg shadow-[#C89630]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking Account...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
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
                    role="coach"
                    text="signin_with"
                    enableOneTap={false}
                    onError={(err) => setErrorMessage(err)}
                  />
                </div>
              </div>
            </form>
          )}

          {/* STEP 2A: Password Sign In (Existing Coach) */}
          {step === 'password' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="coach-password-input" className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-[#C89630]" />
                  </div>
                  <input
                    id="coach-password-input"
                    ref={passwordInputRef}
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-sm shadow-lg shadow-[#C89630]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Coach App</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleResetToEmail}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Use a different email</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2B: Create Account Form (New User) */}
          {step === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label htmlFor="coach-reg-name-input" className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name & Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4 text-[#C89630]" />
                  </div>
                  <input
                    id="coach-reg-name-input"
                    ref={nameInputRef}
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Coach Nia Adebayo"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="coach-reg-password-input" className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-[#C89630]" />
                  </div>
                  <input
                    id="coach-reg-password-input"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-sm shadow-lg shadow-[#C89630]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Coach Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleResetToEmail}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Use a different email</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2C: Google Account Detected Prompt */}
          {step === 'google_prompt' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs leading-relaxed">
                <p className="font-medium text-slate-200 mb-1">
                  Google Sign-In Account Found
                </p>
                <p className="text-slate-400">
                  You previously accessed Global Orators using Google with this email. Please continue with Google below to enter Coach App directly without creating duplicate profiles.
                </p>
              </div>

              <div className="flex justify-center py-2">
                <GoogleAuthButton
                  role="coach"
                  text="signin_with"
                  enableOneTap={false}
                  onError={(err) => setErrorMessage(err)}
                />
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleResetToEmail}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Use a different email</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-[11px] text-slate-500 font-sans leading-relaxed text-center">
            Speakers and debaters should log in through the{' '}
            <button
              onClick={() => setCurrentPortal('speaker_app')}
              className="text-[#C89630] hover:text-[#E3B95C] underline font-semibold cursor-pointer"
            >
              Orators App
            </button>
            .
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-slate-500 text-[11px] border-t border-slate-800/60 font-mono">
        Global Orators Project · Coach App
      </footer>
    </div>
  );
};
