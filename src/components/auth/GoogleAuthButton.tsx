import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Loader2 } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

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
}) => {
  const { loginWithGoogle } = useApp();
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState<string>('300');

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const available = containerRef.current.clientWidth || containerRef.current.offsetWidth;
        if (available > 0) {
          // Google GIS allows width from 200px to 400px.
          // Clamp to available container width, capped at 380px for desktop.
          const clamped = Math.min(Math.max(Math.floor(available), 200), 380);
          setButtonWidth(String(clamped));
        }
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => {
        updateWidth();
      });
      ro.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateWidth);
      ro?.disconnect();
    };
  }, []);

  const handleCredentialResponse = async (response: CredentialResponse) => {
    console.log('[Google Auth] Credential response received:', response?.select_by);
    if (!response?.credential) {
      console.warn('[Google Auth] Response missing credential payload.');
      onError?.('Google did not return credentials. Please check origin in Google Cloud Console.');
      return;
    }
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

  return (
    <div
      ref={containerRef}
      className="w-full max-w-full flex flex-col items-center justify-center overflow-hidden"
    >
      {loading ? (
        <div className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-sans text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
          <span>Verifying Google Identity...</span>
        </div>
      ) : (
        <div className="w-full max-w-full flex justify-center overflow-hidden [&>div]:max-w-full [&>div]:w-full [&>div]:flex [&>div]:justify-center [&_iframe]:max-w-full">
          <GoogleLogin
            onSuccess={handleCredentialResponse}
            onError={() => {
              console.error('[Google Auth] GoogleLogin onError fired.');
              onError?.('Google authentication failed. Ensure this domain (coach.globaloratorsproject.com) is in Authorized JavaScript Origins in Google Cloud Console.');
            }}
            promptMomentNotification={(moment) => {
              if (moment.isNotDisplayed()) {
                const reason = moment.getNotDisplayedReason();
                console.warn('[Google Auth] Prompt not displayed:', reason);
                if (reason === 'unregistered_origin') {
                  onError?.('This domain (coach.globaloratorsproject.com) is not in Google Cloud Console Authorized JavaScript Origins.');
                }
              }
              if (moment.isSkippedMoment()) {
                console.warn('[Google Auth] Prompt skipped:', moment.getSkippedReason());
              }
            }}
            click_listener={() => {
              console.log('[Google Auth] Google Sign-In button clicked.');
            }}
            use_fedcm_for_prompt={true}
            text={text as 'signin_with' | 'signup_with' | 'continue_with' | 'signin'}
            theme="filled_black"
            shape="rectangular"
            size="large"
            width={buttonWidth}
            logo_alignment="left"
          />
        </div>
      )}
    </div>
  );
};
