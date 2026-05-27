import bescLogo from '../assets/images/1.png';

export default function LoginPage({ onRegister, onLoginSuccess }) {
  const inputClass = 'h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1c79c6] focus:ring-2 focus:ring-blue-100';

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center">
          <div className="flex items-center gap-3">
            <img src={bescLogo} alt="BESC Logo" className="h-11 w-auto object-contain" />
          </div>
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

          <form className="space-y-4" onSubmit={(event) => {
            event.preventDefault();
            onLoginSuccess();
          }}>
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
