import { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { events } from '../data/events.js';
import { competitionToEvent } from '../lib/competitions.js';
import eventStudentBoy from '../assets/images/tryout-student-boy.png';
import eventStudentsGroup from '../assets/images/tryout-students-group.png';
import eventStudentsPair from '../assets/images/tryout-students-pair.png';

const eventImages = [eventStudentsGroup, eventStudentsPair, eventStudentBoy];

const timeline = [
  ['Pendaftaran', 'Agustus - September 2026', 'Lengkapi data peserta dan pilih kategori kompetisi.'],
  ['Technical Meeting', 'Akhir September 2026', 'Peserta menerima briefing teknis, tata tertib, dan jadwal pengerjaan.'],
  ['Pengerjaan Online', 'Oktober 2026', 'Ujian dilakukan melalui sistem online dengan batas waktu yang ditentukan.'],
  ['Pengumuman', 'Oktober 2026', 'Hasil akhir, sertifikat, dan penghargaan diumumkan melalui dashboard peserta.'],
];

const benefits = [
  'Sertifikat nasional untuk seluruh peserta',
  'Medali dan penghargaan untuk peserta terbaik',
  'Pengalaman kompetisi online berbasis CBT',
  'Materi latihan dan pembahasan terkurasi',
];

const systems = [
  ['Format', 'Pilihan ganda berbasis konsep, analisis, dan pemahaman biologi.'],
  ['Durasi', '60 menit pengerjaan dengan sistem otomatis.'],
  ['Akses', 'Dapat dikerjakan online menggunakan laptop atau ponsel.'],
  ['Penilaian', 'Skor dihitung otomatis dan dapat dipantau melalui dashboard.'],
];

const faqs = [
  ['Apakah kompetisi ini online?', 'Ya, seluruh rangkaian kompetisi dilakukan secara online dan dapat diikuti dari seluruh Indonesia.'],
  ['Apakah peserta mendapatkan sertifikat?', 'Ya, peserta mendapatkan sertifikat keikutsertaan. Pemenang mendapatkan sertifikat penghargaan tambahan.'],
  ['Siapa yang bisa mengikuti kompetisi ini?', 'Peserta dapat mengikuti sesuai jenjang yang tercantum pada kategori lomba, seperti SMP atau SMA.'],
];

const getRequirementLines = (competition) => {
  const source = competition?.participant_requirements || competition?.requirements || competition?.terms || '';
  return String(source)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

export default function CompetitionDetailPage({ competitionIndex = 0, competitions = [], onCompetitionDetail, onEventRegistration, onLogin, onLogout, onOlimpiade, onProfile, onRegister, onTryout, onVerifiedCompetition, registrations = [], user }) {
  const [bannerFailed, setBannerFailed] = useState(false);
  const displayEvents = competitions.length ? competitions.map(competitionToEvent) : events;
  const event = displayEvents[competitionIndex] ?? displayEvents[0] ?? events[0];
  const competition = event.competition || competitions[competitionIndex];
  const registration = competition ? registrations.find((item) => item.competition_id === competition.id) : null;
  const isVerified = registration?.status === 'verified';
  const isRejected = registration?.status === 'rejected' || registration?.payment_status === 'rejected';
  const registrationDeadlineMs = competition?.registration_deadline ? new Date(competition.registration_deadline).getTime() : null;
  const registrationClosed = registrationDeadlineMs ? Date.now() > registrationDeadlineMs : false;
  const showBanner = Boolean(event.banner) && !bannerFailed;
  const relatedEvents = displayEvents.filter((item) => item.title !== event.title);
  const requirementLines = getRequirementLines(competition);
  const registrationStatus = isVerified
    ? 'Pembayaran Terverifikasi'
    : isRejected
      ? 'Pembayaran Ditolak'
      : registration
        ? 'Menunggu Verifikasi'
        : registrationClosed
          ? 'Pendaftaran Ditutup'
          : 'Pendaftaran Dibuka';
  const actionLabel = isVerified ? 'Lihat Ketentuan Ujian' : isRejected ? 'Upload Ulang Bukti' : registration ? 'Menunggu Verifikasi' : registrationClosed ? 'Pendaftaran Ditutup' : 'Daftar Sekarang';
  const actionHint = isVerified
    ? 'Pembayaran kamu sudah dikonfirmasi admin. Kamu bisa membuka ketentuan ujian.'
    : isRejected
      ? 'Bukti pembayaran belum diterima. Silakan upload ulang bukti yang benar.'
      : registration
        ? 'Bukti pembayaran sudah diterima dan sedang diperiksa admin.'
        : registrationClosed
          ? 'Maaf, batas waktu pendaftaran telah berlalu.'
          : 'Pastikan data profil sudah lengkap sebelum mengikuti kompetisi.';

  const handlePrimaryAction = () => {
    if (isVerified && registration) {
      onVerifiedCompetition?.(registration);
      return;
    }
    if (!registration || isRejected) {
      onEventRegistration();
    }
  };

  return (
    <>
      <Header onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} onTryout={onTryout} user={user} />
      <main className="relative bg-[linear-gradient(180deg,#f8fafc_0%,#eef7f3_42%,#ffffff_100%)] px-5 py-10 md:px-8">
        <div className="pointer-events-none absolute left-[-160px] top-12 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl"></div>
        <div className="pointer-events-none absolute right-[-120px] top-80 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl"></div>

        <div className="relative mx-auto max-w-5xl space-y-8">
          <div className="space-y-8">
            <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
              {showBanner ? (
                <img src={event.banner} alt={event.title} onError={() => setBannerFailed(true)} className="aspect-[16/5] w-full object-cover" />
              ) : (
                <div className="grid aspect-[16/5] w-full place-items-center bg-[#073b4c] px-6 text-center">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-teal-200">BESC Competition</div>
                    <div className="mt-3 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-white md:text-3xl">{event.title}</div>
                  </div>
                </div>
              )}

              <div className="p-5 md:p-7">
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-extrabold uppercase text-[#044b86]">{tag}</span>)}
                  {event.badges.map((badge) => <span key={badge} className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-extrabold uppercase text-teal-700">{badge}</span>)}
                </div>

                <div className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#0d9488]">Detail Kompetisi</div>
                <h1 className="mt-2 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold leading-tight text-[#17324d] md:text-3xl">
                  {event.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{event.desc}</p>

                <div className="mt-5 grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">Biaya pendaftaran: <span className="font-extrabold text-[#17324d]">{event.price}</span></div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">Batas pendaftaran: <span className="font-extrabold text-[#17324d]">{event.deadline}</span></div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">Status: <span className="font-extrabold text-[#17324d]">{registrationStatus}</span></div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">Kuota: <span className="font-extrabold text-[#17324d]">{event.participants}</span></div>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-[#17324d]">Persyaratan Peserta</h2>
                    {requirementLines.length > 0 ? (
                      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                        {requirementLines.map((requirement) => (
                          <li key={requirement} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0d9488]"></span>
                            <span>{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm leading-6 text-slate-600">Belum ada persyaratan khusus yang ditambahkan oleh panitia.</p>
                    )}
                  </section>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="text-sm font-semibold leading-6 text-slate-600">{actionHint}</div>
                    <button type="button" onClick={handlePrimaryAction} disabled={Boolean(registration) && !isVerified && !isRejected || registrationClosed} className="mt-5 w-full rounded-xl bg-[#044b86] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#033b68] disabled:cursor-not-allowed disabled:bg-slate-300">
                      {actionLabel}
                    </button>
                    <button type="button" onClick={() => document.getElementById('detail-timeline')?.scrollIntoView({ behavior: 'smooth' })} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-[#17324d]">
                      Lihat Timeline
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <InfoSection title="Tentang Kompetisi">
              <p>
                BESC menghadirkan kompetisi biologi online yang dirancang untuk membantu pelajar mengukur kemampuan,
                membangun rasa percaya diri, dan mengenal pola soal kompetisi nasional dengan pengalaman yang rapi dan mudah diakses.
              </p>
              <p>
                Peserta akan mengikuti sistem pengerjaan berbasis online dengan materi yang sesuai jenjang. Setiap peserta
                mendapatkan kesempatan untuk mengembangkan pemahaman konsep, analisis, dan strategi menjawab soal.
              </p>
            </InfoSection>

            <InfoSection id="detail-timeline" title="Timeline">
              <div className="grid gap-4 md:grid-cols-2">
                {timeline.map(([phase, date, desc], index) => (
                  <div key={phase} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-emerald-100 font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-emerald-700">{index + 1}</div>
                    <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-slate-950">{phase}</h3>
                    <div className="mt-1 text-sm font-bold text-[#0f766e]">{date}</div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
                  </div>
                ))}
              </div>
            </InfoSection>

            <InfoSection title="Benefit Peserta">
              <div className="grid gap-4 md:grid-cols-2">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-slate-700">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs text-white">✓</span>
                    {benefit}
                  </div>
                ))}
              </div>
            </InfoSection>

            <InfoSection title="Sistem Pengerjaan">
              <div className="grid gap-4 md:grid-cols-2">
                {systems.map(([title, desc]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
                  </div>
                ))}
              </div>
            </InfoSection>

            <InfoSection title="FAQ">
              <div className="space-y-3">
                {faqs.map(([question, answer]) => (
                  <details key={question} className="group rounded-2xl border border-slate-200 bg-white p-5">
                    <summary className="cursor-pointer font-['Plus_Jakarta_Sans'] font-extrabold text-slate-950">{question}</summary>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
                  </details>
                ))}
              </div>
            </InfoSection>

            <InfoSection title="Kompetisi Lainnya">
              <div className="grid gap-5 md:grid-cols-2">
                {relatedEvents.map((item) => {
                  const index = displayEvents.findIndex((eventItem) => eventItem.title === item.title);
                  const image = item.banner || eventImages[index % eventImages.length];
                  return (
                    <button key={item.title} type="button" onClick={() => onCompetitionDetail(index)} className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl">
                      <div className="relative h-40 overflow-hidden bg-emerald-900">
                        <img src={image} alt={item.title} className="h-full w-full object-cover object-center transition duration-500 hover:scale-105" />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,78,59,0.04),rgba(2,6,23,0.42))]"></div>
                        <div className="absolute left-4 top-4 inline-flex rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase text-emerald-700 shadow-sm">{item.category}</div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-slate-950">{item.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </InfoSection>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function InfoSection({ children, id, title }) {
  return (
    <section id={id} className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur md:p-8">
      <h2 className="mb-5 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-slate-950">{title}</h2>
      <div className="space-y-4 text-base leading-8 text-slate-600">{children}</div>
    </section>
  );
}
