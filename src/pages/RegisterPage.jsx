import bescLogo from '../assets/images/1.png';

export default function RegisterPage({ onBack }) {
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
