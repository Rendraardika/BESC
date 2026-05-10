import { useScrollReveal } from '../../hooks/useScrollReveal';
import './Materials.css';

const materials = [
  {
    num: '01',
    icon: '🧫',
    title: 'Biologi Sel & Molekuler',
    desc: 'Struktur sel, organel, siklus sel, ekspresi gen, replikasi DNA, transkripsi, dan translasi protein.',
  },
  {
    num: '02',
    icon: '🦠',
    title: 'Mikrobiologi',
    desc: 'Bakteri, virus, fungi, dan protista. Patogenesis, antibiotik, serta peran dalam bioteknologi.',
  },
  {
    num: '03',
    icon: '🌱',
    title: 'Botani',
    desc: 'Anatomi dan fisiologi tumbuhan, fotosintesis, hormon, reproduksi, dan adaptasi ekologis.',
  },
  {
    num: '04',
    icon: '🐾',
    title: 'Zoologi',
    desc: 'Klasifikasi hewan, sistem organ, perilaku, fisiologi komparatif, dan embriologi vertebrata.',
  },
  {
    num: '05',
    icon: '🧬',
    title: 'Genetika & Evolusi',
    desc: 'Hukum Mendel, genetika populasi, mutasi, dan seleksi alam.',
  },
  {
    num: '06',
    icon: '🌍',
    title: 'Ekologi',
    desc: 'Ekosistem, rantai makanan, siklus biogeokimia, keanekaragaman hayati, dan perubahan iklim.',
  },
];

export default function Materials() {
  const headerRef = useScrollReveal();
  const gridRef = useScrollReveal();

  return (
    <section className="section" id="materi">
      <div className="materials-container">
        <div className="materials-header reveal" ref={headerRef}>
          <div className="section-tag centered">Materi Kompetisi</div>
          <h2 className="section-title">
            Cakupan <strong>Bidang Biologi</strong>
          </h2>
        </div>

        <div className="materi-grid reveal" ref={gridRef}>
          {materials.map((m) => (
            <div className="materi-card" key={m.num}>
              <div className="materi-num">{m.num}</div>
              <div className="materi-icon">{m.icon}</div>
              <div className="materi-title">{m.title}</div>
              <div className="materi-desc">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
