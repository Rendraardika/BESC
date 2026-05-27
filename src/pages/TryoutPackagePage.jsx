import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import tryoutStudentsGroup from '../assets/images/tryout-students-group.png';
import tryoutStudentsPair from '../assets/images/tryout-students-pair.png';
import tryoutStudentBoy from '../assets/images/tryout-student-boy.png';

const packageBenefits = [
  '3 paket Tryout Biologi Online dengan level soal bertahap',
  'Setiap paket menggunakan batas waktu seperti simulasi lomba',
  'Sistem penilaian otomatis setelah tryout selesai',
  'Detail skor untuk melihat materi yang sudah dan belum dikuasai',
  'Pembahasan soal ringkas untuk bahan evaluasi mandiri',
  'Ranking simulasi peserta tingkat nasional',
  'Cocok untuk persiapan BESC 2026 jenjang SMP dan SMA',
];

const materials = [
  'Biologi Sel',
  'Genetika dan Evolusi',
  'Ekologi Lingkungan',
  'Zoologi dan Anatomi',
  'Botani Dasar',
  'Mikrobiologi',
  'Strategi Pengerjaan Soal',
];

const classPrep = [
  'Pastikan koneksi internet stabil sebelum mulai',
  'Gunakan browser terbaru di laptop atau ponsel',
  'Kerjakan tryout sesuai durasi yang tersedia',
  'Baca pembahasan setelah hasil keluar',
  'Catat materi yang perlu dipelajari ulang',
];

const recommendations = [
  {
    image: tryoutStudentsPair,
    title: 'Paket Latihan Biologi Dasar BESC',
    desc: 'Latihan konsep dasar untuk pemanasan sebelum masuk simulasi fulltest.',
  },
  {
    image: tryoutStudentBoy,
    title: 'Paket Intensif Olimpiade BESC',
    desc: 'Latihan soal menantang untuk peserta yang ingin mengejar target juara.',
  },
];

export default function TryoutPackagePage({ onLogin, onLogout, onOlimpiade, onProfile, onRegister, onTryout, user }) {
  return (
    <>
      <Header onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} onTryout={onTryout} user={user} />
      <main className="bg-white text-slate-900">
        <section className="px-6 py-12 md:px-8 lg:py-16">
          <div className="mx-auto max-w-[1620px]">
            <h1 className="mb-8 font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-emerald-700">Beli Paket</h1>

            <div className="grid gap-12 lg:grid-cols-[0.78fr_1.18fr] lg:items-start">
              <div>
                <img
                  src={tryoutStudentsGroup}
                  alt="Bundling Tryout BESC"
                  className="h-[330px] w-full rounded-sm object-cover object-center"
                />

                <h2 className="mt-7 max-w-2xl font-['Plus_Jakarta_Sans'] text-2xl font-extrabold uppercase leading-tight text-slate-900 md:text-3xl">
                  Bundling 3 Tryout Biologi BESC 2026
                </h2>
                <p className="mt-5 text-lg font-extrabold leading-7 text-slate-800">
                  Prediksi soal BESC 2026 berdasarkan pola kompetisi biologi nasional.
                </p>
                <p className="mt-1 text-lg leading-7 text-slate-600">
                  Berisi 3 paket tryout fulltest dengan soal HOTS, pembahasan, dan evaluasi skor.
                </p>
                <p className="mt-3 text-lg leading-7 text-slate-700">
                  Check 3 paket Tryout Online untuk jenjang SMP dan SMA.
                </p>

                <div className="mt-9 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="rounded-lg bg-emerald-600 px-3 py-1.5 text-base font-extrabold text-white">100%</span>
                    <span className="text-lg text-slate-500 line-through">Rp60.000</span>
                  </div>
                  <div className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold text-emerald-700">Gratis</div>
                </div>
              </div>

              <div className="pt-1">
                <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-emerald-700">Tentang Paket</h2>
                <p className="mt-7 max-w-4xl text-2xl leading-10 text-slate-700">
                  Berisi 3 Paket Tryout Biologi Fulltest dengan soal HOTS dan pembahasan singkat untuk membantu peserta mempersiapkan diri menghadapi BESC 2026
                  <span className="font-extrabold text-slate-900"> (Aktif hingga kompetisi selesai)</span>
                </p>

                <div className="mt-7 space-y-3">
                  {packageBenefits.map((item) => (
                    <p key={item} className="text-2xl leading-9 text-slate-700">✓ {item}</p>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onRegister}
                  className="mt-12 w-full rounded-2xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-8 py-4 text-2xl font-extrabold text-white transition hover:brightness-110"
                >
                  Beli Paket
                </button>
              </div>
            </div>

            <div className="mt-12 grid gap-14 lg:grid-cols-[0.78fr_1.18fr]">
              <InfoBlock title="Materi" items={materials} />
              <InfoBlock title="Persiapan Kelas" items={classPrep} />
            </div>
          </div>
        </section>

        <section className="bg-emerald-50 px-6 py-24 md:px-8">
          <div className="mx-auto grid max-w-[1620px] gap-10 lg:grid-cols-[1fr_0.75fr]">
            <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-slate-900">Rekomendasi lain buatmu</h2>

            <div className="space-y-8">
              {recommendations.map((item) => (
                <article key={item.title}>
                  <img src={item.image} alt={item.title} className="h-56 w-full rounded-2xl object-cover object-center" />
                  <h3 className="mt-6 max-w-xl font-['Plus_Jakarta_Sans'] text-2xl font-extrabold leading-8 text-slate-950">{item.title}</h3>
                  <p className="mt-3 max-w-xl text-lg leading-7 text-slate-600">{item.desc}</p>
                  <div className="mt-7 border-t border-emerald-200"></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function InfoBlock({ items, title }) {
  return (
    <div>
      <h2 className="mb-7 font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-emerald-700">{title}</h2>
      <ol className="space-y-3 text-2xl leading-9 text-slate-700">
        {items.map((item, index) => (
          <li key={item}>{index + 1}. {item}</li>
        ))}
      </ol>
    </div>
  );
}
