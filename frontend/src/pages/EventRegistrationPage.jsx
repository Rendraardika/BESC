import { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { events } from '../data/events.js';
import eventStudentBoy from '../assets/images/tryout-student-boy.png';
import eventStudentsGroup from '../assets/images/tryout-students-group.png';
import eventStudentsPair from '../assets/images/tryout-students-pair.png';
import qrisBesc from '../assets/images/qris-besc.jpg';
import { apiRequest } from '../lib/api.js';

const eventImages = [eventStudentsGroup, eventStudentsPair, eventStudentBoy];

export default function EventRegistrationPage({ competitionIndex = 0, onLogin, onLogout, onOlimpiade, onProfile, onRegistrationSuccess, onTryout, user }) {
  const savedProfile = JSON.parse(localStorage.getItem(`besc_profile_${user?.id || user?.email || 'guest'}`) ?? '{}');
  const [proof, setProof] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const event = events[competitionIndex] ?? events[0];
  const eventImage = eventImages[competitionIndex % eventImages.length];
  const paymentPrice = event.price.toLowerCase().includes('gratis') ? event.original : event.price;
  const inputClass = 'h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100';

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    setError('');
    if (!proof) {
      setError('Bukti pembayaran wajib dipilih.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('besc_token');
      const competition = await apiRequest(`/competitions?limit=100`);
      const selectedCompetition = competition.find((item) => item.title === event.title) || competition[competitionIndex];
      if (!selectedCompetition) throw new Error('Kompetisi belum tersedia di database.');

      const registration = await apiRequest(`/competitions/${selectedCompetition.id}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const formData = new FormData();
      formData.append('proof', proof);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1'}/registrations/${registration.id}/payment-proof`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.success === false) throw new Error(body.message || 'Gagal mengunggah bukti pembayaran.');

      onRegistrationSuccess(event.title);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} onTryout={onTryout} user={user} />
      <main className="bg-white px-5 py-12 md:px-8">
        <section className="mx-auto max-w-[1540px] rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-[0_2px_14px_rgba(15,23,42,0.08)] md:px-9 lg:px-10">
          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-slate-950 md:text-3xl">
            Pendaftaran Berbayar (Premium)
          </h1>

          <div className="mt-5 rounded-md border-l-4 border-yellow-400 bg-yellow-50 px-5 py-4">
            <p className="text-base leading-7 text-slate-900">
              Kamu bisa mengikuti event ini dengan cukup membayar <span className="font-extrabold text-[#7c1cc6]">{paymentPrice}</span>. Submit bukti transfer ke form dibawah ini.
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-700">
              Jika kamu mengalami kesulitan, silakan hubungi admin melalui WhatsApp BESC.
            </p>
          </div>

          <div className="mx-auto mt-8 flex max-w-[980px] flex-col items-center gap-6 rounded-lg bg-slate-50 px-5 py-5 md:flex-row md:justify-center md:px-7">
            <img src={eventImage} alt={event.title} className="h-36 w-full max-w-[320px] rounded-md object-cover object-center md:w-[320px]" />
            <h2 className="max-w-[560px] text-center font-['Plus_Jakarta_Sans'] text-xl font-extrabold leading-8 text-slate-950 md:text-2xl">
              {event.title}
            </h2>
          </div>

          <p className="mt-8 text-center text-base text-slate-900">Lakukan pembayaran ke salah satu metode pembayaran dibawah ini :</p>

          <div className="mx-auto mt-6 grid max-w-[980px] gap-6">
            <PaymentBox title="Bank BCA" value="4690372555" owner="A.n BESC Indonesia" />
            <div className="rounded-lg border border-slate-300 bg-white px-6 py-10 text-center">
              <p className="text-base text-slate-900">QRIS</p>
              <img src={qrisBesc} alt="QRIS BESC" className="mx-auto mt-6 w-full max-w-[360px] rounded-sm border-[8px] border-[#7c1cc6] bg-white object-contain" />
              <p className="mt-6 text-base text-slate-900">A.n BESC Indonesia</p>
            </div>
          </div>

          <form className="mt-8 space-y-7" onSubmit={handleSubmit} noValidate>
            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
            <Field label="Bukti Pembayaran">
              <input className="h-10 w-full border border-slate-100 bg-white text-sm text-slate-900 file:mr-2 file:h-9 file:border file:border-slate-400 file:bg-slate-100 file:px-3 file:text-sm file:text-slate-950" type="file" accept="image/jpeg,image/png,image/webp" onChange={(uploadEvent) => setProof(uploadEvent.target.files?.[0] || null)} required />
              <p className="mt-2 text-sm text-slate-900">
                <span className="font-bold text-red-500">Wajib</span>
                {' '} - Pastikan ukuran foto dibawah <span className="font-extrabold">5mb</span>
              </p>
            </Field>

            <Field label="Nama Peserta">
              <input className={inputClass} defaultValue={savedProfile.fullName ?? user?.name ?? ''} type="text" />
            </Field>

            <Field label="Nomor WhatsApp Peserta">
              <input className={inputClass} defaultValue={savedProfile.whatsapp ?? ''} type="tel" placeholder="08xxxxxxxxxx" />
            </Field>

            <Field label="Asal Sekolah">
              <input className={inputClass} defaultValue={savedProfile.school ?? ''} type="text" placeholder="Nama sekolah" />
            </Field>

            <Field label="Kelas">
              <select className={inputClass} defaultValue="">
                <option value="" disabled>Pilih kelas</option>
                <option>VII</option>
                <option>VIII</option>
                <option>IX</option>
                <option>X</option>
                <option>XI</option>
                <option>XII</option>
              </select>
            </Field>

            <Field label="Nama Guru Pendamping">
              <input className={inputClass} type="text" />
              <p className="mt-3 text-sm text-slate-900">Opsional - silakan cantumkan untuk dokumentasi dan apresiasi.</p>
            </Field>

            <Field label="Nomor Telephone Guru Pendamping">
              <input className={inputClass} type="tel" />
              <p className="mt-3 text-sm text-slate-900">Opsional - silakan cantumkan untuk dokumentasi dan apresiasi.</p>
            </Field>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
            <button type="submit" disabled={isSubmitting} className="rounded-md bg-[#f6bd3c] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#e3a928] disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Mengirim...' : 'Daftar'}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}

function PaymentBox({ owner, title, value }) {
  return (
    <div className="rounded-lg border border-slate-300 bg-white px-6 py-12 text-center">
      <p className="text-base text-slate-900">{title}</p>
      <p className="mt-7 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#7c1cc6]">{value}</p>
      <p className="mt-7 text-base text-slate-900">{owner}</p>
    </div>
  );
}

function Field({ children, label }) {
  return (
    <label className="block">
      <span className="mb-3 block text-sm font-semibold text-slate-950">{label}</span>
      {children}
    </label>
  );
}
