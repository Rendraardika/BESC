import { useEffect, useMemo, useRef, useState } from 'react';
import bescLogo from '../assets/images/logo BESC biru tua FIX.png';
import registerBg from '../assets/images/backround+karakter.png';
import karakterImg from '../assets/images/karakter.png';
import indonesiaWilayah from '../indonesia_wilayah.json';
import { apiRequest } from '../lib/api.js';

export default function RegisterPage({ onLogin, onRegisterSuccess }) {
  const inputClass = 'h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100';
  const [provinsiId, setProvinsiId] = useState('');
  const [form, setForm] = useState({
    name: '',
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
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const passwordRules = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    symbol: /[^A-Za-z0-9]/.test(form.password),
  };
  const passwordIsValid = Object.values(passwordRules).every(Boolean);

  const kotaOptions = useMemo(() => {
    if (!provinsiId) return [];
    return indonesiaWilayah.kota_kabupaten.filter((k) => String(k.provinsi_id) === String(provinsiId));
  }, [provinsiId]);

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
            onRegisterSuccess(auth, { source: 'google' });
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
        text: 'continue_with',
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
  }, [googleClientId, onRegisterSuccess]);

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
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          institution: form.institution,
        }),
      });
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
          <div className="relative hidden overflow-hidden p-10 text-white lg:block" style={{ backgroundImage: `url(${registerBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
            <div className="absolute inset-0 bg-[#1c79c6]/80"></div>
            <img src={karakterImg} alt="Karakter BESC" className="absolute left-1/2 top-1/2 h-[40rem] w-auto -translate-x-1/2 -translate-y-1/2 object-contain opacity-100" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-5 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100">Pendaftaran BESC</div>
                <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold leading-tight">Mulai perjalanan kompetisimu hari ini.</h1>
                <p className="mt-4 text-sm leading-7 text-blue-100">Lengkapi data diri dengan benar agar proses verifikasi peserta berjalan lancar.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <div className="text-3xl font-extrabold">BESC 2026</div>
                <div className="mt-2 text-sm text-blue-100">Biology Environmental Smart Competition</div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-slate-950">Daftar Akun</h2>
            <p className="mt-2 text-sm text-slate-500">Lengkapi data diri untuk mengikuti kompetisi.</p>
            {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

            <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Nama</label>
                <input className={inputClass} value={form.name} onChange={updateField('name')} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Email</label>
                <input className={inputClass} type="email" value={form.email} onChange={updateField('email')} required />
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

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Jenis Kelamin</label>
                <select className={inputClass} defaultValue="">
                  <option value="" disabled>Pilih Jenis Kelamin</option>
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Provinsi Domisili</label>
                <select className={inputClass} value={provinsiId} onChange={(event) => setProvinsiId(event.target.value)}>
                  <option value="" disabled>Pilih Provinsi</option>
                  {indonesiaWilayah.provinsi.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Kota Domisili</label>
                <select className={inputClass} defaultValue="">
                  <option value="" disabled>Pilih Kota</option>
                  {kotaOptions.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="mt-2 rounded-xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2">
                {isSubmitting ? 'Memproses...' : 'Daftar'}
              </button>
            </form>

            <div className="mt-7">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200"></div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Atau lanjutkan dengan</span>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>

              {googleClientId ? (
                <div className="mt-5 flex min-h-11 w-full justify-center overflow-hidden rounded-xl" ref={googleButtonRef}></div>
              ) : (
                <button type="button" disabled className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-400">
                  Google belum dikonfigurasi
                </button>
              )}
              {googleClientId && !googleReady && <p className="mt-2 text-center text-xs text-slate-400">Menyiapkan Google...</p>}

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
