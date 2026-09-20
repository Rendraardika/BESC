import SectionHeader from '../components/SectionHeader.jsx';
import { materiByLevel } from '../data/materi.js';

export default function Materi() {
  return (
    <section id="materi" className="bg-[linear-gradient(180deg,#ffffff_0%,#f3f8f7_50%,#ffffff_100%)] px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          center
          label="Materi Lengkap"
          title="Cakupan Bidang Biologi"
          sub="Materi Olimpiade Biologi BESC disesuaikan dengan jenjang peserta berdasarkan panduan resmi kompetisi."
        />

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {materiByLevel.map((group, groupIndex) => (
            <article key={group.level} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
              <div className={`relative overflow-hidden px-6 py-6 text-white ${groupIndex === 0 ? 'bg-[#044b86]' : 'bg-[#0f766e]'}`}>
                <div className="absolute right-0 top-0 h-full w-32 bg-white/10"></div>
                <div className="relative">
                  <div className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/90">
                    Jenjang Kompetisi
                  </div>
                  <h3 className="mt-4 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold md:text-3xl">
                    {group.level}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">{group.note}</p>
                </div>
              </div>

              <div className="grid gap-3 p-5 sm:grid-cols-2">
                {group.items.map((item, index) => (
                  <div key={item} className="group flex min-h-16 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-white hover:shadow-md">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${groupIndex === 0 ? 'bg-blue-100 text-[#044b86]' : 'bg-emerald-100 text-[#0f766e]'}`}>
                      {index + 1}
                    </span>
                    <span className="text-sm font-bold leading-6 text-slate-700 transition group-hover:text-slate-950">{item}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
                  <span>Total bidang materi</span>
                  <span className={`rounded-full px-3 py-1 ${groupIndex === 0 ? 'bg-blue-100 text-[#044b86]' : 'bg-emerald-100 text-[#0f766e]'}`}>
                    {group.items.length} bidang
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
