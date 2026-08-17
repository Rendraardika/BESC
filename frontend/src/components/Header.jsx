import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import bescLogo from '../assets/images/logo BESC biru tua FIX.png';
import Button from './Button.jsx';
import { normalizePhotoSrc } from '../lib/photoUtils.js';

export default function Header({ isHome = false, onLogin, onLogout, onOlimpiade, onProfile, onRegister, onTryout, user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const userInitial = user?.name?.charAt(0).toUpperCase() ?? 'U';

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const scrollY = window.scrollY;
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.width = previousBodyStyles.width;
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const openOlimpiade = () => {
    setMobileOpen(false);
    onOlimpiade();
  };

  const openTryout = () => {
    setMobileOpen(false);
    onTryout?.();
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
              </div>
            </li>
            <li className="group relative">
              <button className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#1c79c6]">
                Konten
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2 transition group-hover:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              <div className="invisible absolute left-0 top-full z-20 min-w-48 -translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
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
                    {user.photo ? <img src={normalizePhotoSrc(user.photo)} alt={user.name} className="h-full w-full object-cover" /> : userInitial}
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
              </>
            )}
          </div>

          <button type="button" className="grid h-10 w-10 place-items-center rounded-xl text-slate-900 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
      </nav>

      {mobileOpen && createPortal(
        <div className="fixed inset-0 z-[100] h-[100dvh] overflow-hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <div
            className="fixed left-0 top-0 z-[110] flex h-[100dvh] w-[280px] max-w-[85vw] flex-col bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between pb-3 border-b border-slate-100">
              <img src={bescLogo} alt="BESC" className="h-8 w-auto object-contain" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                aria-label="Tutup menu"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain py-4 pr-1">
              <button
                type="button"
                onClick={openOlimpiade}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-[#1c79c6]"
              >
                Olimpiade Biologi
              </button>
              <a
                href="#guidebook"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-[#1c79c6]"
              >
                Unduh Panduan
              </a>
              <a
                href="#materi"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-[#1c79c6]"
              >
                Materi
              </a>
              <a
                href="#jadwal"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-[#1c79c6]"
              >
                Jadwal
              </a>
              <a
                href="#tentang"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-[#1c79c6]"
              >
                Tentang
              </a>
              <a
                href="#faq"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-[#1c79c6]"
              >
                FAQ
              </a>
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white pt-3">
              {user ? (
                <div className="rounded-xl bg-blue-50 p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-[linear-gradient(180deg,#1c79c6,#044b86)] text-xs font-extrabold text-white">
                      {user.photo ? <img src={user.photo} alt={user.name} className="h-full w-full object-cover" /> : userInitial}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-extrabold text-slate-950">{user.name}</div>
                      <div className="text-[10px] text-slate-500">Peserta BESC</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onProfile();
                      }}
                      className="flex-1 rounded-lg bg-blue-100 py-1.5 text-xs font-bold text-[#044b86] transition hover:bg-blue-200"
                    >
                      Profil
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onLogout();
                      }}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onLogin();
                  }}
                  className="w-full rounded-full border-2 border-[#1c79c6] py-2 text-sm font-bold text-[#1c79c6] transition hover:bg-[#1c79c6] hover:text-white"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
