import { Award, BadgeCheck, Microscope, Trophy, UsersRound } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';

const iconClass = 'h-6 w-6 stroke-[2]';

export default function WhyBesc() {
  return (
    <section id="tentang" className="px-6 py-20 md:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div>
          <SectionHeader label={<span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 stroke-[2]" />Keunggulan</span>} title="Mengapa Harus BESC?" sub="Dapatkan berbagai macam benefit eksklusif dari program kompetisi biologi terbaik Indonesia." />
          <div className="space-y-5">
            {[
              [Microscope, 'Soal Berkualitas Tinggi', 'Soal disusun oleh tim ahli biologi dari perguruan tinggi terkemuka di Indonesia.'],
              [Trophy, 'Total Hadiah Rp 19 Juta', 'Penghargaan diberikan kepada pemenang kompetisi.'],
              [Award, 'Sertifikat Resmi Bersertifikasi', 'Sertifikat keikutsertaan dan penghargaan.'],
              [UsersRound, 'Komunitas Ilmuwan Muda', 'Bergabung dengan ribuan pelajar berprestasi se-Indonesia dalam ekosistem belajar yang positif.'],
            ].map(([Icon, title, desc]) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 p-5 transition hover:translate-x-1 hover:border-[#1c79c6] hover:bg-blue-50">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-[#1c79c6]"><Icon className={iconClass} /></div>
                <div>
                  <h3 className="mb-1 font-['Plus_Jakarta_Sans'] font-extrabold text-slate-950">{title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden rounded-[1.5rem] bg-[linear-gradient(180deg,#1c79c6,#044b86)] p-12 lg:block">
          {[
            ['1570', 'Peserta telah bergabung dari seluruh Indonesia'],
            ['34', 'Provinsi terwakili dalam kompetisi BESC'],
            ['Rp 19 juta', 'Total hadiah yang telah dibagikan kepada pemenang'],
          ].map(([num, label]) => (
            <div key={num} className="mb-6 rounded-2xl border border-white/15 bg-white/10 p-6 text-white last:mb-0">
              <div className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold text-blue-200">{num}</div>
              <div className="mt-2 text-sm text-blue-100">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
