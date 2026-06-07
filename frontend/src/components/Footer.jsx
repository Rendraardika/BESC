export default function Footer() {
  return (
    <footer className="bg-slate-950 px-6 py-16 text-slate-400 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-slate-800 pb-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-3 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#1c79c6]">🌿 BESC</div>
            <p className="mb-5 text-sm leading-7">BESC memiliki ekosistem lengkap penunjang belajar siswa Indonesia mulai dari kompetisi biologi, latihan soal, bimbingan olimpiade, dan wadah komunitas prestasi seluruh Indonesia.</p>
            <div className="flex gap-3">
              {['📷', '💬', '▶️', 'in'].map((item) => <a key={item} href="#home" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-700 bg-slate-800 transition hover:border-[#1c79c6] hover:bg-[linear-gradient(180deg,#1c79c6,#044b86)] hover:text-white">{item}</a>)}
            </div>
          </div>
          {[
            ['Kompetisi', ['Olimpiade Biologi', 'Tryout Gratis', 'Latihan Soal', 'Jadwal Event']],
            ['Informasi', ['Tentang BESC', 'Blog & Artikel', 'FAQ', 'Kerja Sama']],
            ['Customer Service', ['📱 0812-3456-7890', '✉️ info@besc.id', '💬 Live Chat', '📋 Syarat & Ketentuan']],
          ].map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-200">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => <li key={link}><a href="#home" className="text-sm text-slate-500 hover:text-[#1c79c6]">{link}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col justify-between gap-3 text-xs text-slate-600 md:flex-row">
          <span>© 2025 BESC · Biology Environmental Smart Competition. All rights reserved.</span>
          <span>Made with 🌿 for Indonesia</span>
        </div>
      </div>
    </footer>
  );
}
