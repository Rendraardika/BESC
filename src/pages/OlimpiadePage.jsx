import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { events } from '../data/events.js';
import eventStudentBoy from '../assets/images/tryout-student-boy.png';
import eventStudentsGroup from '../assets/images/tryout-students-group.png';
import eventStudentsPair from '../assets/images/tryout-students-pair.png';

const eventImages = [eventStudentsGroup, eventStudentsPair, eventStudentBoy];

export default function OlimpiadePage({ onCompetitionDetail, onLogin, onLogout, onOlimpiade, onProfile, onTryout, user }) {
  return (
    <>
      <Header onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} onTryout={onTryout} user={user} />
      <main className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef7f3_48%,#ffffff_100%)] px-5 pb-28 pt-12 md:px-8 md:pt-14">
        <div className="pointer-events-none absolute left-[-140px] top-8 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl"></div>
        <div className="pointer-events-none absolute right-[-120px] top-40 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl"></div>
        <div className="pointer-events-none absolute left-[8%] top-32 h-24 w-24 rounded-[2rem] border border-emerald-200/60"></div>
        <div className="pointer-events-none absolute right-[14%] top-24 h-16 w-16 rounded-full border border-blue-200/70"></div>

        <section className="relative mx-auto max-w-[1500px]">
          <div className="mb-10 lg:mb-12">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Kompetisi Terbaru
              </div>
              <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
                Olimpiade Biologi BESC
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                Pilih program kompetisi BESC yang sesuai dengan jenjang, minat, dan target prestasimu.
              </p>
            </div>
          </div>

          <div className="grid gap-7 lg:grid-cols-3">
            {events.map((event, index) => (
              <article key={event.title} className="group overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-2 hover:border-emerald-300 hover:shadow-[0_28px_75px_rgba(15,118,110,0.18)]">
                <div className="relative h-60 overflow-hidden bg-emerald-900">
                  <img src={eventImages[index % eventImages.length]} alt={event.title} className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,120,87,0.02)_0%,rgba(6,78,59,0.2)_58%,rgba(2,6,23,0.45)_100%)]"></div>
                  <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent)]"></div>
                  <div className="absolute left-6 top-6 rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white backdrop-blur">
                    {event.category}
                  </div>
                  <div className="absolute right-6 top-6 grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-2xl shadow-lg backdrop-blur">{event.icon}</div>
                </div>

                <div className="p-6">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {event.tags.map((tag) => <span key={tag} className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">{tag}</span>)}
                    {event.badges.map((badge) => <span key={badge} className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-600">{badge}</span>)}
                  </div>

                  <h3 className="mb-3 min-h-14 font-['Plus_Jakarta_Sans'] text-xl font-extrabold leading-7 text-slate-950">{event.title}</h3>
                  <p className="mb-5 line-clamp-2 text-sm leading-7 text-slate-600">{event.desc}</p>

                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Deadline</div>
                      <div className="mt-1 text-sm font-extrabold text-slate-800">{event.deadline}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Peserta</div>
                      <div className="mt-1 text-sm font-extrabold text-slate-800">{event.participants}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#0f766e]">{event.price}</span>
                      <span className="text-xs text-slate-400 line-through">{event.original}</span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">{event.discount}</span>
                    </div>
                    <button type="button" onClick={() => onCompetitionDetail(index)} className="rounded-full bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:brightness-110">
                      Daftar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
