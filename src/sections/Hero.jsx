import bescLogo from '../assets/images/logo-BESCbirutuaFIX.png';

export default function Hero({ onRegister }) {
  return (
    <section id="home" className="relative overflow-hidden hero-bg px-6 py-20 md:px-8">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.22),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.12),transparent_24%)]"></div>
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-blue-100">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1c79c6]"></span>
            Platform Olimpiade Biologi #1
          </div>
          <h1 className="mb-5 font-['Plus_Jakarta_Sans'] text-4xl font-extrabold leading-tight tracking-[-0.03em] text-white md:text-6xl">
            Menjadi <span className="text-blue-200">#JUARASEJATI</span><br />Mulai dari Sekarang!
          </h1>
          <p className="mb-8 max-w-xl text-base leading-8 text-blue-100">
            BESC (Biology Environmental Smart Competition) hadir untuk membersamai pelajar Indonesia meraih prestasi terbaik di bidang biologi melalui kompetisi, tryout, dan pembelajaran berkualitas.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={onRegister} className="rounded-full bg-white px-7 py-3 font-bold text-[#044b86] transition hover:-translate-y-1 hover:bg-blue-50 hover:shadow-xl">Ikuti Kompetisi →</button>
            <a href="#tryout" className="rounded-full border border-white/30 bg-white/10 px-7 py-3 font-bold text-white transition hover:bg-white/20">Coba Tryout Gratis</a>
          </div>
        </div>
        {/* BESC logo box removed from hero background at user's request */}
      </div>
    </section>
  );
}
