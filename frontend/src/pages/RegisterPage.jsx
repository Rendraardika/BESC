import { useState } from 'react';
import bescLogo from '../assets/images/logo BESC biru tua FIX.png';
import karakterImg from '../assets/images/karakter.png';
import { apiRequest, safeSetItem } from '../lib/api.js';
import GoogleLoginButton from '../components/GoogleLoginButton.jsx';

export default function RegisterPage({ onLogin, onRegisterSuccess }) {
  const inputClass = 'h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100';
  const [form, setForm] = useState({
    teamName: '',
    leaderName: '',
    member1Name: '',
    member2Name: '',
    email: '',
    phone: '',
    birthDate: '',
    institution: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordRules = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    symbol: /[^A-Za-z0-9]/.test(form.password),
  };
  const passwordIsValid = Object.values(passwordRules).every(Boolean);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Confirm password belum sama.');
      return;
    }
    if (!passwordIsValid) {
      setError('Password harus memenuhi seluruh ketentuan keamanan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const auth = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.leaderName,
          team_name: form.teamName,
          member1_name: form.member1Name,
          member2_name: form.member2Name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          institution: form.institution,
          birth_date: form.birthDate,
        }),
      });
      const profileKey = `besc_profile_${auth.user?.id || auth.user?.email || form.email}`;
      safeSetItem(profileKey, JSON.stringify({
        fullName: form.leaderName,
        whatsapp: form.phone,
        school: form.institution,
        birthDate: form.birthDate,
      }));
      onRegisterSuccess(auth, { source: 'manual' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center">
          <img src={bescLogo} alt="BESC Logo" className="h-11 w-auto object-contain" />
        </div>
      </header>

      <section className="px-6 py-12 md:px-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden overflow-hidden p-10 text-white lg:block lg:overflow-hidden lg:rounded-tr-[2rem] lg:rounded-br-[2rem] lg:flex lg:flex-col lg:justify-between">
            <img src={karakterImg} alt="Karakter BESC" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/25 via-transparent to-slate-950/20" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-5 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100">Pendaftaran BESC</div>
                <h1 className="max-w-xs font-['Plus_Jakarta_Sans'] text-4xl font-extrabold leading-tight text-white">Mulai perjalanan kompetisimu hari ini.</h1>
                <p className="mt-4 max-w-sm text-sm leading-7 text-blue-100/90">Lengkapi data diri dengan benar agar proses verifikasi peserta berjalan lancar dan kamu siap mengikuti kompetisi.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <div className="text-3xl font-extrabold text-white">BESC 2026</div>
                <div className="mt-2 text-sm text-blue-100/90">Biology Environmental Smart Competition</div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-slate-950">Daftar Akun</h2>
            <p className="mt-2 text-sm text-slate-500">Lengkapi data diri untuk mengikuti kompetisi.</p>
            {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

            <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-bold text-slate-700">Nama Kelompok/Tim</label>
                <input className={inputClass} value={form.teamName} onChange={updateField('teamName')} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Nama Ketua</label>
                <input className={inputClass} value={form.leaderName} onChange={updateField('leaderName')} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Email</label>
                <input className={inputClass} type="email" value={form.email} onChange={updateField('email')} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Nama Anggota 1</label>
                <input className={inputClass} value={form.member1Name} onChange={updateField('member1Name')} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Nama Anggota 2</label>
                <input className={inputClass} value={form.member2Name} onChange={updateField('member2Name')} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Nomor WA Aktif</label>
                <input className={inputClass} value={form.phone} onChange={updateField('phone')} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Tanggal Lahir</label>
                <input className={inputClass} type="date" value={form.birthDate} onChange={updateField('birthDate')} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-bold text-slate-700">Nama Sekolah</label>
                <input className={inputClass} value={form.institution} onChange={updateField('institution')} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Password</label>
                <div className="relative">
                  <input className={`${inputClass} pr-12`} type={showPassword ? 'text' : 'password'} value={form.password} onChange={updateField('password')} minLength={8} required />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-[#1c79c6]" aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                      {showPassword ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A10.6 10.6 0 0 1 12 4c5.5 0 9 5 9 5a16.8 16.8 0 0 1-2.1 2.7M6.6 6.6C4.4 8 3 10 3 10s3.5 5 9 5c1 0 1.9-.2 2.7-.4" /></> : <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>}
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Confirm Password</label>
                <div className="relative">
                  <input className={`${inputClass} pr-12`} type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={updateField('confirmPassword')} minLength={8} required />
                  <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-[#1c79c6]" aria-label={showConfirmPassword ? 'Sembunyikan confirm password' : 'Lihat confirm password'}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                      {showConfirmPassword ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A10.6 10.6 0 0 1 12 4c5.5 0 9 5 9 5a16.8 16.8 0 0 1-2.1 2.7M6.6 6.6C4.4 8 3 10 3 10s3.5 5 9 5c1 0 1.9-.2 2.7-.4" /></> : <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>}
                    </svg>
                  </button>
                </div>
              </div>
              <div className="grid gap-1 text-xs font-semibold text-slate-500 md:col-span-2 sm:grid-cols-2">
                <span className={passwordRules.length ? 'text-emerald-600' : ''}>Minimal 8 karakter</span>
                <span className={passwordRules.uppercase && passwordRules.lowercase ? 'text-emerald-600' : ''}>Huruf besar dan kecil</span>
                <span className={passwordRules.number ? 'text-emerald-600' : ''}>Minimal satu angka</span>
                <span className={passwordRules.symbol ? 'text-emerald-600' : ''}>Minimal satu simbol unik</span>
              </div>

              <button type="submit" disabled={isSubmitting} className="mt-2 rounded-xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2">
                {isSubmitting ? 'Memproses...' : 'Daftar'}
              </button>
            </form>

            <div className="mt-5 flex items-center gap-3 md:col-span-2">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-xs font-semibold text-slate-400">atau daftar dengan</span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <div className="md:col-span-2">
              <GoogleLoginButton
                onAuthSuccess={(auth) => onRegisterSuccess(auth, { source: 'google' })}
                onError={(msg) => setError(msg)}
                text="Daftar dengan Google"
              />
            </div>

            <div className="md:col-span-2 mt-7">
              <p className="mt-6 text-center text-sm text-slate-500">
                Sudah punya akun?{' '}
                <button type="button" onClick={onLogin} className="font-bold text-[#1c79c6]">Masuk</button>
              </p>
              <p className="mt-1 text-center text-xs text-slate-400">(c) 2026 BESC. Semua hak dilindungi.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
