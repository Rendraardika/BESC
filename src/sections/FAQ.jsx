import { useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import { faqs } from '../data/faqs.js';

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader center label="❓ FAQ" title="Pertanyaan yang Sering Diajukan" />
        <div className="mx-auto mt-8 max-w-3xl">
          {faqs.map(([q, a], index) => (
            <button key={q} type="button" onClick={() => setOpen(open === index ? null : index)} className="w-full border-b border-slate-200 py-5 text-left">
              <span className="flex items-center justify-between gap-5 font-semibold text-slate-950">
                {q}
                <span className={`text-2xl text-[#1c79c6] transition ${open === index ? 'rotate-45' : ''}`}>+</span>
              </span>
              {open === index && <span className="mt-3 block text-sm leading-7 text-slate-500">{a}</span>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
