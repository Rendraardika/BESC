import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar" id="navbar">
      <div className="nav-logo">
        B<span>E</span>SC
      </div>
      <ul className="nav-links">
        <li><a href="#tentang">Tentang</a></li>
        <li><a href="#jadwal">Jadwal</a></li>
        <li><a href="#materi">Materi</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ul>

      {/* Hamburger button for mobile */}
      <button
        className="nav-hamburger"
        aria-label="Toggle menu"
        onClick={() => {
          document.querySelector('.nav-links').classList.toggle('open');
          document.querySelector('.nav-hamburger').classList.toggle('active');
        }}
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
