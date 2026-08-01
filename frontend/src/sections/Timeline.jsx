import SectionHeader from '../components/SectionHeader.jsx';
import timelineImage from '../assets/images/timeline.png';

export default function Timeline() {
  return (
    <section id="jadwal" className="bg-slate-50 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          center
          label="Jadwal"
          title="Tahapan Kompetisi BESC 2026"
          sub="Ikuti perjalanan kompetisi dari pendaftaran hingga grand final."
        />
        <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <img
            src={timelineImage}
            alt="Tahapan Kompetisi BESC 2026"
            className="w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
