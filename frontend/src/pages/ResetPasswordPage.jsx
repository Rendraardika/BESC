import { useState, useEffect } from 'react';
import bescLogo from '../assets/images/logo BESC biru tua FIX.png';
import { apiRequest } from '../lib/api.js';

export default function ResetPasswordPage({ onBack, onLogin }) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/token=([^&]+)/);
    if (match) {
      setToken(match[1]);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Password baru tidak cocok.');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setSuccess('Password berhasil direset! Anda akan dialihkan ke halaman login...');
      setTimeout(() => onLogin(), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-3 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <img src={bescLogo} alt="BESC Logo" className="h-20 w-auto object-contain md:h-24" />
          <button type="button" onClick={onBack} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">← Kembali</button>
        </div>
      </header>

      <section className="grid min-h-[calc(100vh-112px)] place-items-center px-6 py-12 md:px-8">
        <div className="w-full max-w-[460px] rounded-[2rem] bg-white p-7 shadow-2xl md:p-9">
          <div className="mb-7 text-center">
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-slate-950">Reset Password</h1>
            <p className="mt-2 text-sm text-slate-500">Masukkan password baru Anda.</p>
          </div>

          {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
          {success && <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</div>}

          {!token ? (
            <div className="text-center text-sm text-slate-500">
              Token tidak ditemukan. Pastikan Anda membuka link dari email yang benar.
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Password Baru</label>
                <div className="relative">
                  <input className="h-11 w-full rounded-lg border border-slate-300 px-3 pr-12 text-sm outline-none focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required placeholder="Minimal 8 karakter" />
                  <button type="button" onClick={() => setShowPassword((c) => !c)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-[#1c79c6]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                      {showPassword ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A10.6 10.6 0 0 1 12 4c5.5 0 9 5 9 5a16.8 16.8 0 0 1-2.1 2.7M6.6 6.6C4.4 8 3 10 3 10s3.5 5 9 5c1 0 1.9-.2 2.7-.4" /></> : <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>}
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Konfirmasi Password Baru</label>
                <input className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required placeholder="Ulangi password baru" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? 'Memproses...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
