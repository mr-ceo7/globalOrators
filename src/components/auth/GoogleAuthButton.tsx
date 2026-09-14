import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Loader2 } from 'lucide-react';

interface GoogleAuthButtonProps {
  role?: 'coach' | 'speaker';
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  onSuccess?: () => void;
  onError?: (err: string) => void;
  enableOneTap?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  role = 'speaker',
  text = 'continue_with',
  onSuccess,
  onError,
  enableOneTap = true,
}) => {
  const { loginWithGoogle } = useApp();
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

  const handleCredentialResponse = async (response: { credential: string }) => {
    if (!response?.credential) return;
    setLoading(true);
    try {
      const res = await loginWithGoogle(response.credential, role);
      if (res.success) {
        onSuccess?.();
      } else {
        onError?.(res.error || 'Google authentication failed.');
      }
    } catch (err: any) {
      onError?.(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) return;
    let checkInterval: any;

    const initGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        setScriptLoaded(true);
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = '';
            (window as any).google.accounts.id.renderButton(googleBtnContainerRef.current, {
              type: 'standard',
              theme: 'filled_black',
              size: 'large',
              text,
              shape: 'rectangular',
              logo_alignment: 'left',
              width: '100%',
            });
          }

          if (enableOneTap) {
            (window as any).google.accounts.id.prompt();
          }
        } catch (e) {
          console.warn('Google Identity initialization error:', e);
        }
        return true;
      }
      return false;
    };

    if (!initGoogle()) {
      checkInterval = setInterval(() => {
        if (initGoogle()) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [googleClientId, role, text, enableOneTap]);

  if (!googleClientId) {
    return (
      <div className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-sans text-xs text-center">
        Google Sign-In is not configured.
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-sans text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#C89630]" />
          <span>Verifying Google Identity...</span>
        </div>
      )}

      {/* Official Google Button Mount Target */}
      <div
        ref={googleBtnContainerRef}
        className={`w-full flex justify-center ${loading ? 'hidden' : ''} ${!scriptLoaded ? 'hidden' : ''}`}
      />

      {/* Clean high-contrast fallback button if Google GSI script blocked or not yet rendered */}
      {!scriptLoaded && !loading && (
        <div className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-sans text-xs flex items-center justify-center gap-2 text-center">
          <span>Google Sign-In is currently unavailable. Please try again later or contact support.</span>
        </div>
      )}
    </div>
  );
};
