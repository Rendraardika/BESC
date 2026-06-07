import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api.js';

const rules = [
  'Pastikan koneksi internet stabil sebelum memulai.',
  'Jangan refresh atau menutup halaman selama ujian.',
  'Kerjakan seluruh soal secara mandiri.',
  'Jawaban akan dinilai otomatis oleh sistem.',
  'Waktu ujian berjalan setelah tombol mulai ditekan.',
];

export default function ExamRulesPage({ competition, onBack, onStart }) {
  const [agreed, setAgreed] = useState(false);
  const [summary, setSummary] = useState({ questions: 0, points: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/competitions/${competition.competition_id}/exam/questions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('besc_token')}` },
    }).then((questions) => setSummary({
      questions: questions.length,
      points: questions.reduce((total, item) => total + Number(item.score || 0), 0),
    })).catch((err) => setError(err.message));
  }, [competition.competition_id]);

  const stats = [
    ['Soal', summary.questions || '-', 'Jumlah soal ujian'],
    ['Durasi', '60 menit', 'Waktu pengerjaan'],
    ['Total Poin', summary.points || '-', 'Nilai maksimal'],
  ];

  return (
    <main className="min-h-screen bg-[#f3f8f7] px-5 py-8 md:py-12">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
        <header className="relative overflow-hidden bg-[#073b4c] px-6 py-8 text-white md:px-9 md:py-10">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[#0d9488] opacity-50"></div>
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider">Online Competition</span>
                <span className="rounded-full bg-emerald-300 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-950">Akses Terbuka</span>
              </div>
              <h1 className="mt-5 max-w-2xl font-['Plus_Jakarta_Sans'] text-3xl font-extrabold leading-tight md:text-4xl">{competition.competition_title || 'Kompetisi BESC'}</h1>
              <p className="mt-3 text-sm text-teal-50/80">Baca ketentuan berikut sebelum memulai sesi ujian.</p>
            </div>
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-5xl shadow-xl">🏆</div>
          </div>
        </header>

        <div className="p-6 md:p-9">
          {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map(([label, value, note]) => (
              <article key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600">{label}</div>
                <div className="mt-2 text-2xl font-extrabold text-[#17324d]">{value}</div>
                <div className="mt-1 text-xs font-semibold text-slate-400">{note}</div>
              </article>
            ))}
          </div>

          <section className="mt-7 rounded-lg border border-slate-200 p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-xl">🛡️</div>
              <div>
                <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-[#17324d]">Sebelum Memulai</h2>
                <p className="mt-1 text-xs text-slate-500">Pastikan kamu memahami seluruh ketentuan ujian.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {rules.map((rule) => (
                <div key={rule} className="flex items-start gap-3 rounded-lg bg-[#f3f8f7] p-4 text-sm font-semibold leading-6 text-slate-600">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">✓</span>
                  {rule}
                </div>
              ))}
            </div>
          </section>

          <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
            <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
            Saya telah membaca, memahami, dan menyetujui seluruh ketentuan kompetisi BESC.
          </label>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onBack} className="h-12 rounded-lg border border-slate-200 bg-white px-6 text-sm font-extrabold text-slate-600 hover:bg-slate-50">Kembali</button>
            <button type="button" disabled={!agreed || Boolean(error)} onClick={onStart} className="h-12 rounded-lg bg-[#0d9488] px-8 text-sm font-extrabold text-white shadow-lg shadow-teal-900/15 transition hover:bg-[#087f75] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">Mulai Kerjakan Soal</button>
          </div>
        </div>
      </section>
    </main>
  );
}
