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

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: text === 'Daftar dengan Google' ? 'signup_with' : 'signin_with',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

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

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="text-center text-xs text-slate-400">
        Google Login belum dikonfigurasi
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full"></div>
    </div>
  );
}
