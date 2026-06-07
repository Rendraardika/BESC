import { useEffect, useRef, useState } from 'react';
import bescLogo from '../assets/images/logo BESC biru tua FIX.png';
import { apiRequest } from '../lib/api.js';

export default function LoginPage({ onRegister, onLoginSuccess }) {
  const inputClass = 'h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId) return;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          if (!credential) return;
          setError('');
          setIsSubmitting(true);
          try {
            const auth = await apiRequest('/auth/google', {
              method: 'POST',
              body: JSON.stringify({ credential }),
            });
            onLoginSuccess(auth);
          } catch (err) {
            setError(err.message);
          } finally {
            setIsSubmitting(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: googleButtonRef.current.offsetWidth,
        text: 'signin_with',
      });
      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);
  }, [googleClientId, onLoginSuccess]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const auth = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      onLoginSuccess(auth);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-3 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center">
          <img src={bescLogo} alt="BESC Logo" className="h-20 w-auto object-contain md:h-24" />
        </div>
      </header>

      <section className="grid min-h-[calc(100vh-112px)] place-items-center px-6 py-12 md:px-8">
        <div className="w-full max-w-[460px] rounded-[2rem] bg-white p-7 shadow-2xl md:p-9">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-5 flex h-28 w-56 items-center justify-center px-2">
              <img src={bescLogo} alt="BESC Logo" className="max-h-24 w-full object-contain" />
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-slate-950">Masuk Akun BESC</h1>
            <p className="mt-2 text-sm text-slate-500">Gunakan akun peserta atau admin untuk melanjutkan.</p>
          </div>

          {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Email</label>
              <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Masukkan email" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <input className={`${inputClass} pr-12`} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" required />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-[#1c79c6]" aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                    {showPassword ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A10.6 10.6 0 0 1 12 4c5.5 0 9 5 9 5a16.8 16.8 0 0 1-2.1 2.7M6.6 6.6C4.4 8 3 10 3 10s3.5 5 9 5c1 0 1.9-.2 2.7-.4" /></> : <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>}
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-500">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#1c79c6]" />
                Ingat saya
              </label>
              <a href="#login" className="font-bold text-[#1c79c6]">Lupa password?</a>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span className="text-xs font-semibold text-slate-400">atau</span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          {googleClientId ? (
            <div className="flex min-h-11 w-full justify-center overflow-hidden rounded-xl" ref={googleButtonRef}></div>
          ) : (
            <button type="button" disabled className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-400">
              Google belum dikonfigurasi
            </button>
          )}
          {googleClientId && !googleReady && <p className="mt-2 text-center text-xs text-slate-400">Menyiapkan Google...</p>}

          <p className="mt-6 text-center text-sm text-slate-500">
            Belum punya akun?{' '}
            <button type="button" onClick={onRegister} className="font-bold text-[#1c79c6]">Daftar sekarang</button>
          </p>
        </div>
      </section>
    </main>
  );
}
