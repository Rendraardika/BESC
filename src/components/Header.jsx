import { useState } from 'react';
import bescLogo from '../assets/images/1.png';
import Button from './Button.jsx';

export default function Header({ onRegister, onLogin }) {
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
