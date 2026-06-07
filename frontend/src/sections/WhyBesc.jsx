import SectionHeader from '../components/SectionHeader.jsx';

export default function WhyBesc() {
  return (
    <section id="tentang" className="px-6 py-20 md:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div>
          <SectionHeader label="✨ Keunggulan" title="Mengapa Harus BESC?" sub="Dapatkan berbagai macam benefit eksklusif dari program kompetisi biologi terbaik Indonesia." />
          <div className="space-y-5">
            {[
              ['🔬', 'Soal Berkualitas Tinggi', 'Soal disusun oleh tim ahli biologi dari perguruan tinggi terkemuka di Indonesia.'],
              ['🏆', 'Hadiah & Beasiswa Bergengsi', 'Total hadiah Rp 50 juta + beasiswa + kesempatan olimpiade internasional.'],
              ['📜', 'Sertifikat Resmi Bersertifikasi', 'Sertifikat keikutsertaan dan penghargaan yang diakui secara nasional.'],
              ['🌿', 'Komunitas Ilmuwan Muda', 'Bergabung dengan ribuan pelajar berprestasi se-Indonesia dalam ekosistem belajar yang positif.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 p-5 transition hover:translate-x-1 hover:border-[#1c79c6] hover:bg-blue-50">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-xl">{icon}</div>
                <div>
                  <h3 className="mb-1 font-['Plus_Jakarta_Sans'] font-extrabold text-slate-950">{title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden rounded-[1.5rem] bg-[linear-gradient(180deg,#1c79c6,#044b86)] p-12 lg:block">
          {[
            ['19 Jt', 'Peserta telah bergabung dari seluruh Indonesia'],
            ['34', 'Provinsi terwakili dalam kompetisi BESC'],
            ['Rp 217 T', 'Total hadiah yang telah dibagikan kepada pemenang'],
          ].map(([num, label]) => (
            <div key={num} className="mb-6 rounded-2xl border border-white/15 bg-white/10 p-6 text-white last:mb-0">
              <div className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold text-blue-200">{num}</div>
              <div className="mt-2 text-sm text-blue-100">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
