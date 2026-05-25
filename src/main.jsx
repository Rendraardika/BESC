import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import bescLogo from './assets/images/1.png';

const events = [
  {
    icon: '🧬',
    bg: 'bg-[linear-gradient(180deg,#1c79c6,#044b86)]',
    iconColor: 'text-blue-200',
    tags: ['Olimpiade', 'SMA', 'Nasional'],
    title: 'Olimpiade Biologi Sel & Molekuler — BESC 2025 (Jenjang SMA)',
    desc: 'Kompetisi biologi sel dan biologi molekuler tingkat nasional untuk pelajar SMA/MA sederajat. Online, bersertifikat.',
    price: 'Gratis',
    original: 'Rp 39.000',
    discount: '100% OFF',
  },
  {
    icon: '🌱',
    bg: 'from-stone-950 to-amber-800',
    iconColor: 'text-amber-200',
    tags: ['Olimpiade', 'SMP', 'Nasional'],
    title: 'Olimpiade Botani & Ekologi — BESC 2025 (Jenjang SMP)',
    desc: 'Uji pemahamanmu tentang dunia tumbuhan dan ekosistem dalam kompetisi biologi tingkat nasional.',
    price: 'Gratis',
    original: 'Rp 29.000',
    discount: '100% OFF',
  },
  {
    icon: '🦠',
    bg: 'from-indigo-950 to-indigo-700',
    iconColor: 'text-indigo-200',
    tags: ['Olimpiade', 'SMA', 'Nasional'],
    title: 'Olimpiade Mikrobiologi & Genetika — BESC 2025 (Jenjang SMA)',
    desc: 'Kompetisi mikrobiologi dan genetika untuk pelajar SMA/MA. Uji kemampuan analisis dan pemahaman konsepmu.',
    price: 'Rp 39.000',
    original: 'Rp 60.000',
    discount: '35% OFF',
  },
];

const tryouts = [
  ['🧫', 'Tryout Biologi Sel — BESC (Tingkat SMA)', 'Terbuka Umum · SMA · Online'],
  ['🌿', 'Tryout Ekologi & Lingkungan — BESC (Tingkat SMP)', 'Terbuka Umum · SMP · Online'],
  ['🦎', 'Tryout Zoologi & Anatomi — BESC (Tingkat SMA)', 'Terbuka Umum · SMA · Online'],
  ['🧬', 'Tryout Genetika & Evolusi — BESC (Tingkat SMA)', 'Terbuka Umum · SMA · Online'],
  ['🦠', 'Tryout Mikrobiologi — BESC (Tingkat SMP)', 'Terbuka Umum · SMP · Online'],
  ['🌱', 'Tryout Botani — BESC (Tingkat SMP)', 'Terbuka Umum · SMP · Online'],
];

const materi = [
  ['🧫', 'Biologi Sel & Molekuler', 'Struktur sel, organel, siklus sel, ekspresi gen, replikasi DNA, transkripsi, dan translasi protein.'],
  ['🦠', 'Mikrobiologi', 'Bakteri, virus, fungi, dan protista. Patogenesis, antibiotik, serta peran dalam bioteknologi.'],
  ['🌱', 'Botani', 'Anatomi dan fisiologi tumbuhan, fotosintesis, hormon, reproduksi, dan adaptasi ekologis.'],
  ['🐾', 'Zoologi', 'Klasifikasi hewan, sistem organ, perilaku, fisiologi komparatif, dan embriologi vertebrata.'],
  ['🧬', 'Genetika & Evolusi', 'Hukum Mendel, genetika populasi, mutasi, seleksi alam, dan filogenetika molekuler.'],
  ['🌍', 'Ekologi', 'Ekosistem, rantai makanan, siklus biogeokimia, keanekaragaman hayati, dan perubahan iklim.'],
];

const timeline = [
  ['01', 'Jan - Feb 2025', 'Pendaftaran', 'Daftar online, lengkapi dokumen, dan bayar biaya administrasi.'],
  ['02', 'Maret 2025', 'Seleksi Awal', 'Ujian online CBT pilihan ganda dan isian singkat.'],
  ['03', 'April 2025', 'Semifinal', '50 peserta terbaik mengikuti ujian esai dan analisis data.'],
  ['04', 'Mei 2025', 'Grand Final', '15 finalis bertanding dalam praktikum lab dan presentasi riset.'],
];

const faqs = [
  ['Siapa saja yang bisa mendaftar BESC?', 'BESC terbuka untuk siswa SMA/MA/SMK sederajat dari seluruh Indonesia, baik negeri maupun swasta.'],
  ['Berapa biaya pendaftaran?', 'Biaya pendaftaran sebesar Rp 150.000 per peserta yang mencakup akses seluruh tahapan kompetisi, modul latihan, dan sertifikat keikutsertaan.'],
  ['Apakah tersedia bimbingan belajar sebelum kompetisi?', 'Ya, panitia menyediakan webinar persiapan dan modul materi digital yang dapat diunduh gratis setelah pendaftaran dikonfirmasi.'],
  ['Apa hadiah untuk para pemenang?', 'Juara 1 mendapatkan beasiswa senilai Rp 20 juta + trofi + medali emas. Juara 2 Rp 15 juta, Juara 3 Rp 10 juta.'],
  ['Apakah grand final dilaksanakan online atau offline?', 'Grand final dilaksanakan secara offline di kota yang akan diumumkan kemudian.'],
];

function Button({ children, variant = 'solid', onClick, href = '#' }) {
  const className = variant === 'ghost'
    ? 'rounded-full border-2 border-[#1c79c6] px-5 py-2 text-sm font-bold text-[#1c79c6] transition hover:bg-blue-50'
    : 'rounded-full bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-5 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1c79c6]/25';

  if (onClick) {
    return <button type="button" onClick={onClick} className={className}>{children}</button>;
  }
  return <a href={href} className={className}>{children}</a>;
}

function Header({ onRegister, onLogin }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-6 backdrop-blur md:px-8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6">
          <a href="#home" className="flex shrink-0 items-center gap-3">
            <img src={bescLogo} alt="BESC Logo" className="h-11 w-auto object-contain" />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {[
              ['Kompetisi', ['🏆 Olimpiade Biologi', '📝 Tryout', '📖 Latihan Soal']],
              ['Konten', ['✍️ Blog & Artikel', '❓ FAQ']],
            ].map(([label, links]) => (
              <li key={label} className="group relative">
                <button className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#1c79c6]">
                  {label}
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2 transition group-hover:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
                </button>
                <div className="invisible absolute left-0 top-[calc(100%+8px)] z-20 min-w-48 -translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {links.map((item) => <a key={item} href="#kompetisi" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-[#044b86]">{item}</a>)}
                </div>
              </li>
            ))}
            <li><a href="#tentang" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#1c79c6]">Tentang Kami</a></li>
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" onClick={onLogin}>Login</Button>
            <Button onClick={onRegister}>Daftar Sekarang</Button>
          </div>

          <button type="button" className="grid h-10 w-10 place-items-center rounded-xl text-slate-900 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] bg-black/50" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-[280px] bg-white p-6" onClick={(event) => event.stopPropagation()}>
            <div className="mb-8 flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-[#1c79c6]">
              <img src={bescLogo} alt="BESC" className="h-10 w-auto" />
            </div>
            <div className="flex flex-col gap-1">
              {['🏆 Kompetisi', '📝 Tryout', '📚 Materi', '📅 Jadwal', 'ℹ️ Tentang', '❓ FAQ'].map((item) => (
                <a key={item} href="#kompetisi" className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#1c79c6]">{item}</a>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <Button variant="ghost" onClick={onLogin}>Login</Button>
              <Button onClick={onRegister}>Daftar Sekarang</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Hero({ onRegister }) {
  return (
    <section id="home" className="relative overflow-hidden bg-[linear-gradient(180deg,#1c79c6_0%,#044b86_100%)] px-6 py-20 md:px-8">
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
        <div className="hidden justify-center lg:flex">
          <div className="flex flex-col items-center gap-5 rounded-[2rem] border border-white/15 bg-white/10 p-12 backdrop-blur">
            <img src={bescLogo} alt="Logo BESC" className="h-48 w-48 object-contain drop-shadow-[0_0_30px_rgba(74,222,128,0.45)]" />
            <div className="text-center text-xs uppercase tracking-[0.12em] text-blue-100">Biology Environmental<br />Smart Competition</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-6 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 text-center md:grid-cols-4">
        {[
          ['500+', 'Peserta Aktif'],
          ['34', 'Provinsi Terwakili'],
          ['10+', 'Bidang Materi'],
          ['Rp50Jt', 'Total Hadiah'],
        ].map(([num, label]) => (
          <div key={label} className="border-slate-200 py-2 md:border-r md:last:border-r-0">
            <div className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-[#1c79c6]">{num}</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ label, title, sub, center = false }) {
  return (
    <div className={center ? 'mb-10 text-center' : 'mb-8'}>
      <div className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.1em] text-[#044b86]">{label}</div>
      <h2 className="mb-3 font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-[-0.02em] text-slate-950 md:text-4xl">{title}</h2>
      {sub && <p className={`text-sm leading-7 text-slate-500 ${center ? 'mx-auto max-w-xl' : 'max-w-xl'}`}>{sub}</p>}
    </div>
  );
}

function Events({ onRegister }) {
  return (
    <section id="kompetisi" className="px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeader label="🏆 Kompetisi Terbaru" title="Event BESC Terbaru" sub="Jangan lewatkan kesempatan emas! Dapatkan informasi terbaru tentang kompetisi biologi kami." />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {events.filter((event) => !event.title.includes('Botani')).map((event) => (
            <article key={event.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-[#1c79c6] hover:shadow-2xl">
              <div className={`grid h-44 place-items-center bg-gradient-to-br ${event.bg} text-6xl ${event.iconColor}`}>{event.icon}</div>
              <div className="p-5">
                <div className="mb-3 flex flex-wrap gap-2">
                  {event.tags.map((tag) => <span key={tag} className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#044b86]">{tag}</span>)}
                </div>
                <h3 className="mb-3 line-clamp-2 font-['Plus_Jakarta_Sans'] text-base font-extrabold leading-6 text-slate-950">{event.title}</h3>
                <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-500">{event.desc}</p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-[#1c79c6]">{event.price}</span>
                    <span className="text-xs text-slate-400 line-through">{event.original}</span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-600">{event.discount}</span>
                  </div>
                  <button type="button" onClick={onRegister} className="rounded-full bg-blue-100 px-4 py-2 text-xs font-extrabold text-[#044b86] transition hover:bg-[linear-gradient(180deg,#1c79c6,#044b86)] hover:text-white">Daftar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tryout() {
  return (
    <section id="tryout" className="bg-slate-50 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="📝 Tryout Gratis" title="Tryout BESC" sub="Jangan ragu! Ikuti tryout gratis sekarang dan rasakan pengalaman langsung yang tak terlupakan." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tryouts.map(([icon, title, sub]) => (
            <a key={title} href="#tryout" className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:translate-x-1 hover:border-[#1c79c6] hover:shadow-lg">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-blue-100 text-2xl">{icon}</div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-950">{title}</h3>
                <p className="mt-1 text-xs text-slate-500">{sub}</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-extrabold text-[#044b86]">GRATIS</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Materi() {
  return (
    <section id="materi" className="px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader center label="📚 Materi Lengkap" title="Cakupan Bidang Biologi" sub="Kompetisi BESC mencakup 6 bidang utama biologi yang terintegrasi dan berbasis riset terkini." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materi.map(([icon, title, desc]) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-[#1c79c6] hover:shadow-lg">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-100 text-2xl">{icon}</div>
              <div>
                <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-950">{title}</h3>
                <p className="text-xs leading-6 text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section id="jadwal" className="bg-slate-50 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader center label="📅 Jadwal" title="Tahapan Kompetisi BESC 2025" sub="Ikuti perjalanan kompetisi dari pendaftaran hingga grand final." />
        <div className="relative mt-12 grid gap-8 md:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-8 hidden h-0.5 bg-gradient-to-r from-[#1c79c6] to-[#044b86] md:block"></div>
          {timeline.map(([num, date, title, desc]) => (
            <div key={num} className="relative z-10 text-center">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[linear-gradient(180deg,#1c79c6,#044b86)] font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-white shadow-[0_0_0_6px_#dbeafe]">{num}</div>
              <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#1c79c6]">{date}</div>
              <h3 className="mb-2 font-['Plus_Jakarta_Sans'] font-extrabold text-slate-950">{title}</h3>
              <p className="text-xs leading-6 text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyBesc() {
  return (
    <section id="tentang" className="px-6 py-20 md:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div>
          <SectionHeader label="✨ Keunggulan" title="Mengapa Harus BESC?" sub="Dapatkan berbagai macam benefit eksklusif dari program kompetisi biologi terbaik Indonesia." />
          <div className="space-y-5">
            {[
              ['🔬', 'Soal Berkualitas Tinggi', 'Soal disusun oleh tim ahli biologi dari perguruan tinggi terkemuka di Indonesia.'],
              ['🏆', 'Hadiah & Beasiswa Bergengsi', 'Total hadiah Rp 50 juta + beasiswa + kesempatan olimpiade internasional.'],
              ['📜', 'Sertifikat Resmi Bersertifikasi', 'Sertifikat keikutsertaan dan penghargaan yang diakui secara nasional.'],
              ['🌿', 'Komunitas Ilmuwan Muda', 'Bergabung dengan ribuan pelajar berprestasi se-Indonesia dalam ekosistem belajar yang positif.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 p-5 transition hover:translate-x-1 hover:border-[#1c79c6] hover:bg-blue-50">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-xl">{icon}</div>
                <div>
                  <h3 className="mb-1 font-['Plus_Jakarta_Sans'] font-extrabold text-slate-950">{title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden rounded-[1.5rem] bg-[linear-gradient(180deg,#1c79c6,#044b86)] p-12 lg:block">
          {[
            ['500+', 'Peserta telah bergabung dari seluruh Indonesia'],
            ['34', 'Provinsi terwakili dalam kompetisi BESC'],
            ['Rp 50Jt', 'Total hadiah yang telah dibagikan kepada pemenang'],
          ].map(([num, label]) => (
            <div key={num} className="mb-6 rounded-2xl border border-white/15 bg-white/10 p-6 text-white last:mb-0">
              <div className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold text-blue-200">{num}</div>
              <div className="mt-2 text-sm text-blue-100">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-slate-50 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader center label="💬 Testimoni" title="Kata Mereka tentang BESC" sub="BESC telah berkomitmen untuk siswa dan instansi seluruh Indonesia." />
        <div className="grid gap-7 lg:grid-cols-3">
          {[
            ['👩‍🎓', 'Ratu Apik Hidayah', 'SMA Negeri 3 Jakarta', 'Olimpiade BESC bermanfaat banget untuk melatih manajemen waktu dan berpikir kritis.'],
            ['👨‍🎓', 'Ahmad Zaki Firmansyah', 'SMAN 1 Surabaya', 'Dari BESC, saya belajar untuk berpikir kritis tentang konsep biologi dan teliti dalam mengerjakan soal.'],
            ['👩‍🔬', 'Dirta Amelia Putri', 'SMA Hang Tuah 5 Sidoarjo', 'Senang sekali bisa jadi Juara 1 Olimpiade Biologi BESC! Tetap optimis dan terus belajar.'],
          ].map(([avatar, name, school, text]) => (
            <div key={name} className="relative rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-5 top-5 text-xs tracking-wider text-amber-500">★★★★★</div>
              <div className="mb-4 text-4xl leading-none text-[#1c79c6]">"</div>
              <p className="mb-5 text-sm italic leading-7 text-slate-600">{text}</p>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-100 text-xl">{avatar}</div>
                <div>
                  <div className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-950">{name}</div>
                  <div className="text-xs text-slate-500">{school}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Blog() {
  return (
    <section id="blog" className="px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="✍️ Blog & Artikel" title="Konten Terbaru BESC" sub="Informasi lengkap seputar dunia biologi, tips kompetisi, dan update terbaru BESC." />
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {[
            ['🧬', 'Biologi', '10 Mei 2025', 'Tips Persiapan Olimpiade Biologi: Strategi Belajar Efektif untuk SMA'],
            ['🔬', 'Sains', '5 Mei 2025', 'Memahami Replikasi DNA: Panduan Lengkap untuk Pelajar SMA'],
            ['🌱', 'Ekologi', '1 Mei 2025', 'Keanekaragaman Hayati Indonesia: Peluang dan Tantangan Konservasi'],
          ].map(([icon, tag, date, title]) => (
            <a key={title} href="#blog" className="flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-2xl">
              <div className="grid h-48 shrink-0 place-items-center bg-[linear-gradient(180deg,#1c79c6,#044b86)] text-5xl text-blue-200">{icon}</div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-[#044b86]">{tag}</span>
                  <span className="text-xs text-slate-500">{date}</span>
                </div>
                <h3 className="line-clamp-2 font-['Plus_Jakarta_Sans'] font-extrabold leading-6 text-slate-950">{title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">Pelajari wawasan terbaru dan tips persiapan kompetisi biologi bersama BESC.</p>
                <button type="button" className="mt-auto rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-white">Baca Artikel</button>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ onRegister }) {
  return (
    <section className="bg-slate-50 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#1c79c6,#044b86)] p-10 md:grid-cols-[1fr_auto] md:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-300/10"></div>
          <div className="relative z-10">
            <div className="mb-5 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100">🚀 Bergabung Sekarang</div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold leading-tight text-white">Siap Menjadi<br /><span className="text-blue-200">Ilmuwan Muda</span> Terbaik?</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">Pendaftaran BESC 2025 telah dibuka. Daftarkan dirimu sebelum 28 Februari 2025 dan mulailah perjalanan menuju puncak kompetisi biologi nasional.</p>
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

function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader center label="❓ FAQ" title="Pertanyaan yang Sering Diajukan" />
        <div className="mx-auto mt-8 max-w-3xl">
          {faqs.map(([q, a], index) => (
            <button key={q} type="button" onClick={() => setOpen(open === index ? null : index)} className="w-full border-b border-slate-200 py-5 text-left">
              <span className="flex items-center justify-between gap-5 font-semibold text-slate-950">
                {q}
                <span className={`text-2xl text-[#1c79c6] transition ${open === index ? 'rotate-45' : ''}`}>+</span>
              </span>
              {open === index && <span className="mt-3 block text-sm leading-7 text-slate-500">{a}</span>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 px-6 py-16 text-slate-400 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-slate-800 pb-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-3 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#1c79c6]">🌿 BESC</div>
            <p className="mb-5 text-sm leading-7">BESC memiliki ekosistem lengkap penunjang belajar siswa Indonesia mulai dari kompetisi biologi, latihan soal, bimbingan olimpiade, dan wadah komunitas prestasi seluruh Indonesia.</p>
            <div className="flex gap-3">
              {['📷', '💬', '▶️', 'in'].map((item) => <a key={item} href="#home" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-700 bg-slate-800 transition hover:border-[#1c79c6] hover:bg-[linear-gradient(180deg,#1c79c6,#044b86)] hover:text-white">{item}</a>)}
            </div>
          </div>
          {[
            ['Kompetisi', ['Olimpiade Biologi', 'Tryout Gratis', 'Latihan Soal', 'Jadwal Event']],
            ['Informasi', ['Tentang BESC', 'Blog & Artikel', 'FAQ', 'Kerja Sama']],
            ['Customer Service', ['📱 0812-3456-7890', '✉️ info@besc.id', '💬 Live Chat', '📋 Syarat & Ketentuan']],
          ].map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-200">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => <li key={link}><a href="#home" className="text-sm text-slate-500 hover:text-[#1c79c6]">{link}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col justify-between gap-3 text-xs text-slate-600 md:flex-row">
          <span>© 2025 BESC · Biology Environmental Smart Competition. All rights reserved.</span>
          <span>Made with 🌿 for Indonesia</span>
        </div>
      </div>
    </footer>
  );
}

function RegisterPage({ onBack }) {
  const inputClass = 'h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100';

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button type="button" onClick={onBack} className="flex items-center gap-3">
            <img src={bescLogo} alt="BESC Logo" className="h-11 w-auto object-contain" />
          </button>
          <button type="button" onClick={onBack} className="rounded-full border border-slate-200 px-5 py-2 text-sm font-bold text-slate-700 transition hover:border-[#1c79c6] hover:text-[#1c79c6]">
            Kembali
          </button>
        </div>
      </header>

      <section className="px-6 py-12 md:px-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden bg-[linear-gradient(180deg,#1c79c6,#044b86)] p-10 text-white lg:block">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl"></div>
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-5 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100">Pendaftaran BESC</div>
                <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold leading-tight">Mulai perjalanan kompetisimu hari ini.</h1>
                <p className="mt-4 text-sm leading-7 text-blue-100">Lengkapi data diri dengan benar agar proses verifikasi peserta berjalan lancar.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <div className="text-3xl font-extrabold">BESC 2025</div>
                <div className="mt-2 text-sm text-blue-100">Biology Environmental Smart Competition</div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-slate-950">Daftar Akun</h2>
            <p className="mt-2 text-sm text-slate-500">Lengkapi data diri untuk mengikuti kompetisi.</p>
            <form className="mt-8 grid gap-4 md:grid-cols-2">
              {['Nama', 'Email', 'Nomor WA Aktif', 'Tanggal Lahir', 'Nama Sekolah', 'Password', 'Confirm Password'].map((label) => (
                <div key={label} className={label === 'Nama Sekolah' ? 'md:col-span-2' : ''}>
                  <label className="mb-1 block text-xs font-bold text-slate-700">{label}</label>
                  <input className={inputClass} type={label.includes('Password') ? 'password' : label === 'Email' ? 'email' : label === 'Tanggal Lahir' ? 'date' : 'text'} />
                </div>
              ))}
              {['Jenis Kelamin', 'Provinsi Domisili', 'Kota Domisili'].map((label) => (
                <div key={label}>
                  <label className="mb-1 block text-xs font-bold text-slate-700">{label}</label>
                  <select className={inputClass} defaultValue="">
                    <option value="" disabled>Pilih {label.replace(' Domisili', '')}</option>
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                    <option>Jawa Barat</option>
                    <option>DKI Jakarta</option>
                    <option>Bandung</option>
                  </select>
                </div>
              ))}
              <button type="submit" className="mt-2 rounded-xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-5 py-3 text-sm font-bold text-white md:col-span-2">Daftar</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function LoginPage({ onBack, onRegister }) {
  const inputClass = 'h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100';

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button type="button" onClick={onBack} className="flex items-center gap-3">
            <img src={bescLogo} alt="BESC Logo" className="h-11 w-auto object-contain" />
          </button>
          <button type="button" onClick={onBack} className="rounded-full border border-slate-200 px-5 py-2 text-sm font-bold text-slate-700 transition hover:border-[#1c79c6] hover:text-[#1c79c6]">
            Kembali
          </button>
        </div>
      </header>

      <section className="grid min-h-[calc(100vh-78px)] place-items-center px-6 py-12 md:px-8">
        <div className="w-full max-w-[460px] rounded-[2rem] bg-white p-7 shadow-2xl md:p-9">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] text-2xl font-extrabold text-white">
              B
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-slate-950">Masuk Akun</h1>
            <p className="mt-2 text-sm text-slate-500">Masuk untuk melanjutkan ke dashboard peserta.</p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Email atau Username</label>
              <input className={inputClass} type="text" placeholder="Masukkan email atau username" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Password</label>
              <input className={inputClass} type="password" placeholder="Masukkan password" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-500">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#1c79c6]" />
                Ingat saya
              </label>
              <a href="#login" className="font-bold text-[#1c79c6]">Lupa password?</a>
            </div>
            <button type="submit" className="w-full rounded-xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-5 py-3 text-sm font-bold text-white">
              Masuk
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span className="text-xs font-semibold text-slate-400">atau</span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <button type="button" className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[#1c79c6] hover:bg-blue-50">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-base shadow-sm">G</span>
            Masuk dengan Google
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Belum punya akun?{' '}
            <button type="button" onClick={onRegister} className="font-bold text-[#1c79c6]">
              Daftar sekarang
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

function App() {
  const initialPage = window.location.hash === '#daftar' ? 'register' : window.location.hash === '#login' ? 'login' : 'home';
  const [page, setPage] = useState(initialPage);
  const openRegister = () => {
    window.location.hash = 'daftar';
    window.scrollTo(0, 0);
    setPage('register');
  };
  const openLogin = () => {
    window.location.hash = 'login';
    window.scrollTo(0, 0);
    setPage('login');
  };
  const backHome = () => {
    window.location.hash = 'home';
    window.scrollTo(0, 0);
    setPage('home');
  };

  if (page === 'register') {
    return <RegisterPage onBack={backHome} />;
  }

  if (page === 'login') {
    return <LoginPage onBack={backHome} onRegister={openRegister} />;
  }

  return (
    <>
      <Header onRegister={openRegister} onLogin={openLogin} />
      <main>
        <Hero onRegister={openRegister} />
        <StatsStrip />
        <Events onRegister={openRegister} />
        <Tryout />
        <Materi />
        <Timeline />
        <WhyBesc />
        <Testimonials />
        <Blog />
        <CTA onRegister={openRegister} />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);

