export default function CTA({ onRegister }) {
  return (
    <section className="bg-slate-50 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#1c79c6,#044b86)] p-10 md:grid-cols-[1fr_auto] md:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-300/10"></div>
          <div className="relative z-10">
            <div className="mb-5 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100">🚀 Bergabung Sekarang</div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold leading-tight text-white">Siap Menjadi<br /><span className="text-blue-200">Ilmuwan Muda</span> Terbaik?</h2>
Pendaftaran BESC 2026 telah dibuka. Daftarkan dirimu sebelum 28 September 2026 dan mulailah perjalanan menuju puncak kompetisi biologi nasional.
          </div>
          <div className="relative z-10 mt-8 flex flex-col gap-3 md:mt-0 md:justify-center">
            <button type="button" onClick={onRegister} className="rounded-full bg-white px-7 py-3 font-bold text-[#044b86]">Daftar Sekarang →</button>
            <a href="#home" className="rounded-full border border-white/30 bg-white/10 px-7 py-3 text-center font-bold text-white">Unduh Panduan PDF</a>
          </div>
        </div>
      </div>
    </section>
  );
}
