import { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function ProfilePage({ onLogin, onLogout, onOlimpiade, onProfile, onRegister, onSaveProfile, onTryout, user }) {
  const savedProfile = JSON.parse(localStorage.getItem('besc_profile') ?? '{}');
  const [profile, setProfile] = useState({
    fullName: savedProfile.fullName ?? user?.name ?? '',
    email: savedProfile.email ?? 'rendraardika50@gmail.com',
    whatsapp: savedProfile.whatsapp ?? '',
    birthDate: savedProfile.birthDate ?? '',
    school: savedProfile.school ?? '',
    gender: savedProfile.gender ?? '',
    province: savedProfile.province ?? 'Bali',
    city: savedProfile.city ?? '',
  });

  const inputClass = 'h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100';

  const updateProfile = (field, value) => {
    setProfile((currentProfile) => ({ ...currentProfile, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem('besc_profile', JSON.stringify(profile));
    onSaveProfile(profile);
  };

  return (
    <>
      <Header onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} onTryout={onTryout} user={user} />
      <main className="bg-slate-50 px-6 py-12 md:px-8">
        <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-7">
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-slate-950">Profile Information</h1>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Nama Lengkap</label>
              <input className={inputClass} value={profile.fullName} onChange={(event) => updateProfile('fullName', event.target.value)} required type="text" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Email</label>
              <input className={`${inputClass} bg-slate-100 text-slate-500`} value={profile.email} disabled type="email" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Nomor WA Aktif</label>
              <input className={inputClass} value={profile.whatsapp} onChange={(event) => updateProfile('whatsapp', event.target.value)} required type="tel" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Tanggal Lahir</label>
              <input className={inputClass} value={profile.birthDate} onChange={(event) => updateProfile('birthDate', event.target.value)} required type="date" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Nama Sekolah</label>
              <input className={inputClass} value={profile.school} onChange={(event) => updateProfile('school', event.target.value)} required type="text" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Jenis Kelamin</label>
              <select className={inputClass} value={profile.gender} onChange={(event) => updateProfile('gender', event.target.value)} required>
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Provinsi Domisili</label>
              <select className={inputClass} value={profile.province} onChange={(event) => updateProfile('province', event.target.value)} required>
                <option value="">Pilih Provinsi</option>
                <option value="Bali">Bali</option>
                <option value="DKI Jakarta">DKI Jakarta</option>
                <option value="Jawa Barat">Jawa Barat</option>
                <option value="Jawa Tengah">Jawa Tengah</option>
                <option value="Jawa Timur">Jawa Timur</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Kota Domisili</label>
              <select className={inputClass} value={profile.city} onChange={(event) => updateProfile('city', event.target.value)} required>
                <option value="">Pilih Kota</option>
                <option value="Denpasar">Denpasar</option>
                <option value="Badung">Badung</option>
                <option value="Jakarta">Jakarta</option>
                <option value="Bandung">Bandung</option>
                <option value="Surabaya">Surabaya</option>
              </select>
            </div>

            <button type="submit" className="rounded-lg bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:shadow-lg">
              Save
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
