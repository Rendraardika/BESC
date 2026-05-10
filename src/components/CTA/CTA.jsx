import { useScrollReveal } from '../../hooks/useScrollReveal';
import './CTA.css';

export default function CTA() {
  const ref = useScrollReveal();

  return (
    <section className="cta-section" id="daftar">
      <div className="cta-inner reveal" ref={ref}>
        <div className="section-tag centered">Bergabung Sekarang</div>
        <h2 className="cta-title">
          Siap Menjadi<br /><em>Ilmuwan Muda</em> Terbaik?
        </h2>
        <p className="cta-sub">
          Pendaftaran BESC 2026 telah dibuka. Daftarkan diri sebelum 28 Agustus
          2026 dan mulailah perjalananmu menuju puncak kompetisi biologi
          nasional.
        </p>
        <div className="cta-buttons">
          <a href="#" className="btn-primary">Daftar Sekarang →</a>
          <a href="#" className="btn-outline">Unduh Panduan PDF</a>
        </div>
      </div>
    </section>
  );
}
