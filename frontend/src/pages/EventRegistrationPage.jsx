import { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { competitionToEvent } from '../lib/competitions.js';
import qrisBesc from '../assets/images/qris-besc.jpeg';
import { API_URL, apiRequest } from '../lib/api.js';

const steps = [
  { id: 1, label: 'Daftar Kompetisi', icon: '📝' },
  { id: 2, label: 'Pembayaran', icon: '💳' },
  { id: 3, label: 'Verifikasi', icon: '🔍' },
  { id: 4, label: 'Aktivasi Akun', icon: '✅' },
];

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
              currentStep > step.id ? 'bg-green-500 text-white' :
              currentStep === step.id ? 'bg-[#1c79c6] text-white ring-4 ring-blue-100' :
              'bg-slate-200 text-slate-500'
            }`}>
              {currentStep > step.id ? '✓' : step.icon}
            </div>
            <span className={`mt-2 text-[10px] font-bold sm:text-xs ${
              currentStep >= step.id ? 'text-[#1c79c6]' : 'text-slate-400'
            }`}>{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`mx-1 h-0.5 w-6 sm:w-12 ${
              currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function EventRegistrationPage({ competitionIndex = 0, competitions = [], onLogin, onLogout, onOlimpiade, onProfile, onRegistrationSuccess, onTryout, user }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [proof, setProof] = useState(null);
  const [ftProof, setFtProof] = useState(null);
  const [registrationData, setRegistrationData] = useState({
    fullName: user?.name || '',
    whatsapp: user?.phone || '',
    school: user?.institution || '',
    classLevel: '',
    teacherName: '',
    teacherPhone: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  const displayEvents = competitions.length ? competitions.map(competitionToEvent) : [];
  const event = displayEvents[competitionIndex] ?? displayEvents[0];
  const paymentPrice = event?.price?.toLowerCase().includes('gratis') ? event.original : event?.price;
  const requirementText = event?.competition?.participant_requirements || '';
  const requirements = requirementText.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const inputClass = 'h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100';

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError('');
    if (!registrationData.fullName || !registrationData.whatsapp || !registrationData.school || !registrationData.classLevel) {
      setError('Semua field wajib diisi.');
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!proof) {
      setError('Bukti pembayaran wajib dipilih.');
      return;
    }
    if (!ftProof) {
      setError('Bukti upload Twibbon / share poster wajib dipilih.');
      return;
    }

    setIsSubmitting(true);
    try {
      const competition = competitions.length ? competitions : await apiRequest('/competitions?limit=100');
      const selectedCompetition = event?.competition || competition.find((item) => item.title === event?.title) || competition[competitionIndex];
      if (!selectedCompetition) throw new Error('Kompetisi belum tersedia di database.');

      const registration = await apiRequest(`/competitions/${selectedCompetition.id}/register`, {
        method: 'POST',
      });

      const formData = new FormData();
      formData.append('proof', proof);
      formData.append('ft_proof', ftProof);
      let response;
      try {
        response = await fetch(`${API_URL}/registrations/${registration.id}/payment-proof`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
      } catch (uploadError) {
        throw new Error(`Tidak bisa mengunggah bukti pembayaran ke server API (${API_URL}).`);
      }
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.success === false) throw new Error(body.message || 'Gagal mengunggah bukti pembayaran.');

      setRegistrationResult({ registration, competition: selectedCompetition });
      setCurrentStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    onRegistrationSuccess(event?.title || 'Kompetisi BESC');
  };

  return (
    <>
      <Header onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} onTryout={onTryout} user={user} />
      <main className="bg-slate-50 px-5 py-12 md:px-8">
        <section className="mx-auto max-w-[900px]">
          <h1 className="mb-8 text-center font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-slate-950 md:text-3xl">
            Alur Pendaftaran
          </h1>

          <StepIndicator currentStep={currentStep} />

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
            {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

            {/* Step 1: Daftar Kompetisi */}
            {currentStep === 1 && (
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-lg">📝</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">Daftar Kompetisi</h2>
                    <p className="text-sm text-slate-500">Lengkapi data diri untuk pendaftaran</p>
                  </div>
                </div>

                {requirements.length > 0 && (
                  <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h3 className="mb-2 text-sm font-bold text-blue-800">Persyaratan Peserta:</h3>
                    <ul className="space-y-1 text-sm text-blue-700">
                      {requirements.map((r) => <li key={r}>• {r}</li>)}
                    </ul>
                  </div>
                )}

                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <Field label="Nama Lengkap Peserta *">
                    <input className={inputClass} value={registrationData.fullName} onChange={(e) => setRegistrationData((c) => ({ ...c, fullName: e.target.value }))} required />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nomor WhatsApp *">
                      <input className={inputClass} value={registrationData.whatsapp} onChange={(e) => setRegistrationData((c) => ({ ...c, whatsapp: e.target.value }))} placeholder="08xxxxxxxxxx" required />
                    </Field>
                    <Field label="Kelas *">
                      <select className={inputClass} value={registrationData.classLevel} onChange={(e) => setRegistrationData((c) => ({ ...c, classLevel: e.target.value }))} required>
                        <option value="" disabled>Pilih kelas</option>
                        <option>VII</option><option>VIII</option><option>IX</option>
                        <option>X</option><option>XI</option><option>XII</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Asal Sekolah *">
                    <input className={inputClass} value={registrationData.school} onChange={(e) => setRegistrationData((c) => ({ ...c, school: e.target.value }))} placeholder="Nama sekolah" required />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nama Guru Pendamping (opsional)">
                      <input className={inputClass} value={registrationData.teacherName} onChange={(e) => setRegistrationData((c) => ({ ...c, teacherName: e.target.value }))} />
                    </Field>
                    <Field label="No. Telp Guru Pendamping (opsional)">
                      <input className={inputClass} value={registrationData.teacherPhone} onChange={(e) => setRegistrationData((c) => ({ ...c, teacherPhone: e.target.value }))} />
                    </Field>
                  </div>
                  <button type="submit" className="rounded-xl bg-[#1c79c6] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1560a0]">
                    Lanjut ke Pembayaran →
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Pembayaran */}
            {currentStep === 2 && (
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-purple-50 text-lg">💳</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">Pembayaran</h2>
                    <p className="text-sm text-slate-500">Lakukan pembayaran dan unggah bukti</p>
                  </div>
                </div>

                <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                  Silakan transfer sebesar <span className="font-extrabold text-[#7c1cc6]">{paymentPrice}</span> ke salah satu rekening di bawah, lalu unggah bukti transfer.
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
                    <p className="text-sm font-bold text-slate-700">Bank BCA</p>
                    <p className="mt-3 font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-[#7c1cc6]">4690372555</p>
                    <p className="mt-2 text-xs text-slate-500">A.n BESC Indonesia</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
                    <p className="text-sm font-bold text-slate-700">QRIS</p>
                    <img src={qrisBesc} alt="QRIS BESC" className="mx-auto mt-3 w-full max-w-[200px] rounded border-4 border-[#7c1cc6] bg-white object-contain" />
                    <p className="mt-2 text-xs text-slate-500">A.n BESC Indonesia</p>
                  </div>
                </div>

                <form onSubmit={handleStep2Submit} className="space-y-4">
                  <Field label="Bukti Pembayaran *">
                    <input className="h-11 w-full rounded-lg border border-slate-300 bg-white text-sm file:mr-3 file:h-9 file:rounded file:border file:border-slate-300 file:bg-slate-100 file:px-3 file:text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setProof(e.target.files?.[0] || null)} required />
                    <p className="mt-1 text-xs text-slate-500">Format: JPG, PNG, WebP. Maks 5MB.</p>
                  </Field>
                  <Field label="Bukti Twibbon / Share Poster *">
                    <input className="h-11 w-full rounded-lg border border-slate-300 bg-white text-sm file:mr-3 file:h-9 file:rounded file:border file:border-slate-300 file:bg-slate-100 file:px-3 file:text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFtProof(e.target.files?.[0] || null)} required />
                    <p className="mt-1 text-xs text-slate-500">Screenshot Twibbon atau bukti share poster ke 3 grup.</p>
                  </Field>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setCurrentStep(1)} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                      ← Kembali
                    </button>
                    <button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#1c79c6] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1560a0] disabled:cursor-not-allowed disabled:opacity-60">
                      {isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Verifikasi */}
            {currentStep === 3 && (
              <div className="text-center">
                <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-amber-100 text-4xl">🔍</div>
                <h2 className="text-2xl font-extrabold text-slate-950">Menunggu Verifikasi</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 max-w-md mx-auto">
                  Pendaftaran dan bukti pembayaran kamu sedang diverifikasi oleh admin BESC.
                  Proses ini biasanya memakan waktu <span className="font-bold text-[#1c79c6]">1×24 jam</span>.
                </p>
                <div className="mx-auto mt-6 max-w-sm rounded-lg border border-blue-200 bg-blue-50 p-4 text-left text-sm text-blue-800">
                  <p className="font-bold">Yang perlu kamu lakukan:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Cek email atau WhatsApp untuk notifikasi</li>
                    <li>• Jika belum diterima, hubungi admin</li>
                    <li>• Jika ditolak, kamu bisa upload ulang bukti</li>
                  </ul>
                </div>
                <button onClick={() => setCurrentStep(4)} className="mt-6 rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-600">
                  Lanjut →
                </button>
              </div>
            )}

            {/* Step 4: Aktivasi */}
            {currentStep === 4 && (
              <div className="text-center">
                <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-green-100 text-4xl">✅</div>
                <h2 className="text-2xl font-extrabold text-slate-950">Pendaftaran Selesai!</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 max-w-md mx-auto">
                  Kamu sudah terdaftar di kompetisi <span className="font-bold text-[#1c79c6]">{event?.title || 'BESC'}</span>.
                  Tunggu verifikasi dari admin, lalu kamu bisa mengikuti kompetisi.
                </p>
                <div className="mx-auto mt-6 max-w-sm rounded-lg border border-green-200 bg-green-50 p-4 text-left text-sm text-green-800">
                  <p className="font-bold">Selanjutnya:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Cek status pendaftaran di profil kamu</li>
                    <li>• Setelah diverifikasi, kamu bisa mulai ujian</li>
                    <li>• Ikuti technical meeting sesuai jadwal</li>
                  </ul>
                </div>
                <button onClick={handleFinish} className="mt-6 rounded-xl bg-[#1c79c6] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1560a0]">
                  Kembali ke Beranda
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Field({ children, label }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
