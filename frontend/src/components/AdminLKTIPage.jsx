import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { API_URL, apiRequest } from '../lib/api.js';

const statusLabels = {
  abstract_submitted: 'Menunggu Penilaian',
  abstract_passed: 'Lolos Abstrak',
  abstract_rejected: 'Tidak Lolos',
  full_paper_submitted: 'Full Paper Terkirim',
};

export default function AdminLKTIPage({ items, onReload }) {
  const [tab, setTab] = useState('abstract');
  const [query, setQuery] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const filtered = useMemo(() => items.filter((item) => {
    if (tab === 'paper' && item.status !== 'full_paper_submitted') return false;
    if (tab === 'abstract' && item.status === 'full_paper_submitted') return false;
    const haystack = `${item.team_name} ${item.leader_name} ${item.institution} ${item.abstract_title}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  }), [items, query, tab]);

  const updateStatus = async () => {
    setUpdating(true); setError('');
    try {
      await apiRequest(`/admin/lkti-submissions/${confirmation.item.id}/status`, { method: 'PUT', body: JSON.stringify({ status: confirmation.status }) });
      setConfirmation(null);
      await onReload();
    } catch (err) { setError(err.message); } finally { setUpdating(false); }
  };

  const openDocument = (id) => window.open(`${API_URL}/admin/documents/${id}/view`, '_blank', 'noopener,noreferrer');

  return <div className="border border-slate-200 bg-white">
    <div className="flex flex-col gap-4 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between">
      <div><h2 className="text-xl font-extrabold text-slate-900">Karya LKTI</h2><p className="mt-1 text-sm text-slate-500">Seleksi abstrak dan pengumpulan full paper.</p></div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari tim, ketua, sekolah, judul..." className="h-11 w-full border border-slate-300 px-4 text-sm lg:w-80" />
    </div>
    <div className="flex gap-2 border-b border-slate-200 p-4">
      <button onClick={() => setTab('abstract')} className={`px-4 py-2 text-xs font-extrabold ${tab === 'abstract' ? 'bg-[#073b4c] text-white' : 'bg-slate-100 text-slate-600'}`}>Seleksi Abstrak ({items.filter((x) => x.status !== 'full_paper_submitted').length})</button>
      <button onClick={() => setTab('paper')} className={`px-4 py-2 text-xs font-extrabold ${tab === 'paper' ? 'bg-[#073b4c] text-white' : 'bg-slate-100 text-slate-600'}`}>Full Paper ({items.filter((x) => x.status === 'full_paper_submitted').length})</button>
    </div>
    {error && <div className="m-4 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}
    <div className="overflow-x-auto"><table className="min-w-[1050px] w-full text-left text-sm">
      <thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="p-4">Tim</th><th className="p-4">Sekolah</th><th className="p-4">Karya</th><th className="p-4">Pembayaran</th><th className="p-4">Status</th><th className="p-4">Berkas</th><th className="p-4">Aksi</th></tr></thead>
      <tbody>{filtered.map((item) => <tr key={item.id} className="border-t border-slate-100 align-top">
        <td className="p-4"><div className="font-extrabold text-slate-800">{item.team_name || '-'}</div><div className="mt-1 text-xs text-slate-500">{item.leader_name}<br />{item.participant_email}</div></td>
        <td className="p-4">{item.institution || '-'}</td>
        <td className="max-w-xs p-4"><div className="font-bold">{tab === 'paper' ? item.work_title : item.abstract_title}</div><div className="mt-1 text-xs text-slate-500">{item.subtheme}{item.work_type ? ` · ${item.work_type}` : ''}</div></td>
        <td className="p-4"><span className={`px-2 py-1 text-[11px] font-extrabold ${item.payment_status === 'verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.payment_status}</span></td>
        <td className="p-4"><span className="bg-slate-100 px-2 py-1 text-[11px] font-extrabold text-slate-700">{statusLabels[item.status]}</span></td>
        <td className="p-4"><button onClick={() => openDocument(tab === 'paper' ? item.full_paper_document_id : item.abstract_document_id)} disabled={!(tab === 'paper' ? item.full_paper_document_id : item.abstract_document_id)} className="bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700 disabled:opacity-40">Lihat PDF</button></td>
        <td className="p-4">{tab === 'abstract' && <div className="flex gap-2"><button onClick={() => setConfirmation({ item, status: 'abstract_passed' })} className="bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700">Loloskan</button><button onClick={() => setConfirmation({ item, status: 'abstract_rejected' })} className="bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700">Tidak Lolos</button></div>}</td>
      </tr>)}</tbody>
    </table></div>
    {filtered.length === 0 && <div className="p-12 text-center text-sm font-bold text-slate-400">Belum ada data untuk ditampilkan.</div>}
    {confirmation && createPortal(<div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget && !updating) setConfirmation(null); }}>
      <div className="w-full max-w-md bg-white shadow-2xl"><div className={`p-6 ${confirmation.status === 'abstract_passed' ? 'bg-emerald-50' : 'bg-red-50'}`}><p className="text-xs font-extrabold uppercase text-slate-500">Konfirmasi Seleksi Abstrak</p><h3 className="mt-1 text-xl font-extrabold text-slate-900">{confirmation.status === 'abstract_passed' ? 'Loloskan ke Full Paper?' : 'Nyatakan Tidak Lolos?'}</h3></div><div className="p-6"><div className="bg-slate-50 p-4"><strong>{confirmation.item.team_name}</strong><div className="mt-1 text-sm text-slate-500">{confirmation.item.abstract_title}</div></div><p className="mt-4 text-sm leading-6 text-slate-600">Keputusan akan tersimpan dan pemberitahuan dikirim ke email peserta.</p></div><div className="flex justify-end gap-3 border-t border-slate-200 p-4"><button disabled={updating} onClick={() => setConfirmation(null)} className="border border-slate-300 px-4 py-2 text-sm font-bold">Batal</button><button disabled={updating} onClick={updateStatus} className={`px-4 py-2 text-sm font-extrabold text-white ${confirmation.status === 'abstract_passed' ? 'bg-emerald-600' : 'bg-red-600'}`}>{updating ? 'Menyimpan...' : 'Ya, Simpan'}</button></div></div>
    </div>, document.body)}
  </div>;
}
