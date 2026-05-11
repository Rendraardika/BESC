import './Navbar.css';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar" id="navbar">
      <div className="nav-logo">
        B<span>E</span>SC
      </div>
      <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li><a href="#tentang" onClick={closeMenu}>Tentang</a></li>
        <li><a href="#jadwal" onClick={closeMenu}>Jadwal</a></li>
        <li><a href="#materi" onClick={closeMenu}>Materi</a></li>
        <li><a href="#faq" onClick={closeMenu}>FAQ</a></li>
      </ul>

      {/* Hamburger button for mobile */}
      <button
        className={`nav-hamburger ${isOpen ? 'active' : ''}`}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <a href="#daftar" className="nav-cta">
        Daftar Sekarang
      </a>
    </nav>
  );
}
