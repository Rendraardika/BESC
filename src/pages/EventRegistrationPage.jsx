import { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { events } from '../data/events.js';
import eventStudentBoy from '../assets/images/tryout-student-boy.png';
import eventStudentsGroup from '../assets/images/tryout-students-group.png';
import eventStudentsPair from '../assets/images/tryout-students-pair.png';

const eventImages = [eventStudentsGroup, eventStudentsPair, eventStudentBoy];

export default function EventRegistrationPage({ competitionIndex = 0, onCompetitionDetail, onLogin, onLogout, onOlimpiade, onProfile, onTryout, user }) {
  const [submitted, setSubmitted] = useState(false);
  const event = events[competitionIndex] ?? events[0];
  const image = eventImages[competitionIndex % eventImages.length];
  const isFree = event.price.toLowerCase().includes('gratis');
  const inputClass = 'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-[#1c79c6] focus:ring-4 focus:ring-blue-100';

  const handleSubmit = (submitEvent) => {
    submitEvent.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Header onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} onTryout={onTryout} user={user} />
      <main className="bg-[linear-gradient(180deg,#f8fafc_0%,#eef7f3_45%,#ffffff_100%)] px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <button type="button" onClick={() => onCompetitionDetail(competitionIndex)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-600 shadow-sm transition hover:border-[#1c79c6] hover:text-[#044b86]">
            <span aria-hidden="true">←</span>
            Detail Kompetisi
          </button>

          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
              <div className="relative bg-[linear-gradient(135deg,#052e2b_0%,#0f766e_54%,#0b3b66_100%)] p-6 text-white md:p-8 lg:p-10">
                <div className="absolute right-8 top-8 h-28 w-28 rounded-full border border-white/15"></div>
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl"></div>
                <div className="relative">
                  <div className="mb-5 flex flex-wrap gap-2">
                    {event.badges.map((badge) => <span key={badge} className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-blue-50">{badge}</span>)}
                    <span className="rounded-full bg-emerald-300/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-50">{event.category}</span>
                  </div>
                  <h1 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold leading-tight md:text-4xl">Form Pendaftaran Kompetisi</h1>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50/85">Lengkapi data peserta dan konfirmasi keikutsertaan untuk event yang kamu pilih.</p>

                  <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/12 p-3 backdrop-blur">
                    <img src={image} alt={event.title} className="h-60 w-full rounded-[1rem] object-cover object-center" />
                    <div className="p-4">
                      <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold leading-8">{event.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-emerald-50/80">{event.desc}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <SummaryBox label="Biaya" value={event.price} />
                    <SummaryBox label="Deadline" value={event.deadline} />
                    <SummaryBox label="Kuota" value={event.participants} />
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 lg:p-10">
                {submitted && (
                  <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold leading-6 text-emerald-800">
                    Pendaftaran berhasil dikirim. Tim BESC akan memverifikasi data kamu melalui dashboard peserta.
                  </div>
                )}

                <div className="mb-7 rounded-2xl border-l-4 border-[#1c79c6] bg-blue-50 p-5">
                  <div className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-slate-950">
                    {isFree ? 'Konfirmasi Pendaftaran Gratis' : 'Pendaftaran Berbayar'}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {isFree
                      ? 'Event ini tidak membutuhkan pembayaran. Pastikan data peserta benar sebelum menekan tombol daftar.'
                      : `Silakan transfer ${event.price}, lalu unggah bukti pembayaran pada form di bawah.`}
                  </p>
                </div>

                {!isFree && (
                  <div className="mb-8 grid gap-4 md:grid-cols-2">
                    <PaymentCard title="Bank BCA" value="4690372555" desc="A.n BESC Indonesia" />
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                      <div className="mb-4 text-sm font-extrabold text-slate-800">QRIS</div>
                      <div className="mx-auto grid h-36 w-36 grid-cols-5 gap-1 rounded-xl border-4 border-[#1c79c6] bg-white p-3">
                        {Array.from({ length: 25 }).map((_, index) => (
                          <span key={index} className={`rounded-sm ${index % 2 === 0 || index % 7 === 0 ? 'bg-slate-950' : 'bg-slate-200'}`}></span>
                        ))}
                      </div>
                      <div className="mt-4 text-sm font-semibold text-slate-600">A.n BESC Indonesia</div>
                    </div>
                  </div>
                )}

                <form className="grid gap-5" onSubmit={handleSubmit}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Nama Peserta">
                      <input className={inputClass} defaultValue={user?.name ?? ''} type="text" required />
                    </Field>
                    <Field label="Nomor WhatsApp Peserta">
                      <input className={inputClass} type="tel" placeholder="08xxxxxxxxxx" required />
                    </Field>
                    <Field label="Asal Sekolah">
                      <input className={inputClass} type="text" placeholder="Nama sekolah" required />
                    </Field>
                    <Field label="Kelas">
                      <select className={inputClass} defaultValue="" required>
                        <option value="" disabled>Pilih kelas</option>
                        <option>X</option>
                        <option>XI</option>
                        <option>XII</option>
                        <option>SMP/MTs</option>
                      </select>
                    </Field>
                  </div>

                  <Field label={isFree ? 'Kartu Pelajar / Identitas' : 'Bukti Pembayaran'}>
                    <input className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#1c79c6] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white" type="file" accept="image/*,.pdf" required={!isFree} />
                    <p className="mt-2 text-xs font-semibold text-slate-500">{isFree ? 'Opsional, unggah jika diminta panitia.' : 'Wajib, ukuran maksimal 5 MB.'}</p>
                  </Field>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Nama Guru Pendamping">
                      <input className={inputClass} type="text" placeholder="Opsional" />
                    </Field>
                    <Field label="Telepon Guru Pendamping">
                      <input className={inputClass} type="tel" placeholder="Opsional" />
                    </Field>
                  </div>

                  <button type="submit" className="mt-2 w-full rounded-2xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:brightness-110 md:w-fit md:px-10">
                    Daftar Kompetisi
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function SummaryBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/12 p-4 backdrop-blur">
      <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-100/70">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-white">{value}</div>
    </div>
  );
}

function PaymentCard({ desc, title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <div className="text-sm font-semibold text-slate-600">{title}</div>
      <div className="mt-4 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#1c79c6]">{value}</div>
      <div className="mt-4 text-sm font-semibold text-slate-700">{desc}</div>
    </div>
  );
}

function Field({ children, label }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
