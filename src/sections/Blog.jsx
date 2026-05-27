import SectionHeader from '../components/SectionHeader.jsx';
import { blogPosts } from '../data/blogPosts.js';

export default function Blog() {
  return (
    <section id="blog" className="px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="✍️ Blog & Artikel" title="Konten Terbaru BESC" sub="Informasi lengkap seputar dunia biologi, tips kompetisi, dan update terbaru BESC." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map(([icon, tag, date, title]) => (
            <a key={title} href="#blog" className="flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-2xl">
              <div className="grid h-48 shrink-0 place-items-center bg-[linear-gradient(180deg,#1c79c6,#044b86)] text-5xl text-blue-200">{icon}</div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-[#044b86]">{tag}</span>
                  <span className="text-xs text-slate-500">{date}</span>
                </div>
                <h3 className="line-clamp-2 font-['Plus_Jakarta_Sans'] font-extrabold leading-6 text-slate-950">{title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">Pelajari wawasan terbaru dan tips persiapan kompetisi biologi bersama BESC.</p>
                <button type="button" className="mt-auto rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-white">Baca Artikel</button>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
