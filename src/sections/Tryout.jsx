import SectionHeader from '../components/SectionHeader.jsx';
import { tryouts } from '../data/tryouts.js';

export default function Tryout() {
  return (
    <section id="tryout" className="bg-slate-50 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="📝 Tryout Gratis" title="Tryout BESC" sub="Jangan ragu! Ikuti tryout gratis sekarang dan rasakan pengalaman langsung yang tak terlupakan." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tryouts.map(([icon, title, sub]) => (
            <a key={title} href="#tryout" className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:translate-x-1 hover:border-[#1c79c6] hover:shadow-lg">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-blue-100 text-2xl">{icon}</div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-950">{title}</h3>
                <p className="mt-1 text-xs text-slate-500">{sub}</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-extrabold text-[#044b86]">GRATIS</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
