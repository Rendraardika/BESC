import { FileText, Mail, MessageCircle, Phone } from 'lucide-react';
import bescLogo from '../assets/images/logo BESC biru tua FIX.png';

const iconClass = 'h-4 w-4 stroke-[2] text-[#1c79c6]';

function InstagramLogo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function WhatsAppLogo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5.3 18.7 6.5 15.4a7.4 7.4 0 1 1 2.2 2.1l-3.4 1.2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.4 8.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.4.5c.6 1 1.3 1.7 2.4 2.2l.5-.5c.2-.2.5-.3.8-.1l1.5.8c.3.2.4.4.4.7v.5c0 .3-.1.5-.4.7-.5.3-1.1.5-1.8.4-3-.4-5.3-2.5-6.1-5.4-.2-.7-.1-1.4.2-2.1Z" fill="currentColor" />
    </svg>
  );
}

function YouTubeLogo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M21 12s0-3.2-.4-4.6c-.2-.8-.8-1.4-1.6-1.6C17.6 5.4 12 5.4 12 5.4s-5.6 0-7 .4c-.8.2-1.4.8-1.6 1.6C3 8.8 3 12 3 12s0 3.2.4 4.6c.2.8.8 1.4 1.6 1.6 1.4.4 7 .4 7 .4s5.6 0 7-.4c.8-.2 1.4-.8 1.6-1.6.4-1.4.4-4.6.4-4.6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m10.3 9.2 4.4 2.8-4.4 2.8V9.2Z" fill="currentColor" />
    </svg>
  );
}

function LinkedInLogo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.9 8.8H3.7v10.5h3.2V8.8ZM5.3 7.4a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8ZM20.3 13.5c0-3.1-1.7-4.9-4.2-4.9-1.8 0-2.7 1-3.1 1.7V8.8H9.8v10.5H13v-5.6c0-1.5.8-2.4 2-2.4s2 .8 2 2.5v5.5h3.3v-5.8Z" />
    </svg>
  );
}

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/besc_unair?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==', Logo: InstagramLogo },
  { label: 'WhatsApp', href: '#home', Logo: WhatsAppLogo },
  { label: 'YouTube', href: '#home', Logo: YouTubeLogo },
  { label: 'LinkedIn', href: '#home', Logo: LinkedInLogo },
];

const footerColumns = [
  ['Kompetisi', ['Olimpiade Biologi', 'Latihan Soal', 'Jadwal Event']],
  ['Informasi', ['Tentang BESC', 'FAQ', 'Kerja Sama']],
  ['Customer Service', [
    { text: '+62 813-3532-3519', Icon: Phone },
    { text: 'info@besc.id', Icon: Mail },
    { text: 'Live Chat', Icon: MessageCircle },
    { text: 'Syarat & Ketentuan', Icon: FileText },
  ]],
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 px-6 py-16 text-slate-400 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-slate-800 pb-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <img src={bescLogo} alt="BESC" className="mb-3 h-12 w-auto object-contain brightness-0 invert" />
            <div className="flex gap-3">
              {socialLinks.map(({ label, href, Logo }) => (
                <a key={label} href={href} aria-label={label} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:border-[#1c79c6] hover:bg-[#1c79c6] hover:text-white">
                  <Logo className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>
          {footerColumns.map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-200">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => {
                  const text = typeof link === 'string' ? link : link.text;
                  const Icon = typeof link === 'string' ? null : link.Icon;
                  return (
                    <li key={text}>
                      <a href="#home" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1c79c6]">
                        {Icon && <Icon className={iconClass} />}
                        {text}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col justify-between gap-3 text-xs text-slate-600 md:flex-row">
          <span>© 2026 BESC · Biology Environmental Smart Competition. All rights reserved.</span>
          <span className="inline-flex items-center gap-1.5">Made with <img src={bescLogo} alt="" className="h-3.5 w-auto object-contain opacity-60" /> for Indonesia</span>
        </div>
      </div>
    </footer>
  );
}
