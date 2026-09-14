import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  User, 
  Globe, 
  Mic 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sanitizeText } from '../../utils/sanitization';
import { GlobalOratorsLogo } from '../common/GlobalOratorsLogo';
import { GoogleAuthButton } from './GoogleAuthButton';

export const CoachLoginPortal: React.FC = () => {
  const { loginCoach, registerCoach, setCurrentPortal } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regInviteCode, setRegInviteCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, [mode]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitizeText(loginEmail, 120).toLowerCase().trim();
    const cleanPassword = loginPassword.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLoginError('A valid faculty email address is required.');
      return;
    }
    if (!cleanPassword) {
      setLoginError('Password is required.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const result = await loginCoach(cleanEmail, cleanPassword);
      if (!result.success) {
        setLoginError(result.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setLoginError('Unable to reach authentication server. Please check your connection.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeText(regFullName, 100).trim();
    const cleanEmail = sanitizeText(regEmail, 120).toLowerCase().trim();
    const cleanPassword = regPassword.trim();
    const cleanInvite = sanitizeText(regInviteCode, 64).trim();

    if (!cleanName) {
      setRegError('Full legal or academic name is required.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setRegError('A valid faculty email address is required.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 8) {
      setRegError('Password must contain at least 8 characters.');
      return;
    }
    if (!cleanInvite) {
      setRegError('Faculty invite authorization code is required.');
      return;
    }

    setIsRegistering(true);
    setRegError(null);
    setRegSuccess(null);

    try {
      const result = await registerCoach({
        email: cleanEmail,
        password: cleanPassword,
        fullName: cleanName,
        inviteCode: cleanInvite
      });

      if (result.success) {
        setRegSuccess('Accredited coach account verified. Initializing Coach OS...');
      } else {
        setRegError(result.error || 'Accreditation verification failed. Please check invite code.');
      }
    } catch {
      setRegError('Unable to connect to faculty accreditation service.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-[#C89630] selection:text-slate-950 font-sans">
      {/* Top Architectural Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GlobalOratorsLogo className="w-8 h-8" colorMode="gold" />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-sm tracking-tight text-white">Global Orators</span>
            <span className="text-[10px] font-mono tracking-widest text-[#C89630] uppercase">Faculty Portal</span>
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
            <span className="hidden sm:inline">Speaker Portal</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-sm">
          {/* Header & Subtitles */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[#C89630] mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-[#C89630] mb-1">
              Accredited Coach Access
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Coach Operating System
            </h1>
            <p className="mt-2 text-xs text-slate-400 font-sans leading-relaxed">
              Forensic drill administration, speech review bench, and speaker roster governance.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginError(null);
                setRegError(null);
              }}
              className={`py-2 text-xs font-serif font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#C89630] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setLoginError(null);
                setRegError(null);
              }}
              className={`py-2 text-xs font-serif font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#C89630] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Accreditation
            </button>
          </div>

          {/* Sign In Mode */}
          {mode === 'login' && (
            <div>
              {loginError && (
                <div className="mb-5 p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{loginError}</span>
                </div>
              )}

              {/* Google Workspace Auth */}
              <div className="mb-5">
                <GoogleAuthButton
                  role="coach"
                  text="signin_with"
                  enableOneTap={false}
                  onError={(err) => setLoginError(err)}
                />

                <div className="relative flex items-center justify-center py-4">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-slate-900 px-3 text-[10px] font-mono tracking-widest text-slate-400 uppercase shrink-0">
                    Or Faculty Password
                  </span>
                  <div className="border-t border-slate-800 w-full" />
                </div>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label 
                    htmlFor="coach-email-input" 
                    className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Faculty Email
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
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="coach@globalorators.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="coach-password-input" 
                    className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Account Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-[#C89630]" />
                    </div>
                    <input
                      id="coach-password-input"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-sm shadow-lg shadow-[#C89630]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Coach Operating System</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Registration Mode */}
          {mode === 'register' && (
            <div>
              {regError && (
                <div className="mb-5 p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{regSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label 
                    htmlFor="coach-reg-name-input" 
                    className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1"
                  >
                    Full Name & Credentials
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4 text-[#C89630]" />
                    </div>
                    <input
                      id="coach-reg-name-input"
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Coach Nia Adebayo"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]"
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="coach-reg-email-input" 
                    className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1"
                  >
                    Faculty Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4 text-[#C89630]" />
                    </div>
                    <input
                      id="coach-reg-email-input"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="faculty@globalorators.com"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]"
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="coach-reg-password-input" 
                    className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1"
                  >
                    Master Password
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
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]"
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="coach-reg-invite-input" 
                    className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1"
                  >
                    Faculty Invite Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4 text-[#C89630]" />
                    </div>
                    <input
                      id="coach-reg-invite-input"
                      type="text"
                      required
                      value={regInviteCode}
                      onChange={(e) => setRegInviteCode(e.target.value)}
                      placeholder="Accredited invite code"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-slate-950 font-serif font-bold text-sm shadow-lg shadow-[#C89630]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validating Faculty Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Provision Coach Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Editorial Security Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-[11px] text-slate-500 font-sans leading-relaxed">
            Faculty accounts require active accreditation and an authorized invite code issued by the Head Speech Coach. Speaker applicants should access the{' '}
            <button
              onClick={() => setCurrentPortal('speaker_app')}
              className="text-[#C89630] hover:text-[#E3B95C] underline cursor-pointer"
            >
              Speaker Portal
            </button>
            .
          </div>
        </div>
      </main>

      {/* Footer Dispatch */}
      <footer className="py-4 text-center text-slate-500 text-[11px] border-t border-slate-800/60 font-mono">
        Global Orators Project · Forensic Speech & Debate Operating System
      </footer>
    </div>
  );
};
