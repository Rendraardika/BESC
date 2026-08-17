import { useState } from 'react';
import bescLogo from '../assets/images/logo BESC biru tua FIX.png';
import { apiRequest } from '../lib/api.js';

export default function ForgotPasswordPage({ onBack, onLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccess('Link reset password telah dikirim ke email Anda. Silakan cek inbox (dan folder spam).');
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
          <button 
            type="button" 
            onClick={() => { if (window.history.length > 1) { window.history.back(); } else if (onBack) { onBack(); } }} 
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            ← Kembali
          </button>
        </div>
      </header>

      <section className="grid min-h-[calc(100vh-112px)] place-items-center px-6 py-10 md:px-8">
        <div className="w-full max-w-[420px] rounded-[2rem] bg-white p-8 shadow-2xl md:p-9 flex flex-col justify-center">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-44 items-center justify-center px-2">
              <img src={bescLogo} alt="BESC Logo" className="max-h-20 w-full object-contain" />
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-slate-950">Lupa Password</h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">Masukkan email akun Anda, kami akan mengirimkan link untuk reset password.</p>
          </div>

          {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}
          {success && <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">{success}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Email</label>
              <input className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Masukkan email terdaftar" required />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 transition hover:opacity-95">
              {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs sm:text-sm text-slate-500">
            Ingat password?{' '}
            <button type="button" onClick={onLogin} className="font-bold text-[#1c79c6] hover:underline">Masuk</button>
          </p>
        </div>
      </section>
    </main>
  );
}
