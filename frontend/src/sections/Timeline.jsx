import SectionHeader from '../components/SectionHeader.jsx';
import { timeline } from '../data/timeline.js';

export default function Timeline() {
  return (
    <section id="jadwal" className="bg-slate-50 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader center label="📅 Jadwal" title="Tahapan Kompetisi BESC 2026" sub="Ikuti perjalanan kompetisi dari pendaftaran hingga grand final." />
        <div className="relative mt-12 grid gap-8 md:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-8 hidden h-0.5 bg-gradient-to-r from-[#1c79c6] to-[#044b86] md:block"></div>
          {timeline.map(([num, date, title, desc]) => (
            <div key={num} className="relative z-10 text-center">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[linear-gradient(180deg,#1c79c6,#044b86)] font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-white shadow-[0_0_0_6px_#dbeafe]">{num}</div>
              <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#1c79c6]">{date}</div>
              <h3 className="mb-2 font-['Plus_Jakarta_Sans'] font-extrabold text-slate-950">{title}</h3>
              <p className="text-xs leading-6 text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
