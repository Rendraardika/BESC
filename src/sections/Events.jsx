import SectionHeader from '../components/SectionHeader.jsx';
import { events } from '../data/events.js';

export default function Events({ onRegister }) {
  return (
    <section id="kompetisi" className="px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeader label="🏆 Kompetisi Terbaru" title="Event BESC Terbaru" sub="Jangan lewatkan kesempatan emas! Dapatkan informasi terbaru tentang kompetisi biologi kami." />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {events.filter((event) => !event.title.includes('Botani')).map((event) => (
            <article key={event.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-[#1c79c6] hover:shadow-2xl">
              <div className={`grid h-44 place-items-center bg-gradient-to-br ${event.bg} text-6xl ${event.iconColor}`}>{event.icon}</div>
              <div className="p-5">
                <div className="mb-3 flex flex-wrap gap-2">
                  {event.tags.map((tag) => <span key={tag} className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#044b86]">{tag}</span>)}
                </div>
                <h3 className="mb-3 line-clamp-2 font-['Plus_Jakarta_Sans'] text-base font-extrabold leading-6 text-slate-950">{event.title}</h3>
                <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-500">{event.desc}</p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-[#1c79c6]">{event.price}</span>
                    <span className="text-xs text-slate-400 line-through">{event.original}</span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-600">{event.discount}</span>
                  </div>
                  <button type="button" onClick={onRegister} className="rounded-full bg-blue-100 px-4 py-2 text-xs font-extrabold text-[#044b86] transition hover:bg-[linear-gradient(180deg,#1c79c6,#044b86)] hover:text-white">Daftar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
