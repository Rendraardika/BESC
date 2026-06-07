import { useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { apiRequest } from '../lib/api.js';
import indonesiaWilayah from '../indonesia_wilayah.json';

export default function ProfilePage({ onLogin, onLogout, onOlimpiade, onProfile, onRegister, onSaveProfile, onTryout, user }) {
  const profileStorageKey = `besc_profile_${user?.id || user?.email || 'guest'}`;
  const savedProfile = JSON.parse(localStorage.getItem(profileStorageKey) ?? '{}');
  const [profile, setProfile] = useState({
    photo: savedProfile.photo ?? user?.photo ?? '',
    fullName: savedProfile.fullName ?? user?.name ?? '',
    email: user?.email ?? savedProfile.email ?? '',
    whatsapp: savedProfile.whatsapp ?? user?.phone ?? '',
    birthDate: savedProfile.birthDate ?? '',
    school: savedProfile.school ?? user?.institution ?? '',
    gender: savedProfile.gender ?? user?.gender ?? '',
    province: savedProfile.province ?? user?.province ?? '',
    city: savedProfile.city ?? user?.city ?? '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const selectedProvince = indonesiaWilayah.provinsi.find((item) => item.nama === profile.province);
  const cityOptions = useMemo(() => {
    if (!selectedProvince) return [];
    return indonesiaWilayah.kota_kabupaten.filter((item) => String(item.provinsi_id) === String(selectedProvince.id));
  }, [selectedProvince]);

  const inputClass = 'h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100';

  const updateProfile = (field, value) => {
    setProfile((currentProfile) => ({ ...currentProfile, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!profile.photo) {
      setError('Foto profil wajib diunggah sebelum melanjutkan pendaftaran.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      const updatedUser = await apiRequest('/auth/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('besc_token')}` },
        body: JSON.stringify({
          name: profile.fullName,
          phone: profile.whatsapp,
          institution: profile.school,
          photo: profile.photo,
          birth_date: profile.birthDate,
          gender: profile.gender,
          province: profile.province,
          city: profile.city,
        }),
      });
      localStorage.setItem(profileStorageKey, JSON.stringify(profile));
      setSuccess('Profil berhasil disimpan.');
      window.setTimeout(() => onSaveProfile({ ...profile, backendUser: updatedUser }), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Foto profil harus berupa JPG, PNG, atau WEBP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran foto profil maksimal 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile('photo', reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Header onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} onTryout={onTryout} user={user} />
      <main className="bg-slate-50 px-6 py-12 md:px-8">
        <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-7">
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-slate-950">Lengkapi Profil Peserta</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Seluruh data dan foto profil wajib dilengkapi sebelum mengikuti kompetisi BESC.</p>
          </div>

          {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
          {success && (
            <div className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-xs text-white">✓</span>
              {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 sm:flex-row">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white bg-blue-100 text-2xl font-extrabold text-[#1c79c6] shadow">
                {profile.photo ? <img src={profile.photo} alt="Foto profil" className="h-full w-full object-cover" /> : profile.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="text-center sm:text-left">
                <label className="inline-flex cursor-pointer rounded-lg bg-[#0d9488] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#087f75]">
                  Pilih Foto Profil
                  <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} />
                </label>
                <p className="mt-2 text-xs leading-5 text-slate-500">Wajib. Format JPG, PNG, atau WEBP dengan ukuran maksimal 2 MB.</p>
              </div>
            </div>
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
              <select className={inputClass} value={profile.province} onChange={(event) => setProfile((current) => ({ ...current, province: event.target.value, city: '' }))} required>
                <option value="">Pilih Provinsi</option>
                {indonesiaWilayah.provinsi.map((province) => <option key={province.id} value={province.nama}>{province.nama}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Kota Domisili</label>
              <select className={inputClass} value={profile.city} onChange={(event) => updateProfile('city', event.target.value)} required>
                <option value="">Pilih Kota</option>
                {cityOptions.map((city) => <option key={city.id} value={city.nama}>{city.nama}</option>)}
              </select>
            </div>

            <button type="submit" disabled={Boolean(success) || isSaving} className="rounded-lg bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? 'Menyimpan...' : success ? 'Profil Tersimpan' : 'Simpan Profil'}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
