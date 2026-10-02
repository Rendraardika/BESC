import { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { apiRequest } from '../lib/api.js';

const subthemes = ['Bioenergy Genetics', 'Molecular Bioremediation', 'Microbial Bioenergy', 'Metabolic Engineering', 'Sustainable Biotechnology'];

const statusInfo = {
  abstract_submitted: ['Abstrak Sedang Dinilai', 'Panitia sedang menilai abstrak yang sudah dikirim.', 'bg-amber-50 text-amber-800'],
  abstract_passed: ['Lolos Seleksi Abstrak', 'Tim kamu dapat melanjutkan ke pengumpulan full paper.', 'bg-emerald-50 text-emerald-800'],
  abstract_rejected: ['Tidak Lolos Seleksi Abstrak', 'Terima kasih sudah mengikuti seleksi abstrak LKTI BESC.', 'bg-rose-50 text-rose-800'],
  full_paper_submitted: ['Full Paper Terkirim', 'Berkas final sudah diterima panitia.', 'bg-blue-50 text-blue-800'],
};

const paymentInfo = {
  pending: ['Menunggu Verifikasi Pembayaran', 'Panitia sedang memeriksa bukti pembayaran tim kamu.', 'bg-amber-50 text-amber-800'],
  rejected: ['Pembayaran Ditolak', 'Silakan unggah ulang bukti pembayaran melalui kartu kompetisi LKTI.', 'bg-rose-50 text-rose-800'],
};

export default function LktiSubmissionPage({ user, onHome, onLogin, onLogout, onOlimpiade, onProfile, onRegister }) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ workTitle: '', subtheme: '', workType: '', file: null, confirmed: false });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/me/lkti-submission');
      setSubmission(data);
      if (data) setForm((current) => ({ ...current, workTitle: data.work_title || data.abstract_title || '', subtheme: data.subtheme || '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submitFullPaper = async (event) => {
    event.preventDefault();
    setError(''); setSuccess('');
    if (!form.file || form.file.type !== 'application/pdf' || form.file.size > 10 * 1024 * 1024) {
      setError('Pilih file PDF dengan ukuran maksimal 10 MB.'); return;
    }
    if (!form.confirmed) { setError('Pernyataan konfirmasi wajib disetujui.'); return; }
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append('work_title', form.workTitle);
      body.append('subtheme', form.subtheme);
      body.append('work_type', form.workType);
      body.append('confirmed', 'true');
      body.append('full_paper', form.file, form.file.name);
      await apiRequest(`/lkti-submissions/${submission.id}/full-paper`, { method: 'POST', body, timeoutMs: 60000, retries: 1 });
      setSuccess('Full paper berhasil dikirim.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const info = paymentInfo[submission?.payment_status] || statusInfo[submission?.status] || statusInfo.abstract_submitted;
  return <>
    <Header onLogin={onLogin} onLogout={onLogout} onOlimpiade={onOlimpiade} onProfile={onProfile} onRegister={onRegister} user={user} />
    <main className="min-h-[70vh] bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={onHome} className="mb-5 text-sm font-bold text-[#126bad]">Kembali ke beranda</button>
        <div className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-extrabold uppercase text-teal-700">LKTI BESC 2026</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Status Karya Tim</h1>
          {loading && <p className="mt-8 text-slate-500">Memuat data karya...</p>}
          {!loading && !submission && <div className="mt-6 bg-slate-50 p-5 text-sm text-slate-600">Belum ada pengajuan abstrak LKTI pada akun ini.</div>}
          {!loading && submission && <>
            <div className={`mt-6 p-5 ${info[2]}`}><div className="font-extrabold">{info[0]}</div><p className="mt-1 text-sm">{info[1]}</p></div>
            <div className="mt-6 grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-3">
              <div><div className="text-xs font-bold text-slate-400">Nama Tim</div><div className="mt-1 font-bold">{submission.team_name || '-'}</div></div>
              <div><div className="text-xs font-bold text-slate-400">Ketua Tim</div><div className="mt-1 font-bold">{submission.leader_name}</div></div>
              <div><div className="text-xs font-bold text-slate-400">Asal Sekolah</div><div className="mt-1 font-bold">{submission.institution || '-'}</div></div>
              <div className="sm:col-span-2"><div className="text-xs font-bold text-slate-400">Judul Abstrak</div><div className="mt-1 font-bold">{submission.abstract_title}</div></div>
              <div><div className="text-xs font-bold text-slate-400">Subtema</div><div className="mt-1 font-bold">{submission.subtheme}</div></div>
            </div>
            {submission.status === 'abstract_passed' && <form onSubmit={submitFullPaper} className="mt-7 space-y-5">
              <div><h2 className="text-lg font-extrabold text-slate-900">Data Karya Final</h2><p className="text-sm text-slate-500">Lengkapi dan kirim full paper final tim.</p></div>
              <label className="block text-sm font-bold text-slate-700">Judul KTI<input required value={form.workTitle} onChange={(e) => setForm({ ...form, workTitle: e.target.value })} className="mt-2 h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-bold text-slate-700">Subtema<select required value={form.subtheme} onChange={(e) => setForm({ ...form, subtheme: e.target.value })} className="mt-2 h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="">Pilih subtema</option>{subthemes.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="block text-sm font-bold text-slate-700">Jenis Karya<select required value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value })} className="mt-2 h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="">Pilih jenis karya</option><option>Original Article</option><option>Review Article</option></select></label>
              </div>
              <label className="block text-sm font-bold text-slate-700">Unggah Full Paper (.pdf)<input required accept="application/pdf,.pdf" type="file" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} className="mt-2 block w-full border border-slate-300 bg-white p-2 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-400">Maksimal 10 MB.</span></label>
              <label className="flex items-start gap-3 bg-slate-50 p-4 text-sm leading-6 text-slate-600"><input type="checkbox" checked={form.confirmed} onChange={(e) => setForm({ ...form, confirmed: e.target.checked })} className="mt-1 h-4 w-4" /><span>Saya menyatakan bahwa naskah yang diunggah merupakan berkas final, telah diperiksa kelengkapannya, dan telah sesuai dengan seluruh ketentuan LKTI BESC 2026. Saya memahami bahwa kesalahan atau ketidaklengkapan berkas yang dikumpulkan menjadi tanggung jawab peserta.</span></label>
              <button disabled={submitting} className="h-11 bg-[#087f73] px-6 text-sm font-extrabold text-white disabled:opacity-50">{submitting ? 'Mengirim...' : 'Kirim Full Paper'}</button>
            </form>}
            {submission.status === 'full_paper_submitted' && <div className="mt-6 text-sm text-slate-600"><strong>{submission.work_title}</strong><br />{submission.work_type} · {submission.full_paper_original_name}</div>}
          </>}
          {error && <div className="mt-5 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}
          {success && <div className="mt-5 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{success}</div>}
        </div>
      </div>
    </main>
    <Footer />
  </>;
}
