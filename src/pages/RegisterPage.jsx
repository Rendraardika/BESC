import bescLogo from '../assets/images/1.png';

export default function RegisterPage({ onLogin }) {
  const inputClass = 'h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100';

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center">
          <div className="flex items-center gap-3">
            <img src={bescLogo} alt="BESC Logo" className="h-11 w-auto object-contain" />
          </div>
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
            <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={(event) => {
              event.preventDefault();
              onLogin();
            }}>
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

            <div className="mt-7">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200"></div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Atau lanjutkan dengan</span>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>

              <button type="button" className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[#1c79c6] hover:bg-blue-50">
                <span className="text-xl font-extrabold">
                  <span className="text-blue-500">G</span>
                </span>
                Google
              </button>

              <p className="mt-6 text-center text-sm text-slate-500">
                Sudah punya akun?{' '}
                <button type="button" onClick={onLogin} className="font-bold text-[#1c79c6]">
                  Masuk
                </button>
              </p>
              <p className="mt-1 text-center text-xs text-slate-400">© 2026 BESC. Semua hak dilindungi.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
