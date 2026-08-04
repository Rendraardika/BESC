import SectionHeader from '../components/SectionHeader.jsx';
import olimGuidebook from '../assets/images/[OLIM] Guidebook BESC 2026_20260803_230433_0000_compressed (1).pdf';
import lktiGuidebook from '../assets/images/[LKTI] Guidebook BESC 2026 (2).pdf';

const guidebooks = [
  {
    title: '[OLIM] Guidebook BESC 2026',
    desc: 'Panduan lengkap Olimpiade Biologi BESC 2026 meliputi materi, ketentuan ujian, dan jadwal pelaksanaan.',
    icon: '\ud83d\udccb',
    file: olimGuidebook,
    filename: 'Guidebook-OLIM-BESC-2026.pdf',
  },
  {
    title: '[LKTI] Guidebook BESC 2026',
    desc: 'Panduan lengkap Lomba Karya Tulis Ilmiah BESC 2026 meliputi ketentuan, format penulisan, dan jadwal.',
    icon: '\ud83d\udcc4',
    file: lktiGuidebook,
    filename: 'Guidebook-LKTI-BESC-2026.pdf',
  },
];

export default function Guidebook() {
  return (
    <section id="guidebook" className="px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          center
          label="📥 Unduh Panduan"
          title="Guidebook BESC 2026"
          sub="Download panduan resmi kompetisi untuk persiapan yang lebih matang."
        />
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {guidebooks.map((gb) => (
            <a
              key={gb.title}
              href={gb.file}
              download={gb.filename}
              className="group flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center transition hover:-translate-y-1 hover:border-[#1c79c6] hover:shadow-xl"
            >
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-3xl transition group-hover:bg-[#1c79c6] group-hover:text-white">
                {gb.icon}
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-slate-950">{gb.title}</h3>
              <p className="text-sm leading-6 text-slate-500">{gb.desc}</p>
              <span className="mt-auto inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-6 py-3 text-sm font-bold text-white transition hover:brightness-110">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                </svg>
                Download PDF
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
