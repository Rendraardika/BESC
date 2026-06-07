import SectionHeader from '../components/SectionHeader.jsx';
import { materi } from '../data/materi.js';

export default function Materi() {
  return (
    <section id="materi" className="px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader center label="📚 Materi Lengkap" title="Cakupan Bidang Biologi" sub="Kompetisi BESC mencakup 6 bidang utama biologi yang terintegrasi dan berbasis riset terkini." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materi.map(([icon, title, desc]) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-[#1c79c6] hover:shadow-lg">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-100 text-2xl">{icon}</div>
              <div>
                <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-950">{title}</h3>
                <p className="text-xs leading-6 text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
