import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-logo">
          B<span>E</span>SC
        </div>
        <div className="footer-copy">
          © 2026 BESC · Biology Environmental Smart Competition
        </div>
        <ul className="footer-links">
          <li><a href="#">Instagram</a></li>
          <li><a href="#">WhatsApp</a></li>
          <li><a href="#">Email</a></li>
        </ul>
      </div>
    </footer>
  );
}
