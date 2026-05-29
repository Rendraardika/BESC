import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { events } from '../data/events.js';
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

export default function CompetitionDetailPage({ competitionIndex = 0, onCompetitionDetail, onEventRegistration, onLogin, onLogout, onOlimpiade, onProfile, onRegister, onTryout, user }) {
  const event = events[competitionIndex] ?? events[0];
  const heroImage = eventImages[competitionIndex % eventImages.length];
  const relatedEvents = events.filter((item) => item.title !== event.title);

  return (
    <>
      <Header onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} onTryout={onTryout} user={user} />
      <main className="relative bg-[linear-gradient(180deg,#f8fafc_0%,#eef7f3_42%,#ffffff_100%)] px-5 py-10 md:px-8">
        <div className="pointer-events-none absolute left-[-160px] top-12 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl"></div>
        <div className="pointer-events-none absolute right-[-120px] top-80 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl"></div>

        <div className="relative mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[2.25rem] border border-emerald-100/40 bg-[linear-gradient(135deg,#052e2b_0%,#0f766e_48%,#0b3b66_100%)] shadow-[0_30px_90px_rgba(6,78,59,0.28)]">
              <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl"></div>
              <div className="pointer-events-none absolute right-10 top-10 h-40 w-40 rounded-full bg-blue-300/20 blur-3xl"></div>
              <div className="pointer-events-none absolute bottom-8 left-[45%] h-24 w-24 rounded-[2rem] border border-white/10"></div>

              <div className="relative grid gap-8 p-7 md:p-10 lg:grid-cols-[1fr_0.92fr] lg:p-12">
                <div className="relative z-10 flex flex-col justify-center">
                  <div className="mb-5 flex flex-wrap gap-2">
                    {event.tags.map((tag) => <span key={tag} className="rounded-full border border-white/15 bg-white/12 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-50 backdrop-blur">{tag}</span>)}
                    {event.badges.map((badge) => <span key={badge} className="rounded-full border border-white/15 bg-white/12 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-blue-50 backdrop-blur">{badge}</span>)}
                  </div>
                  <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-300/15 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-50 ring-1 ring-white/15">
                    <span className="h-2 w-2 rounded-full bg-emerald-300"></span>
                    Event Competition Platform
                  </div>
                  <h1 className="max-w-3xl font-['Plus_Jakarta_Sans'] text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                    {event.title}
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-emerald-50/85 md:text-lg">{event.desc}</p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                      ['Deadline', event.deadline],
                      ['Kategori', event.category],
                      ['Peserta', event.participants],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/12 p-4 shadow-lg shadow-slate-950/10 backdrop-blur">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-100/70">{label}</div>
                        <div className="mt-1 text-sm font-extrabold text-white">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-9 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={onEventRegistration} className="rounded-full bg-white px-7 py-3 text-sm font-extrabold text-[#044b86] shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-blue-50">
                      Daftar Sekarang
                    </button>
                    <button type="button" onClick={() => document.getElementById('detail-timeline')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-extrabold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">
                      Lihat Timeline
                    </button>
                  </div>
                </div>

                <div className="relative min-h-[360px] lg:min-h-[520px]">
                  <div className="absolute inset-x-6 top-8 h-72 rounded-[2rem] bg-white/10 blur-2xl"></div>
                  <div className="relative ml-auto flex h-full max-w-xl items-center">
                    <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/20 bg-white/15 p-3 shadow-[0_30px_80px_rgba(2,6,23,0.28)] backdrop-blur">
                      <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-900">
                        <img src={heroImage} alt={event.title} className="h-[360px] w-full object-cover object-center transition duration-500 hover:scale-105 lg:h-[460px]" />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,78,59,0.02)_0%,rgba(6,78,59,0.12)_50%,rgba(2,6,23,0.58)_100%)]"></div>
                        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-white/15 p-4 text-white shadow-xl backdrop-blur-md">
                          <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-100">BESC 2026</div>
                          <div className="mt-1 font-['Plus_Jakarta_Sans'] text-xl font-extrabold">Kompetisi Biologi Nasional</div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute -left-2 top-10 rounded-2xl border border-white/20 bg-white/18 p-4 text-white shadow-2xl backdrop-blur-md md:-left-8">
                      <div className="text-4xl">{event.icon}</div>
                      <div className="mt-2 text-[11px] font-extrabold uppercase tracking-wide text-white/75">Online</div>
                    </div>
                    <div className="absolute -right-2 bottom-14 rounded-2xl border border-white/20 bg-white/18 px-5 py-4 text-white shadow-2xl backdrop-blur-md md:-right-6">
                      <div className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold">{event.price}</div>
                      <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-100">{event.discount}</div>
                    </div>
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
                  const index = events.findIndex((eventItem) => eventItem.title === item.title);
                  const image = eventImages[index % eventImages.length];
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

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
              <div className="mb-4 flex flex-wrap gap-2">
                {event.badges.map((badge) => <span key={badge} className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-extrabold uppercase text-[#044b86]">{badge}</span>)}
              </div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold leading-7 text-slate-950">{event.title}</h2>
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm text-slate-400 line-through">{event.original}</span>
                <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-[#0f766e]">{event.price}</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">{event.discount}</span>
              </div>
              <div className="mt-6 space-y-3 border-y border-slate-100 py-5">
                <SidebarRow label="Deadline" value={event.deadline} />
                <SidebarRow label="Status" value="Pendaftaran Dibuka" />
                <SidebarRow label="Kuota" value={event.participants} />
                <SidebarRow label="Kategori" value={event.category} />
              </div>
              <button type="button" onClick={onEventRegistration} className="mt-6 w-full rounded-2xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:brightness-110">
                Daftar Sekarang
              </button>
              <p className="mt-4 text-center text-xs leading-5 text-slate-500">Pastikan data profil sudah lengkap sebelum mengikuti kompetisi.</p>
            </div>
          </aside>
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

function SidebarRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="text-right text-sm font-extrabold text-slate-900">{value}</span>
    </div>
  );
}
