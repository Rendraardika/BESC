import { useState } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './FAQ.css';

const faqData = [
  {
    q: 'Siapa saja yang bisa mendaftar BESC?',
    a: 'BESC terbuka untuk siswa SMA/MA/SMK sederajat dari seluruh Indonesia, baik negeri maupun swasta. Setiap sekolah dapat mengirimkan maksimal 3 peserta.',
  },
  {
    q: 'Berapa biaya pendaftaran?',
    a: 'Biaya pendaftaran sebesar Rp 150.000 per peserta yang mencakup akses seluruh tahapan kompetisi, modul latihan, dan sertifikat keikutsertaan.',
  },
  {
    q: 'Apakah tersedia bimbingan belajar sebelum kompetisi?',
    a: 'Ya, panitia menyediakan webinar persiapan dan modul materi digital yang dapat diunduh gratis setelah pendaftaran dikonfirmasi.',
  },
  {
    q: 'Apa hadiah untuk para pemenang?',
    a: 'Juara 1 mendapatkan beasiswa senilai Rp 20 juta + trofi + medali emas. Juara 2 Rp 15 juta, Juara 3 Rp 10 juta, serta penghargaan harapan untuk peringkat 4–10.',
  },
  {
    q: 'Apakah grand final dilaksanakan secara online atau offline?',
    a: 'Grand final dilaksanakan secara offline di kota yang akan diumumkan kemudian. Panitia menyediakan akomodasi dan transportasi untuk finalis dari luar kota.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const headerRef = useScrollReveal();
  const listRef = useScrollReveal();

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section" id="faq">
      <div className="faq-container">
        <div className="faq-header reveal" ref={headerRef}>
          <div className="section-tag centered">FAQ</div>
          <h2 className="section-title">
            Pertanyaan yang <strong>Sering Diajukan</strong>
          </h2>
        </div>

        <div className="faq-list reveal" ref={listRef}>
          {faqData.map((item, i) => (
            <div
              className={`faq-item ${openIndex === i ? 'open' : ''}`}
              key={i}
            >
              <div className="faq-q" onClick={() => handleToggle(i)}>
                {item.q}
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
