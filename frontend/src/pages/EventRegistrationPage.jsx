import { useState, useMemo, useCallback, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { competitionToEvent } from '../lib/competitions.js';
import { apiRequest, safeSetItem } from '../lib/api.js';
import { MAX_UPLOAD_FILE_SIZE_LABEL, validateUploadFile } from '../lib/fileValidation.js';
import qrisBesc from '../assets/images/qris-besc.webp';

const subtemaOptions = ['Bioenergy Genetics', 'Molecular Bioremediation', 'Microbial Bioenergy', 'Metabolic Engineering', 'Sustainable Biotechnology'];
const steps = [{ id: 1, label: 'Informasi Tim', icon: '👥' }, { id: 2, label: 'Pembayaran', icon: '💳' }, { id: 3, label: 'Verifikasi', icon: '🔍' }];

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${currentStep > step.id ? 'bg-green-500 text-white' : currentStep === step.id ? 'bg-[#1c79c6] text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-500'}`}>
              {currentStep > step.id ? '✓' : step.icon}
            </div>
            <span className={`mt-2 text-[10px] font-bold sm:text-xs ${currentStep >= step.id ? 'text-[#1c79c6]' : 'text-slate-400'}`}>{step.label}</span>
          </div>
          {index < steps.length - 1 && <div className={`mx-1 h-0.5 w-6 sm:w-12 ${currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'}`}></div>}
        </div>
      ))}
    </div>
  );
}

function PersonSection({ onFileError, prefix, form, setForm, showNISN, showUploads, required = true }) {
  const update = useCallback((field, val) => { setForm(`${prefix}_${field}`, val); }, [prefix, setForm]);
  const updateFile = (event, field, label) => {
    const file = event.target.files?.[0];
    const error = validateUploadFile(file, label);
    if (error) {
      event.target.value = '';
      update(field, null);
      onFileError(error);
      return;
    }
    onFileError('');
    update(field, file || null);
  };
  const get = (field) => form[`${prefix}_${field}`] || '';
  const ic = 'h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100';
  const fc = 'h-12 w-full rounded-lg border border-slate-300 bg-white text-sm file:mr-3 file:h-9 file:rounded file:border file:border-slate-300 file:bg-slate-100 file:px-3 file:text-sm';
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Nama Lengkap {required && '*'}</label><input className={ic} value={get('name')} onChange={(e) => update('name', e.target.value)} required={required} /></div>
      {showNISN && <div><label className="mb-1 block text-xs font-semibold text-slate-600">NISN {required && '*'}</label><input className={ic} value={get('nisn')} onChange={(e) => update('nisn', e.target.value)} required={required} /></div>}
      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Kelas {required && '*'}</label><select className={ic} value={get('kelas')} onChange={(e) => update('kelas', e.target.value)} required={required}><option value="" disabled>Pilih Kelas</option><option>VII</option><option>VIII</option><option>IX</option><option>X</option><option>XI</option><option>XII</option></select></div>
      <div><label className="mb-1 block text-xs font-semibold text-slate-600">No WhatsApp {required && '*'}</label><input className={ic} value={get('wa')} onChange={(e) => update('wa', e.target.value)} placeholder="08xxxxxxxxxx" required={required} /></div>
      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Email Aktif {required && '*'}</label><input className={ic} type="email" value={get('email')} onChange={(e) => update('email', e.target.value)} required={required} /></div>
      {showUploads && <>
        <div><label className="mb-1 block text-xs font-semibold text-slate-600">Scan Kartu Pelajar {required && '*'}</label><input className={fc} type="file" accept=".png,.jpg,.jpeg" onChange={(e) => updateFile(e, 'kartuPelajar', 'Scan kartu pelajar')} required={required} /></div>
        <div><label className="mb-1 block text-xs font-semibold text-slate-600">Foto Formal {required && '*'}</label><input className={fc} type="file" accept=".png,.jpg,.jpeg" onChange={(e) => updateFile(e, 'fotoFormal', 'Foto formal')} required={required} /></div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Upload Twibbon {required && '*'}</label>
          <input className={fc} type="file" accept=".png,.jpg,.jpeg" onChange={(e) => updateFile(e, 'twibbon', 'Twibbon')} required={required} />
          <p className="mt-1 text-xs text-slate-500">Download template twibbon: <a href="https://drive.google.com/drive/folders/1To5O0QDokpbTMf8kDtvuAnWVqpSJyBMV" target="_blank" rel="noopener noreferrer" className="text-[#1c79c6] font-semibold hover:underline">Klik di sini</a></p>
          <p className="mt-1 text-xs text-slate-400 italic">"Saya bangga menjadi bagian dari BESC 2026! 🌿"</p>
        </div>
        <div><label className="mb-1 block text-xs font-semibold text-slate-600">Follow IG & TikTok BESC (.pdf) {required && '*'}</label><input className={fc} type="file" accept=".pdf" onChange={(e) => updateFile(e, 'followProof', 'Bukti follow IG & TikTok')} required={required} /></div>
        <div><label className="mb-1 block text-xs font-semibold text-slate-600">Username IG {required && '*'}</label><input className={ic} value={get('ig')} onChange={(e) => update('ig', e.target.value)} placeholder="@username" required={required} /></div>
        <div><label className="mb-1 block text-xs font-semibold text-slate-600">Username TikTok {required && '*'}</label><input className={ic} value={get('tiktok')} onChange={(e) => update('tiktok', e.target.value)} placeholder="@username" required={required} /></div>
      </>}
    </div>
  );
}

function WaIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
}

export default function EventRegistrationPage({ competitionIndex = 0, competitions = [], onLogin, onLogout, onOlimpiade, onProfile, onRegister, onRegistrationSuccess, registrations = [], user }) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (localStorage.getItem('besc_resume_rejected') !== '1') {
      localStorage.removeItem('besc_reg_form');
    }
  }, []);

  const [selectedCompId, setSelectedCompId] = useState(() => {
    if (competitions.length > 0) {
      return competitions[competitionIndex]?.id || competitions[0]?.id || '';
    }
    return '';
  });

  const normalizeCategory = useCallback((value = '') => {
    const raw = String(value ?? '').trim().toLowerCase();
    if (raw.includes('try out')) return 'try out';
    if (raw.includes('lkti') || raw.includes('karya tulis')) return 'lkti';
    if (raw.includes('olimpiade')) return 'olimpiade';
    return raw;
  }, []);

  // Get registered categories from user's registrations
  const registeredCategories = useMemo(() => {
    const categories = new Set();
    registrations.forEach((reg) => {
      const comp = competitions.find((c) => {
        const matchesId = c.id && reg.competition_id && String(c.id) === String(reg.competition_id);
        const matchesSlug = c.slug && reg.competition_slug && String(c.slug) === String(reg.competition_slug);
        const matchesTitle = c.title && reg.competition_title && String(c.title) === String(reg.competition_title);
        return matchesId || matchesSlug || matchesTitle;
      });
      const normalizedCategory = normalizeCategory(comp?.category || '');
      if (comp && normalizedCategory && normalizedCategory !== 'try out') {
        categories.add(normalizedCategory);
      }
    });
    return categories;
  }, [registrations, competitions, normalizeCategory]);

  // Check if a competition can be registered
  const canRegisterCompetition = useCallback((comp) => {
    const normalizedCategory = normalizeCategory(comp?.category || '');
    if (normalizedCategory === 'try out') return true;
    if (registeredCategories.size === 0) return true;

    if (normalizedCategory === 'olimpiade' && registeredCategories.has('olimpiade')) return true;
    if (normalizedCategory === 'lkti' && registeredCategories.has('lkti')) return true;
    if (registeredCategories.has('olimpiade') && normalizedCategory === 'lkti') return false;
    if (registeredCategories.has('lkti') && normalizedCategory === 'olimpiade') return false;

    return true;
  }, [registeredCategories, normalizeCategory]);

  // Get conflict message for a competition
  const getConflictMessage = useCallback((comp) => {
    const normalizedCategory = normalizeCategory(comp?.category || '');
    if (normalizedCategory === 'try out') return '';
    if (normalizedCategory === 'olimpiade' && registeredCategories.has('olimpiade')) return '';
    if (normalizedCategory === 'lkti' && registeredCategories.has('lkti')) return '';
    if (registeredCategories.has('olimpiade') && normalizedCategory === 'lkti') {
      return 'Anda sudah mendaftar olimpiade. Tidak bisa mendaftar LKTI bersamaan.';
    }
    if (registeredCategories.has('lkti') && normalizedCategory === 'olimpiade') {
      return 'Anda sudah mendaftar LKTI. Tidak bisa mendaftar olimpiade bersamaan.';
    }
    return '';
  }, [registeredCategories, normalizeCategory]);

  useEffect(() => {
    if (competitions.length > 0 && !selectedCompId) {
      setSelectedCompId(competitions[competitionIndex]?.id || competitions[0]?.id || '');
    }
  }, [competitions, competitionIndex, selectedCompId]);

  const activeCompetition = useMemo(() => {
    if (!competitions || competitions.length === 0) return null;
    if (selectedCompId) {
      return competitions.find((c) => c.id === selectedCompId) || competitions[competitionIndex] || competitions[0];
    }
    return competitions[competitionIndex] || competitions[0];
  }, [competitions, selectedCompId, competitionIndex]);

  const displayEvents = competitions.length ? competitions.map(competitionToEvent) : [];
  const event = activeCompetition ? competitionToEvent(activeCompetition) : (displayEvents[competitionIndex] ?? displayEvents[0]);
  const isLKTI = event?.title?.toLowerCase().includes('lkti') || event?.title?.toLowerCase().includes('karya tulis') || activeCompetition?.category?.toLowerCase().includes('lkti');
  const paymentPrice = event?.price?.toLowerCase().includes('gratis') || Number(activeCompetition?.price || 0) === 0 ? 'Gratis' : event?.price || 'Rp 90.000';
  const ic = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm';
  const fc = 'h-11 w-full rounded-lg border border-slate-300 bg-white text-sm file:mr-3 file:h-9 file:rounded file:border file:border-slate-300 file:bg-slate-100 file:px-3 file:text-sm';

  const [form, setForm] = useState(() => ({
    namaTim: '',
    ketua_name: user?.name || '',
    ketua_nisn: '',
    ketua_kelas: '',
    ketua_wa: user?.phone || '',
    ketua_email: user?.email || '',
    anggota1_name: '',
    anggota1_nisn: '',
    anggota1_kelas: '',
    anggota1_wa: '',
    anggota1_email: '',
    anggota2_name: '',
    anggota2_nisn: '',
    anggota2_kelas: '',
    anggota2_wa: '',
    anggota2_email: '',
    namaSekolah: user?.institution || '',
    provinsi: user?.province || '',
    kabKota: user?.city || '',
    alamatSekolah: '',
    guru_nama: '',
    guru_hp: '',
    guru_email: '',
    judulAbstrak: '',
    subtema: '',
  }));
  const [proof, setProof] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPreviousTeamData = useCallback(async (resumeRejected = false) => {
    try {
      const category = isLKTI ? 'LKTI' : 'Olimpiade';
      const teamData = await apiRequest(`/me/teams?category=${encodeURIComponent(category)}`);
      if (!teamData || !teamData.id) {
        setError(resumeRejected ? 'Data tim lama tidak ditemukan. Silakan isi ulang data tim.' : 'Belum ada data pendaftaran sebelumnya untuk kategori ini.');
        if (resumeRejected) setCurrentStep(1);
        return;
      }
      setForm((prev) => {
        const next = { ...prev };
        const fill = (key, val) => { if (val !== undefined && val !== null && val !== '') next[key] = val; };
        fill('namaTim', teamData.name);
        fill('ketua_name', teamData.leader_name);
        fill('ketua_nisn', teamData.leader_nisn);
        fill('ketua_kelas', teamData.leader_kelas);
        fill('ketua_wa', teamData.leader_phone);
        fill('ketua_email', teamData.leader_email);
        fill('ketua_ig', teamData.leader_ig);
        fill('ketua_tiktok', teamData.leader_tiktok);
        fill('anggota1_name', teamData.member1_name);
        fill('anggota1_nisn', teamData.member1_nisn);
        fill('anggota1_kelas', teamData.member1_kelas);
        fill('anggota1_wa', teamData.member1_wa);
        fill('anggota1_email', teamData.member1_email);
        fill('anggota1_ig', teamData.member1_ig);
        fill('anggota1_tiktok', teamData.member1_tiktok);
        fill('anggota2_name', teamData.member2_name);
        fill('anggota2_nisn', teamData.member2_nisn);
        fill('anggota2_kelas', teamData.member2_kelas);
        fill('anggota2_wa', teamData.member2_wa);
        fill('anggota2_email', teamData.member2_email);
        fill('anggota2_ig', teamData.member2_ig);
        fill('anggota2_tiktok', teamData.member2_tiktok);
        fill('namaSekolah', teamData.institution);
        fill('provinsi', teamData.province);
        fill('kabKota', teamData.city);
        fill('alamatSekolah', teamData.address);
        fill('guru_nama', teamData.guardian_name);
        fill('guru_hp', teamData.guardian_hp);
        fill('guru_email', teamData.guardian_email);
        if (teamData.notes && teamData.notes.includes('Judul:')) {
          const judulMatch = teamData.notes.match(/Judul:\s*([^|]+)/);
          const subtemaMatch = teamData.notes.match(/Subtema:\s*(.+)/);
          if (judulMatch) fill('judulAbstrak', judulMatch[1].trim());
          if (subtemaMatch) fill('subtema', subtemaMatch[1].trim());
        }
        return next;
      });
      if (resumeRejected) setCurrentStep(2);
      setError('');
    } catch {
      setError('Tidak bisa memuat data pendaftaran sebelumnya. Silakan isi manual.');
      if (resumeRejected) setCurrentStep(1);
    }
  }, [isLKTI]);

  useEffect(() => {
    if (localStorage.getItem('besc_resume_rejected') === '1') {
      loadPreviousTeamData(true);
    }
  }, [activeCompetition?.id, loadPreviousTeamData]);

  // Scroll to top when current step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const setF = (field, value) => {
    setForm((c) => {
      const next = { ...c, [field]: value };
      const toSave = { ...next };
      Object.keys(toSave).forEach((k) => {
        if (k.startsWith('_') || k === 'proof') delete toSave[k];
      });
      safeSetItem('besc_reg_form', JSON.stringify(toSave));
      return next;
    });
  };

  const setFileField = (event, field, label) => {
    const file = event.target.files?.[0];
    const uploadError = validateUploadFile(file, label);
    if (uploadError) {
      event.target.value = '';
      setF(field, null);
      setError(uploadError);
      return;
    }
    setError('');
    setF(field, file || null);
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.namaTim || !form.ketua_name || !form.ketua_nisn || !form.ketua_kelas || !form.ketua_wa || !form.ketua_email || !form.namaSekolah || !form.provinsi || !form.kabKota || !form.alamatSekolah) { setError('Semua field wajib pada Ketua Tim dan Sekolah harus diisi.'); return; }
    // Sync team data to backend
    try {
      await apiRequest('/me/teams', {
        method: 'POST',
        body: JSON.stringify({
          name: form.namaTim,
          leader_name: form.ketua_name,
          leader_email: form.ketua_email,
          leader_phone: form.ketua_wa,
          leader_nisn: form.ketua_nisn,
          leader_kelas: form.ketua_kelas,
          leader_ig: form.ketua_ig || '',
          leader_tiktok: form.ketua_tiktok || '',
          member1_name: form.anggota1_name,
          member1_email: form.anggota1_email,
          member1_nisn: form.anggota1_nisn,
          member1_kelas: form.anggota1_kelas,
          member1_ig: form.anggota1_ig || '',
          member1_tiktok: form.anggota1_tiktok || '',
          member2_name: form.anggota2_name,
          member2_email: form.anggota2_email,
          member2_nisn: form.anggota2_nisn,
          member2_kelas: form.anggota2_kelas,
          member2_ig: form.anggota2_ig || '',
          member2_tiktok: form.anggota2_tiktok || '',
          institution: form.namaSekolah,
          province: form.provinsi,
          city: form.kabKota,
          address: form.alamatSekolah,
          guardian_name: form.guru_nama,
          guardian_hp: form.guru_hp,
          guardian_email: form.guru_email,
          category: isLKTI ? 'LKTI' : 'Olimpiade',
          abstract_title: form.judulAbstrak,
          subtema: form.subtema,
        }),
      });
    } catch (err) {
      console.warn('Gagal sinkronisasi data tim:', err.message);
    }
    setCurrentStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault(); setError('');
    if (!proof) { setError('Bukti pembayaran wajib diunggah.'); return; }
    const proofError = validateUploadFile(proof, 'Bukti pembayaran');
    if (proofError) { setError(proofError); return; }
    setIsSubmitting(true);
    try {
      const competitionList = competitions.length ? competitions : await apiRequest('/competitions?limit=100');
      const targetComp = activeCompetition || competitionList.find((c) => c.id === selectedCompId) || competitionList.find((c) => c.title === event?.title) || competitionList[competitionIndex];
      if (!targetComp) throw new Error('Kompetisi belum tersedia.');
      const registration = await apiRequest(`/competitions/${targetComp.id}/register`, { method: 'POST' });
      const formData = new FormData(); formData.append('proof', proof);
      await apiRequest(`/registrations/${registration.id}/payment-proof`, {
        method: 'POST',
        body: formData,
        timeoutMs: 60000,
        retries: 2,
      });

      const documents = [];
      const collectFile = (type, file) => { if (file) documents.push({ type, file }); };
      ['ketua', 'anggota1', 'anggota2'].forEach((prefix) => {
        ['kartuPelajar', 'fotoFormal', 'twibbon', 'followProof'].forEach((field) => {
          const file = form[`${prefix}_${field}`];
          if (file) collectFile(`${prefix}_${field}`, file);
        });
      });
      if (form._biodataKelompok) collectFile('biodataKelompok', form._biodataKelompok);
      if (form._biodataGuru) collectFile('biodataGuru', form._biodataGuru);
      if (form._abstrak) collectFile('abstrak', form._abstrak);

      for (const item of documents) {
        const docsFormData = new FormData();
        docsFormData.append('documents', item.file, item.file.name);
        docsFormData.append('doc_types', item.type);
        await apiRequest(`/registrations/${registration.id}/documents`, {
          method: 'POST',
          body: docsFormData,
          timeoutMs: 60000,
          retries: 2,
        });
      }
      localStorage.removeItem('besc_reg_form');
      localStorage.removeItem('besc_resume_rejected');
      setCurrentStep(3);
    } catch (err) { setError(err.message); } finally { setIsSubmitting(false); }
  };

  const handleFinish = () => { window.location.hash = 'home'; window.scrollTo(0, 0); };

  const waMessage = useMemo(() => {
    const compName = activeCompetition?.title || event?.title || 'TRY OUT';
    const ketua = form.ketua_name || user?.name || '-';
    const sekolah = form.namaSekolah || user?.institution || '-';
    const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return encodeURIComponent(`Halo, Admin BESC 2026 👋🏼

Saya ingin melakukan konfirmasi pembayaran pendaftaran ${compName}

Berikut data saya:
- Nama Ketua Tim: ${ketua}
- Asal Sekolah: ${sekolah}
- Nominal Pembayaran: ${paymentPrice}
- Tanggal Transfer: ${tanggal}

Bukti pembayaran telah saya lampirkan.

Terima kasih.`);
  }, [activeCompetition, event, form, user, paymentPrice]);

  return (
    <>
      <Header onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} user={user} />
      <main className="bg-slate-50 px-5 py-12 md:px-8">
        <section className="mx-auto max-w-[900px]">
          <h1 className="mb-8 text-center font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-slate-950 md:text-3xl">Alur Pendaftaran</h1>
          <StepIndicator currentStep={currentStep} />
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
            {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

            {currentStep === 1 && (
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-lg">👥</span>
                  <div><h2 className="text-xl font-extrabold text-slate-950">Informasi Tim & Kompetisi</h2><p className="text-sm text-slate-500">Lengkapi data kompetisi, data tim, dan unggah berkas persyaratan</p></div>
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-4">
                  {/* Selector Kompetisi / Lomba */}
                  <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 mb-4">
                    <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-teal-900">
                      Pilihan Kategori Lomba / Kompetisi *
                    </label>
                    {registeredCategories.size > 0 && (
                      <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                        ℹ️ Anda sudah mendaftar <strong>{Array.from(registeredCategories).join(', ')}</strong>. Anda hanya bisa mendaftar kategori yang sama atau Try Out.
                      </div>
                    )}
                    <select 
                      className="h-11 w-full rounded-lg border border-teal-300 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      value={selectedCompId || activeCompetition?.id || ''}
                      onChange={(e) => {
                        setSelectedCompId(e.target.value);
                        const matchedIdx = competitions.findIndex((c) => c.id === e.target.value);
                        if (matchedIdx !== -1) {
                          safeSetItem('besc_competition_index', String(matchedIdx));
                        }
                      }}
                      required
                    >
                      {competitions.map((comp) => {
                        const canRegister = canRegisterCompetition(comp);
                        const conflictMsg = getConflictMessage(comp);
                        return (
                          <option 
                            key={comp.id} 
                            value={comp.id}
                            disabled={!canRegister}
                          >
                            {comp.title} {!canRegister ? `(${conflictMsg})` : ''} - ({Number(comp.price) === 0 ? 'Gratis' : Number(comp.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })})
                          </option>
                        );
                      })}
                    </select>
                    <div className="mt-2 flex items-center justify-between text-xs text-teal-800 font-semibold">
                      <span>Kategori: {activeCompetition?.category || 'Olimpiade'} ({activeCompetition?.level || 'Umum'})</span>
                      <span className="rounded-md bg-teal-100 px-2.5 py-1 font-bold text-teal-950">Biaya: {paymentPrice}</span>
                    </div>
                  </div>

                  <div><label className="mb-1 block text-sm font-semibold text-slate-700">Nama Tim *</label><input className={ic} value={form.namaTim} onChange={(e) => setF('namaTim', e.target.value)} required /></div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h4 className="mb-3 text-sm font-bold text-slate-800">Ketua Tim *</h4><PersonSection prefix="ketua" form={form} setForm={setF} onFileError={setError} showNISN showUploads /></div>
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4"><h4 className="mb-3 text-sm font-bold text-slate-700">Anggota 1 {isLKTI ? '*' : '(opsional)'}</h4><PersonSection prefix="anggota1" form={form} setForm={setF} onFileError={setError} showNISN showUploads required={isLKTI} /></div>
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4"><h4 className="mb-3 text-sm font-bold text-slate-700">Anggota 2 (opsional)</h4><PersonSection prefix="anggota2" form={form} setForm={setF} onFileError={setError} showNISN showUploads required={false} /></div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Lembar Biodata Kelompok (.pdf) {isLKTI ? '*' : '(opsional)'}</label>
                    <p className="mb-2 text-xs text-slate-500">📄 Download template dokumen (lembar pengesahan, biodata, orisinalitas karya): <a href="https://docs.google.com/document/d/1kz6JoIjKzy5YqrZFgsAdUDyUkFsmJAvGcHAyF0q9QzY/edit?usp=drivesdk" target="_blank" rel="noopener noreferrer" className="text-[#1c79c6] font-semibold hover:underline">Klik di sini</a></p>
                    <input className={fc} type="file" accept=".pdf" onChange={(e) => setFileField(e, '_biodataKelompok', 'Lembar biodata kelompok')} required={isLKTI} />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="mb-3 text-sm font-bold text-slate-800">Informasi Sekolah</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Nama Sekolah *</label><input className={ic} value={form.namaSekolah} onChange={(e) => setF('namaSekolah', e.target.value)} required /></div>
                      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Provinsi *</label><input className={ic} value={form.provinsi} onChange={(e) => setF('provinsi', e.target.value)} required /></div>
                      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Kabupaten/Kota *</label><input className={ic} value={form.kabKota} onChange={(e) => setF('kabKota', e.target.value)} required /></div>
                      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Alamat Sekolah *</label><input className={ic} value={form.alamatSekolah} onChange={(e) => setF('alamatSekolah', e.target.value)} required /></div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="mb-3 text-sm font-bold text-slate-800">Informasi Guru Pembimbing (opsional)</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Nama Lengkap (beserta gelar)</label><input className={ic} value={form.guru_nama} onChange={(e) => setF('guru_nama', e.target.value)} /></div>
                      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Nomor HP</label><input className={ic} value={form.guru_hp} onChange={(e) => setF('guru_hp', e.target.value)} /></div>
                      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Email Aktif</label><input className={ic} type="email" value={form.guru_email} onChange={(e) => setF('guru_email', e.target.value)} /></div>
                      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Lembar Biodata Guru (.pdf)</label><input className={fc} type="file" accept=".pdf" onChange={(e) => setFileField(e, '_biodataGuru', 'Lembar biodata guru')} /></div>
                    </div>
                  </div>
                  {isLKTI && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <h4 className="mb-3 text-sm font-bold text-slate-800">Informasi Karya (LKTI)</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div><label className="mb-1 block text-xs font-semibold text-slate-600">Judul Abstrak *</label><input className={ic} value={form.judulAbstrak} onChange={(e) => setF('judulAbstrak', e.target.value)} required /></div>
                        <div><label className="mb-1 block text-xs font-semibold text-slate-600">Pilih Subtema *</label><select className={ic} value={form.subtema} onChange={(e) => setF('subtema', e.target.value)} required><option value="" disabled>Pilih Subtema</option>{subtemaOptions.map((s) => <option key={s}>{s}</option>)}</select></div>
                      </div>
                      <div className="mt-3"><label className="mb-1 block text-xs font-semibold text-slate-600">Upload Abstrak & Lembar Orisinalitas (.pdf) *</label><input className={fc} type="file" accept=".pdf" onChange={(e) => setFileField(e, '_abstrak', 'Abstrak & lembar orisinalitas')} required /></div>
                    </div>
                  )}
                  <button type="submit" className="rounded-xl bg-[#1c79c6] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1560a0]">Lanjut ke Pembayaran →</button>
                </form>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-purple-50 text-lg">💳</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">Pembayaran</h2>
                    <p className="text-sm text-slate-500">Lakukan pembayaran dan unggah bukti transfer</p>
                  </div>
                </div>

                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-xs font-medium text-amber-900">
                  Silakan transfer sebesar <strong className="font-bold text-purple-700">{paymentPrice}</strong> ke rekening di bawah, lalu unggah bukti transfer.
                </div>

                <div className="mb-8 grid gap-6 md:grid-cols-2">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center shadow-sm">
                    <div className="text-xs font-extrabold text-slate-800">Bank Mandiri</div>
                    <div className="mt-4 font-mono text-xl font-extrabold text-[#7c3aed]">1420023460172</div>
                    <div className="mt-1 text-xs font-medium text-slate-500">A.n KHOMSA SALWA NABILA</div>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center shadow-sm">
                    <div className="text-xs font-extrabold text-slate-800">QRIS</div>
                    <div className="mt-3 overflow-hidden rounded-xl border-2 border-purple-400 bg-white p-2 shadow-sm">
                      <img src={qrisBesc} alt="QRIS BESC" className="h-44 w-44 object-contain" />
                    </div>
                    <div className="mt-3 text-xs font-medium text-slate-500">A.n Nabila Shop</div>
                  </div>
                </div>

                <form onSubmit={handleStep2Submit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Bukti Pembayaran *</label>
                    <input className={fc} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
                      const file = e.target.files?.[0];
                      const uploadError = validateUploadFile(file, 'Bukti pembayaran');
                      if (uploadError) {
                        e.target.value = '';
                        setProof(null);
                        setError(uploadError);
                        return;
                      }
                      setError('');
                      setProof(file || null);
                    }} required />
                    <p className="mt-1 text-xs text-slate-500">Format: JPG, PNG, WebP. Maks 5MB.</p>
                  </div>
                  {proof && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-xs font-semibold text-green-700">
                      File terpilih: {proof.name} ({(proof.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setCurrentStep(1)} className="rounded-xl border border-slate-300 px-6 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50">← Kembali</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#1c79c6] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#1560a0] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran'}</button>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">✓</div>
                <h2 className="text-2xl font-extrabold text-slate-950">Pendaftaran Berhasil Dikirim!</h2>
                <p className="mt-2 text-sm text-slate-600">Bukti pembayaran dan berkas tim kamu untuk <strong>{activeCompetition?.title || event?.title}</strong> sedang diverifikasi oleh panitia.</p>
                <div className="mt-6 flex flex-col items-center gap-3">
                  <a href={`https://wa.me/62895631370908?text=${waMessage}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1fb855] shadow-lg shadow-green-600/20">
                    <WaIcon /> Konfirmasi ke WhatsApp Admin
                  </a>
                  <button type="button" onClick={handleFinish} className="rounded-xl border border-slate-300 px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
