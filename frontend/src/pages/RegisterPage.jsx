import { useState } from 'react';
import bescLogo from '../assets/images/logo BESC biru tua FIX.png';
import karakterImg from '../assets/images/karakter.png';
import { apiRequest } from '../lib/api.js';

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
      localStorage.setItem(profileKey, JSON.stringify({
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
                <label className="mb-1 block text-xs font-bold text-slate-700">Nama Ketua</label>
                <input className={inputClass} value={form.leaderName} onChange={updateField('leaderName')} required />
              </div>
        </div>
      </section>
    </main>
  );
}
