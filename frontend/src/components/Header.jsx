import { useState } from 'react';
import bescLogo from '../assets/images/logo BESC biru tua FIX.png';
import Button from './Button.jsx';

export default function Header({ isHome = false, onLogin, onLogout, onOlimpiade, onProfile, onTryout, onRegister, user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const userInitial = user?.name?.charAt(0).toUpperCase() ?? 'U';

  const openOlimpiade = () => {
    setMobileOpen(false);
    onOlimpiade();
  };

  const openTryout = () => {
    setMobileOpen(false);
    onTryout();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur md:px-8">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-8">
          <a href="#home" className="flex shrink-0 items-center gap-3">
            <img src={bescLogo} alt="BESC Logo" className={`h-50 w-auto object-contain ${isHome ? 'brightness-75 saturate-150' : ''}`} />
          </a>

          <ul className="hidden items-center gap-3 lg:flex">
            <li className="group relative">
              <button className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#1c79c6]">
                Kompetisi
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2 transition group-hover:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              <div className="invisible absolute left-0 top-full z-20 min-w-48 -translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <button type="button" onClick={openOlimpiade} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-[#044b86]">Olimpiade Biologi</button>
                <button type="button" onClick={openTryout} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-[#044b86]">Tryout</button>
                <a href="#materi" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-[#044b86]">Latihan Soal</a>
              </div>
            </li>
            <li className="group relative">
              <button className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#1c79c6]">
                Konten
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2 transition group-hover:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              <div className="invisible absolute left-0 top-full z-20 min-w-48 -translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <a href="#blog" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-[#044b86]">Blog & Artikel</a>
                <a href="#faq" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-[#044b86]">FAQ</a>
              </div>
            </li>
            <li><a href="#tentang" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#1c79c6]">Tentang Kami</a></li>
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 rounded-xl bg-blue-100 px-4 py-2 text-sm font-bold text-[#044b86] transition hover:bg-blue-200"
                >
                  <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-[linear-gradient(180deg,#1c79c6,#044b86)] text-xs font-extrabold text-white">
                    {user.photo ? <img src={user.photo} alt={user.name} className="h-full w-full object-cover" /> : userInitial}
                  </span>
                  <span>{user.name}</span>
                  <svg viewBox="0 0 24 24" className={`h-4 w-4 fill-none stroke-current stroke-2 transition ${profileOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    <a href="#home" className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-[#044b86]">Dashboard</a>
                    <button type="button" onClick={() => {
                      setProfileOpen(false);
                      onProfile();
                    }} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-[#044b86]">Profil Saya</button>
                    <button type="button" onClick={onLogout} className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50">Keluar</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={onLogin}>Login</Button>
                <Button variant="primary" onClick={onRegister}>Daftar Sekarang</Button>
              </>
            )}
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
              <button type="button" onClick={openOlimpiade} className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#1c79c6]">Olimpiade Biologi</button>
              <button type="button" onClick={openTryout} className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#1c79c6]">Tryout</button>
              <a href="#materi" className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#1c79c6]">Materi</a>
              <a href="#jadwal" className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#1c79c6]">Jadwal</a>
              <a href="#tentang" className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#1c79c6]">Tentang</a>
              <a href="#faq" className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#1c79c6]">FAQ</a>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              {user ? (
                <div className="rounded-2xl bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[linear-gradient(180deg,#1c79c6,#044b86)] text-sm font-extrabold text-white">
                      {user.photo ? <img src={user.photo} alt={user.name} className="h-full w-full object-cover" /> : userInitial}
                    </span>
                    <div>
                      <div className="text-sm font-extrabold text-slate-950">{user.name}</div>
                      <div className="text-xs text-slate-500">Peserta BESC</div>
                    </div>
                  </div>
                  <button type="button" onClick={onLogout} className="mt-4 w-full rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600">
                    Keluar
                  </button>
                  <button type="button" onClick={() => {
                    setMobileOpen(false);
                    onProfile();
                  }} className="mt-3 w-full rounded-xl bg-blue-100 px-4 py-2 text-sm font-bold text-[#044b86]">
                    Profil Saya
                  </button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" onClick={onLogin}>Login</Button>
                  <Button variant="primary" onClick={() => {
                    setMobileOpen(false);
                    onRegister();
                  }}>Daftar Sekarang</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
