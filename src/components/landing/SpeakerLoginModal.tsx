import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Loader2, AlertCircle, Mic, Phone, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sanitizeText } from '../../utils/sanitization';

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
  const { loginSpeaker } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setIdentifier('');
      setTimeout(() => {
        inputRef.current?.focus();
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
    const sanitized = sanitizeText(identifier, 100);
    if (!sanitized) {
      setErrorMsg('Please enter your email or phone number.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await loginSpeaker(sanitized);
      if (result.success) {
        onClose();
      } else {
        setErrorMsg(result.error || 'No speaker profile found matching this email or phone.');
      }
    } catch {
      setErrorMsg('Unable to connect to speaker registry. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="speaker-login-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#101318] border border-slate-800 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative animate-scaleIn text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="text-[10px] font-mono tracking-widest text-[#C89630] uppercase mb-1">
            Speaker Portal Re-Entry
          </div>
          <h2
            id="speaker-login-title"
            className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white"
          >
            Access Your Protocol
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Enter the email address or phone number linked to your Global Orators onboarding calibration.
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
                    className="text-[#C89630] hover:text-[#E3B95C] underline font-semibold cursor-pointer"
                  >
                    Enroll as a new speaker &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-2">
              Email Address or Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                {identifier.includes('@') ? (
                  <Mail className="w-4 h-4 text-[#C89630]" />
                ) : identifier.replace(/\D/g, '').length >= 3 ? (
                  <Phone className="w-4 h-4 text-[#C89630]" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. kassimmusa322@gmail.com or +254746957502"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630] outline-hidden text-sm text-white placeholder-slate-500 transition-all font-sans"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !identifier.trim()}
            className="w-full py-3 px-4 rounded-xl bg-[#C89630] hover:bg-[#B37D22] disabled:opacity-50 text-slate-950 font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C89630]/20 transition-all cursor-pointer disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Locating Speaker Record...</span>
              </>
            ) : (
              <>
                <span>Enter Speaker Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-6 pt-5 border-t border-slate-850">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">
            Quick Select
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setIdentifier('kassimmusa322@gmail.com');
                setErrorMsg(null);
              }}
              className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-slate-700 text-left transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-slate-200 group-hover:text-white">Kassim Musa</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">kassimmusa322@gmail.com</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setIdentifier('+254746957502');
                setErrorMsg(null);
              }}
              className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-slate-700 text-left transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-slate-200 group-hover:text-white">Direct Phone Lookup</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">+254 746 957 502</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
