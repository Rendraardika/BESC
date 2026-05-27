import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { tryouts } from '../data/tryouts.js';
import tryoutStudentBoy from '../assets/images/tryout-student-boy.png';
import tryoutStudentsGroup from '../assets/images/tryout-students-group.png';
import tryoutStudentsPair from '../assets/images/tryout-students-pair.png';

const tryoutMeta = [
  { deadline: '15 September 2026', participants: '1.200+ peserta', category: 'Biologi Sel', level: 'SMA' },
  { deadline: '18 September 2026', participants: '980+ peserta', category: 'Ekologi', level: 'SMP' },
  { deadline: '22 September 2026', participants: '850+ peserta', category: 'Zoologi', level: 'SMA' },
  { deadline: '28 September 2026', participants: '1.050+ peserta', category: 'Genetika', level: 'SMA' },
  { deadline: '2 Oktober 2026', participants: '920+ peserta', category: 'Mikrobiologi', level: 'SMP' },
  { deadline: '8 Oktober 2026', participants: '760+ peserta', category: 'Botani', level: 'SMP' },
];

const tryoutImages = [tryoutStudentsGroup, tryoutStudentsPair, tryoutStudentBoy];

export default function TryoutPage({ onLogin, onLogout, onOlimpiade, onProfile, onTryout, onTryoutPackage, user }) {
  return (
    <>
      <Header onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} onTryout={onTryout} user={user} />
      <main className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef7f3_48%,#ffffff_100%)] px-5 pb-28 pt-12 md:px-8 md:pt-14">
        <div className="pointer-events-none absolute left-[-130px] top-12 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl"></div>
        <div className="pointer-events-none absolute right-[-120px] top-44 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl"></div>
        <div className="pointer-events-none absolute right-[12%] top-24 h-20 w-20 rounded-[1.75rem] border border-emerald-200/70"></div>

        <section className="relative mx-auto max-w-[1500px]">
          <div className="mb-10 lg:mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Tryout Gratis
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
              Tryout Biologi BESC
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              Latih kemampuanmu dengan paket tryout online BESC untuk persiapan kompetisi biologi tingkat SMP dan SMA.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {tryouts.map(([icon, title, sub], index) => {
              const meta = tryoutMeta[index];
              const image = tryoutImages[index % tryoutImages.length];

              return (
                <article key={title} className="group overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-2 hover:border-emerald-300 hover:shadow-[0_26px_70px_rgba(15,118,110,0.18)]">
                  <div className="relative h-56 overflow-hidden bg-emerald-900">
                    <img src={image} alt={title} className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,120,87,0.04)_0%,rgba(6,78,59,0.22)_58%,rgba(2,6,23,0.42)_100%)]"></div>
                    <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),transparent)]"></div>
                    <div className="absolute bottom-5 left-5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white backdrop-blur">
                      Tryout Online
                    </div>
                    <div className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-2xl shadow-lg backdrop-blur">
                      {icon}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="min-h-14 font-['Plus_Jakarta_Sans'] text-xl font-extrabold leading-7 text-slate-950">{title}</h3>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">Tryout</span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">{meta.category}</span>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-700">{meta.level}</span>
                    </div>

                    <div className="mt-5 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#0f766e]">Gratis</div>

                    <button type="button" onClick={onTryoutPackage} className="mt-4 w-full rounded-xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-blue-700/30">
                      Coba Gratis
                    </button>

                    <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">{sub}</p>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Deadline</div>
                        <div className="mt-1 text-xs font-extrabold text-slate-800">{meta.deadline}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Peserta</div>
                        <div className="mt-1 text-xs font-extrabold text-slate-800">{meta.participants}</div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
