import SectionHeader from '../components/SectionHeader.jsx';
import { competitionToEvent } from '../lib/competitions.js';
import heroImage from '../assets/images/TRY OUT.png';

const eventImages = [heroImage, heroImage, heroImage];

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-44 bg-slate-200"></div>
          <div className="p-5">
            <div className="mb-3 flex gap-2">
              <div className="h-5 w-16 rounded-full bg-slate-200"></div>
              <div className="h-5 w-12 rounded-full bg-slate-200"></div>
            </div>
            <div className="mb-3 h-5 w-3/4 rounded bg-slate-200"></div>
            <div className="mb-4 h-4 w-full rounded bg-slate-200"></div>
            <div className="flex items-center justify-between">
              <div className="h-6 w-20 rounded bg-slate-200"></div>
              <div className="h-9 w-24 rounded-full bg-slate-200"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Events({ competitions, competitionsLoading, onCompetitionDetail, onVerifiedCompetition, registrations }) {
  const displayEvents = competitions?.length
    ? competitions.map(competitionToEvent)
    : [];

  return (
    <section id="kompetisi" className="px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeader label="🏆 Kompetisi Terbaru" title="Event BESC Terbaru" sub="Jangan lewatkan kesempatan emas! Dapatkan informasi terbaru tentang kompetisi biologi kami." />
        </div>
        {competitionsLoading ? (
          <LoadingSkeleton />
        ) : displayEvents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {displayEvents.map((event, index) => {
              const competition = event.competition || competitions[index];
              const registration = competition ? registrations.find((item) => item.competition_id === competition.id) : null;
              const verified = registration?.status === 'verified';
              const image = event.banner || eventImages[index % eventImages.length];
              return (
              <article key={event.id || event.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-[#1c79c6] hover:shadow-2xl">
                <div className="relative h-44 overflow-hidden bg-emerald-900">
                  <img src={image} alt={event.title} className="h-full w-full object-cover object-center transition duration-500 hover:scale-105" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,120,87,0.02)_0%,rgba(6,78,59,0.18)_55%,rgba(2,6,23,0.34)_100%)]"></div>
                </div>
                <div className="p-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {event.tags.map((tag) => <span key={tag} className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#044b86]">{tag}</span>)}
                  </div>
                  <h3 className="mb-3 line-clamp-2 font-['Plus_Jakarta_Sans'] text-base font-extrabold leading-6 text-slate-950">{event.title}</h3>
                  <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-500">{event.desc}</p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-[#1c79c6]">{event.price}</span>
                      {event.original && <span className="text-xs text-slate-400 line-through">{event.original}</span>}
                      {event.discount && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-600">{event.discount}</span>}
                    </div>
                    <button type="button" onClick={() => verified ? onVerifiedCompetition(registration) : onCompetitionDetail(index)} className="rounded-full bg-blue-100 px-4 py-2 text-xs font-extrabold text-[#044b86] transition hover:bg-[linear-gradient(180deg,#1c79c6,#044b86)] hover:text-white">{verified ? 'Lihat Ketentuan' : registration ? 'Menunggu Verifikasi' : 'Daftar'}</button>
                  </div>
                </div>
              </article>
            );})}
          </div>
        ) : (
          <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <p className="text-lg font-bold text-slate-400">Belum ada kompetisi yang dipublish</p>
            <p className="mt-2 text-sm text-slate-400">Kompetisi akan muncul di sini setelah admin mempublikasikannya.</p>
          </div>
        )}
      </div>
    </section>
  );
}
