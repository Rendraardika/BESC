import SectionHeader from '../components/SectionHeader.jsx';
import { tryouts } from '../data/tryouts.js';
import tryoutStudentBoy from '../assets/images/tryout-student-boy.png';
import tryoutStudentsGroup from '../assets/images/tryout-students-group.png';
import tryoutStudentsPair from '../assets/images/tryout-students-pair.png';

const tryoutImages = [tryoutStudentsGroup, tryoutStudentsPair, tryoutStudentBoy];

const getLevel = (sub) => {
  if (sub.includes('SMA')) return 'SMA';
  if (sub.includes('SMP')) return 'SMP';
  return 'Umum';
};

export default function Tryout({ onTryoutPackage }) {
  return (
    <section id="tryout" className="bg-slate-50 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="Tryout Gratis" title="Tryout BESC" sub="Jangan ragu! Ikuti tryout gratis sekarang dan rasakan pengalaman langsung yang tak terlupakan." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tryouts.map(([icon, title, sub], index) => {
            const image = tryoutImages[index % tryoutImages.length];
            const level = getLevel(sub);

            return (
              <article key={title} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-emerald-300 hover:shadow-2xl">
                <div className="relative h-48 overflow-hidden bg-emerald-900">
                  <img src={image} alt={title} className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,120,87,0.02)_0%,rgba(6,78,59,0.18)_55%,rgba(2,6,23,0.34)_100%)]"></div>
                  <div className="absolute bottom-4 left-4 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white backdrop-blur">Tryout Online</div>
                  <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-2xl bg-white/20 text-xl shadow-lg backdrop-blur">{icon}</div>
                </div>

                <div className="p-5">
                  <h3 className="min-h-12 font-['Plus_Jakarta_Sans'] text-base font-extrabold leading-6 text-slate-950">{title}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold text-emerald-700">Tryout</span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-extrabold text-amber-700">Terbuka Umum</span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-extrabold text-[#044b86]">{level}</span>
                  </div>

                  <div className="mt-5 font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-[#0f766e]">Gratis</div>
                  <button type="button" onClick={onTryoutPackage} className="mt-4 w-full rounded-xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-blue-700/30">
                    Coba Gratis
                  </button>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{sub}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
