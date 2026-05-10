import { useScrollReveal } from '../../hooks/useScrollReveal';
import './About.css';

const features = [
  {
    icon: '🔬',
    title: 'Ujian Teori & Praktikum',
    desc: 'Kombinasi soal teori mendalam dan praktikum laboratorium untuk mengukur kompetensi nyata peserta.',
  },
  {
    icon: '🧬',
    title: 'Kurikulum Berbasis Riset',
    desc: 'Materi kompetisi mengikuti perkembangan riset biologi terkini, dari biologi molekuler hingga ekologi.',
  },
  {
    icon: '🏆',
    title: 'Penghargaan Bergengsi',
    desc: 'Pemenang mendapatkan beasiswa, trofi, sertifikat, serta kesempatan mengikuti seleksi olimpiade internasional.',
  },
  {
    icon: '🌿',
    title: 'Komunitas Ilmuwan Muda',
    desc: 'Bergabung dengan jaringan ratusan pelajar berprestasi dari seluruh Indonesia yang memiliki passion di sains.',
  },
];

export default function About() {
  const textRef = useScrollReveal();
  const featuresRef = useScrollReveal();

  return (
    <section className="section" id="tentang">
      <div className="about-grid">
        <div className="about-text reveal" ref={textRef}>
          <div className="section-tag">Tentang BESC</div>
          <h2 className="section-title">
            Menantang Batas<br /><strong>Ilmu Biologi</strong>
          </h2>
          <p>
            BESC (Biology Environmental Smart Competition) adalah olimpiade sains
            biologi tingkat nasional yang dirancang untuk menemukan dan
            mengembangkan talenta-talenta muda di bidang ilmu kehidupan.
          </p>
          <p>
            Kompetisi ini menguji pemahaman mendalam peserta dari tingkat seluler
            hingga ekosistem, mendorong kemampuan berpikir kritis dan pemecahan
            masalah berbasis data ilmiah.
          </p>
        </div>

        <div className="about-features reveal" ref={featuresRef}>
          {features.map((f, i) => (
            <div className="feature-row" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
