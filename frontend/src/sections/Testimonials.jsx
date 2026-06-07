import SectionHeader from '../components/SectionHeader.jsx';

export default function Testimonials() {
  return (
    <section className="bg-slate-50 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader center label="💬 Testimoni" title="Kata Mereka tentang BESC" sub="BESC telah berkomitmen untuk siswa dan instansi seluruh Indonesia." />
        <div className="grid gap-7 lg:grid-cols-3">
          {[
            ['👩‍🎓', 'Achai Ridho Dhavita', 'SMA Negeri 3 Blitar', 'Olimpiade BESC bermanfaat banget untuk melatih manajemen waktu dan berpikir kritis.'],
            ['👨‍🎓', 'Muhammad Lussy Zain', 'SMAN 1 Madura', 'Dari BESC, saya belajar untuk berpikir kritis tentang konsep biologi dan teliti dalam mengerjakan soal.'],
            ['👩‍🔬', 'Kholifatul Ula', 'SMAN 99 Sampang', 'Senang sekali bisa jadi Juara 1 Olimpiade Biologi BESC! Tetap optimis dan terus belajar.'],
          ].map(([avatar, name, school, text]) => (
            <div key={name} className="relative rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-5 top-5 text-xs tracking-wider text-amber-500">★★★★★</div>
              <div className="mb-4 text-4xl leading-none text-[#1c79c6]">"</div>
              <p className="mb-5 text-sm italic leading-7 text-slate-600">{text}</p>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-100 text-xl">{avatar}</div>
                <div>
                  <div className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-950">{name}</div>
                  <div className="text-xs text-slate-500">{school}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
