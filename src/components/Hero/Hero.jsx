import './Hero.css';
import logoWarna from '../../../logo/warna logo.png';

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-grid">
        {/* Konten Teks */}
        <div className="hero-content">
          <div className="hero-badge">
            Olimpiade Sains · Bidang Biologi
          </div>
          <h1 className="hero-title">
            <span className="hero-title-accent">BESC 2026</span>
          </h1>
          <p className="hero-sub">
            Kompetisi bidang biologi di tingkat SMP dan SMA
          </p>
          <div className="hero-actions">
            <a href="#daftar" className="btn-primary">Daftar Peserta</a>
            <a href="#tentang" className="btn-outline">Pelajari Lebih Lanjut</a>
          </div>
        </div>

        {/* Visual Logo */}
        <div className="hero-visual">
          <div className="logo-wrapper">
            <div className="logo-glow-ring"></div>
            <img
              src={logoWarna}
              alt="Logo BESC"
              className="hero-logo-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
