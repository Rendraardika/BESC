import bescLogo from '../assets/images/logo BESC biru tua FIX.png';

export default function EventRegistrationSuccessPage({ eventTitle, onHome, onOlimpiade }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f4f8f7] px-5 py-10">
      <div className="absolute left-0 top-0 h-2 w-full bg-[linear-gradient(90deg,#0d9488_0%,#1c79c6_55%,#ffd166_100%)]"></div>
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-teal-100/60 blur-3xl"></div>

      <section className="relative w-full max-w-xl text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#0d9488] shadow-xl shadow-teal-900/15">
          <img src={bescLogo} alt="BESC" className="w-16 rounded-md bg-white p-2" />
        </div>

        <div className="mx-auto mt-7 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current stroke-[2.5]">
            <path d="m5 12 4 4L19 6" />
          </svg>
        </div>

        <h1 className="mt-6 font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-[#17324d] md:text-4xl">Pendaftaran Berhasil!</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
          Data pendaftaran kamu untuk <span className="font-extrabold text-[#0d9488]">{eventTitle}</span> sudah diterima. Tim BESC akan memeriksa pembayaran dan menghubungi kamu setelah verifikasi.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={onHome} className="h-12 rounded-lg border border-slate-200 bg-white px-6 text-sm font-extrabold text-[#17324d] shadow-sm hover:bg-slate-50">
            Kembali ke Beranda
          </button>
          <button type="button" onClick={onOlimpiade} className="h-12 rounded-lg bg-[#0d9488] px-6 text-sm font-extrabold text-white shadow-lg shadow-teal-900/15 hover:bg-[#087f75]">
            Lihat Kompetisi Lain
          </button>
        </div>

        <p className="mt-8 text-xs font-semibold text-slate-400">Status verifikasi dapat dipantau melalui akun peserta BESC.</p>
      </section>
    </main>
  );
}
