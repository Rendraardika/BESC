import heroImage from '../assets/images/tampilan utama besc.png';

export default function Hero({ onCompetitions, onTryoutPackage }) {
  return (
    <section
      id="home"
      className="relative overflow-hidden px-6 py-17 md:px-8"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.22),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.12),transparent_24%)]"></div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div>
          <h1 className="mb-5 font-['Plus_Jakarta_Sans'] text-4xl font-extrabold leading-tight tracking-[-0.03em] text-white md:text-6xl">
            Asah potensi,
            <br />
            Raih prestasi!
          </h1>

          <p className="mb-8 max-w-xl text-base leading-8 text-blue-100">
            BESC (Biology Environmental Smart Competition) hadir sebagai wadah bagi pelajar Indonesia untuk mengembangkan potensi, meningkatkan wawasan, dan meraih prestasi di bidang biologi melalui kompetisi, tryout, serta pembelajaran berkualitas.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onCompetitions}
              className="rounded-full bg-white px-7 py-3 font-bold text-[#044b86] transition hover:-translate-y-1 hover:bg-blue-50 hover:shadow-xl"
            >
              Ikuti Kompetisi -&gt;
            </button>

            <a
              href="#paket-tryout"
              onClick={(event) => {
                event.preventDefault();
                onTryoutPackage?.();
              }}
              className="rounded-full border border-white/30 bg-white/10 px-7 py-3 font-bold text-white transition hover:bg-white/20"
            >
              Coba Tryout Gratis
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
