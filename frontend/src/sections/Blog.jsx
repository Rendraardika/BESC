import SectionHeader from '../components/SectionHeader.jsx';
import { blogPosts } from '../data/blogPosts.js';

export default function Blog() {
  return (
    <section id="blog" className="px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          label="Video & Artikel"
          title="Ruang Belajar BESC"
          sub="Kumpulan konten singkat untuk membantu persiapan kompetisi biologi dan memahami materi inti."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map(({ date, desc, icon, tag, title, url }) => (
            <a
              key={title}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="grid h-48 shrink-0 place-items-center bg-[linear-gradient(180deg,#1c79c6,#044b86)]">
                <span className="rounded-2xl border border-white/20 bg-white/15 px-5 py-3 font-['Plus_Jakarta_Sans'] text-xl font-extrabold tracking-wide text-blue-50 shadow-lg backdrop-blur">
                  {icon}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-[#044b86]">{tag}</span>
                  <span className="text-xs text-slate-500">{date}</span>
                </div>
                <h3 className="line-clamp-2 font-['Plus_Jakarta_Sans'] font-extrabold leading-6 text-slate-950">{title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{desc}</p>
                <span className="mt-auto rounded-xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-4 py-2.5 text-center text-sm font-bold text-white transition hover:brightness-110">
                  Tonton Video
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
