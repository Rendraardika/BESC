import { useScrollReveal } from '../../hooks/useScrollReveal';
import './Timeline.css';

const phases = [
  {
    num: '01',
    date: 'Ags – Sep 2026',
    phase: 'Pendaftaran',
    desc: 'Buka pendaftaran peserta dari seluruh Indonesia. Lengkapi dokumen dan bayar biaya administrasi.',
  },
  {
    num: '02',
    date: 'Oktober 2026',
    phase: 'Seleksi Awal',
    desc: 'Ujian online tahap pertama. Peserta menjawab soal pilihan ganda dan isian singkat berbasis CBT.',
  },
  {
    num: '03',
    date: 'November 2026',
    phase: 'Semifinal',
    desc: '50 peserta terbaik mengikuti ujian esai mendalam dan analisis data eksperimen.',
  },
  {
    num: '04',
    date: 'Desember 2026',
    phase: 'Grand Final',
    desc: '15 finalis terbaik bertanding dalam ujian praktikum laboratorium dan presentasi proyek riset.',
  },
];

export default function Timeline() {
  const headerRef = useScrollReveal();
  const timelineRef = useScrollReveal();

  return (
    <section className="section timeline-section" id="jadwal">
      <div className="timeline-inner">
        <div className="timeline-header reveal" ref={headerRef}>
          <div className="section-tag centered">Jadwal Pelaksanaan</div>
          <h2 className="section-title">
            Tahapan <strong>Kompetisi</strong>
          </h2>
        </div>

        <div className="timeline reveal" ref={timelineRef}>
          {phases.map((p) => (
            <div className="timeline-item" key={p.num}>
              <div className="timeline-num">{p.num}</div>
              <div className="timeline-date">{p.date}</div>
              <div className="timeline-phase">{p.phase}</div>
              <div className="timeline-desc">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
