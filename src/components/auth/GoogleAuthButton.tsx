import React, { useState } from 'react';
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

  const handleCredentialResponse = async (response: CredentialResponse) => {
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

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {loading ? (
        <div className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-sans text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#C89630]" />
          <span>Verifying Google Identity...</span>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <GoogleLogin
            onSuccess={handleCredentialResponse}
            onError={() =>
              onError?.('Google Authentication Failed. Ensure origin is authorized in Google Cloud Console.')
            }
            text={text}
            theme="filled_black"
            shape="rectangular"
            size="large"
            width="380"
            logo_alignment="left"
          />
        </div>
      )}
    </div>
  );
};
