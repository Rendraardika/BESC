import { useEffect, useRef } from 'react';
import { apiRequest } from '../lib/api.js';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * GoogleLoginButton
 * @param {function} onAuthSuccess - Called with auth data after successful Google login
 * @param {function} onError - Called with error message
 * @param {string} text - Button text (default: "Masuk dengan Google")
 */
export default function GoogleLoginButton({ onAuthSuccess, onError, text = 'Masuk dengan Google' }) {
  const buttonRef = useRef(null);

  const handleCredentialResponse = async (response) => {
    try {
      const auth = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: response.credential }),
      });
      onAuthSuccess(auth);
    } catch (err) {
      onError?.(err.message || 'Login dengan Google gagal');
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) return;

    const renderGoogleButton = () => {
      if (window.google?.accounts?.id && buttonRef.current) {
        buttonRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        const containerWidth = buttonRef.current.offsetWidth || (typeof window !== 'undefined' ? Math.min(380, window.innerWidth - 64) : 300);
        const buttonWidth = Math.max(220, Math.min(380, Math.floor(containerWidth)));

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: String(buttonWidth),
          text: text === 'Daftar dengan Google' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return;
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = renderGoogleButton;
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener('load', renderGoogleButton);
      return () => existingScript.removeEventListener('load', renderGoogleButton);
    }
  }, [GOOGLE_CLIENT_ID, text]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="text-center text-xs text-slate-400">
        Google Login belum dikonfigurasi
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center overflow-hidden">
      <div ref={buttonRef} className="w-full flex justify-center min-h-[44px] max-w-full overflow-hidden"></div>
    </div>
  );
}
