import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { apiRequest, safeSetItem } from '../lib/api.js';
import { MAX_UPLOAD_FILE_SIZE_LABEL, validateUploadFile } from '../lib/fileValidation.js';
import { normalizePhotoSrc } from '../lib/photoUtils.js';
import indonesiaWilayah from '../indonesia_wilayah.json';

export default function ProfilePage({ onLogin, onLogout, onOlimpiade, onProfile, onRegister, onSaveProfile, onTryout, user }) {
  const profileStorageKey = `besc_profile_${user?.id || user?.email || 'guest'}`;
  const readCachedProfile = () => JSON.parse(localStorage.getItem(profileStorageKey) ?? '{}');
  const profileFromServer = () => {
    const savedProfile = readCachedProfile();
    const prov = user?.province || savedProfile.province || '';
    const cit = user?.city || savedProfile.city || '';
    // Validate city matches province
    let validCity = cit;
    if (prov && cit) {
      const provinsi = indonesiaWilayah.provinsi?.find((p) => p.nama === prov);
      if (provinsi) {
        const kotaList = indonesiaWilayah.kota_kabupaten?.filter((k) => String(k.provinsi_id) === String(provinsi.id)) || [];
        if (!kotaList.find((k) => k.nama === cit)) validCity = '';
      }
    }
    return {
      photo: user?.photo || savedProfile.photo || '',
      fullName: user?.name || savedProfile.fullName || '',
      email: user?.email || savedProfile.email || '',
      whatsapp: user?.phone || savedProfile.whatsapp || '',
      birthDate: user?.birth_date ? String(user.birth_date).slice(0, 10) : savedProfile.birthDate || '',
      school: user?.institution || savedProfile.school || '',
      gender: user?.gender || savedProfile.gender || '',
      province: prov,
      city: validCity,
      cardPhoto: user?.student_card || savedProfile.cardPhoto || '',
      teamName: user?.team_name || savedProfile.teamName || '',
      member1Name: user?.member1_name || savedProfile.member1Name || '',
      member2Name: user?.member2_name || savedProfile.member2Name || '',
    };
  };
  const [profile, setProfile] = useState(profileFromServer);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const provinceOptions = indonesiaWilayah.provinsi || [];
  const selectedProvince = useMemo(() => provinceOptions.find((item) => item.nama === profile.province), [profile.province, provinceOptions]);
  const cityOptions = useMemo(() => {
    if (!selectedProvince) return [];
    const pid = String(selectedProvince.id);
    return indonesiaWilayah.kota_kabupaten.filter((item) => String(item.provinsi_id) === pid);
  }, [selectedProvince]);

  // Validate city matches province on load
  useEffect(() => {
    if (profile.province && profile.city && cityOptions.length > 0) {
      const cityMatch = cityOptions.find((c) => c.nama === profile.city);
      if (!cityMatch && profile.city) {
        setProfile((current) => ({ ...current, city: '' }));
      }
    }
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
        body: JSON.stringify({
          name: profile.fullName,
          phone: profile.whatsapp,
          institution: profile.school,
          photo: profile.photo,
          birth_date: profile.birthDate,
          gender: profile.gender,
          province: profile.province,
          city: profile.city,
          student_card: profile.cardPhoto,
          team_name: profile.teamName,
          member1_name: profile.member1Name,
          member2_name: profile.member2Name,
        }),
      });
      safeSetItem(profileStorageKey, JSON.stringify(profile));
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
    const uploadError = validateUploadFile(file, 'Foto profil');
    if (uploadError) {
      event.target.value = '';
      setError(uploadError);
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
                {normalizePhotoSrc(profile.photo) ? <img src={normalizePhotoSrc(profile.photo)} alt="Foto profil" className="h-full w-full object-cover" /> : profile.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="text-center sm:text-left">
                <label className="inline-flex cursor-pointer rounded-lg bg-[#0d9488] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#087f75]">
                  Pilih Foto Profil
                  <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} />
                </label>
                <p className="mt-2 text-xs leading-5 text-slate-500">Wajib. Format JPG, PNG, atau WEBP dengan ukuran maksimal {MAX_UPLOAD_FILE_SIZE_LABEL}.</p>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Nama Lengkap</label>
              <input className={inputClass} value={profile.fullName} onChange={(event) => updateProfile('fullName', event.target.value)} required type="text" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Email</label>
              <input className={`${inputClass} bg-slate-100 text-slate-500`} disabled value={profile.email} type="email" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Nomor WhatsApp</label>
                <input className={inputClass} placeholder="Contoh: 08123456789" value={profile.whatsapp} onChange={(event) => updateProfile('whatsapp', event.target.value)} required type="tel" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Tanggal Lahir</label>
                <input className={inputClass} value={profile.birthDate} onChange={(event) => updateProfile('birthDate', event.target.value)} required type="date" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Instansi / Asal Sekolah</label>
                <input className={inputClass} placeholder="Contoh: SMAN 1 Surabaya" value={profile.school} onChange={(event) => updateProfile('school', event.target.value)} required type="text" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Jenis Kelamin</label>
                <select className={inputClass} value={profile.gender} onChange={(event) => updateProfile('gender', event.target.value)} required>
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Provinsi Domisili</label>
                <select className={inputClass} value={profile.province} onChange={(event) => { updateProfile('province', event.target.value); updateProfile('city', ''); }} required>
                  <option value="">Pilih Provinsi</option>
                  {provinceOptions.map((item) => (
                    <option key={item.id} value={item.nama}>{item.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Kota / Kabupaten</label>
                <select className={inputClass} disabled={!profile.province} value={profile.city} onChange={(event) => updateProfile('city', event.target.value)} required>
                  <option value="">{profile.province ? 'Pilih Kota / Kabupaten' : 'Pilih provinsi terlebih dahulu'}</option>
                  {cityOptions.map((item) => (
                    <option key={item.id} value={item.nama}>{item.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Team Data (can also be filled/edited here) */}
            <div className="border-t border-slate-200 pt-5">
              <h3 className="text-sm font-extrabold text-slate-800">Informasi Tim (Khusus Kategori Beregu)</h3>
              <p className="mt-1 text-xs text-slate-500">Opsional — isi jika Anda ketua tim atau mendaftar kategori beregu (LKTI/Olimpiade Tim).</p>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Nama Tim</label>
                  <input className={inputClass} placeholder="Contoh: Tim Biologi Hebat" value={profile.teamName} onChange={(event) => updateProfile('teamName', event.target.value)} type="text" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Nama Anggota 1</label>
                    <input className={inputClass} placeholder="Nama lengkap anggota 1" value={profile.member1Name} onChange={(event) => updateProfile('member1Name', event.target.value)} type="text" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Nama Anggota 2 (opsional)</label>
                    <input className={inputClass} placeholder="Nama lengkap anggota 2" value={profile.member2Name} onChange={(event) => updateProfile('member2Name', event.target.value)} type="text" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
              <button className="h-11 rounded-lg bg-[#1c79c6] px-6 text-sm font-extrabold text-white shadow-md shadow-blue-500/20 transition hover:bg-[#1565a6] disabled:opacity-60" disabled={isSaving} type="submit">
                {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </form>
        </section>
      </main>
      <Footer onOlimpiade={onOlimpiade} />
    </>
  );
}
