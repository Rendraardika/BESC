import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { API_URL, apiRequest } from '../lib/api.js';

const tabs = {
  abstract: { label: 'Seleksi Abstrak', statuses: ['abstract_submitted', 'abstract_passed', 'abstract_rejected'], pending: 'abstract_submitted', document: 'abstract_document_id', title: 'abstract_title', pass: 'abstract_passed', reject: 'abstract_rejected', passText: 'Loloskan ke Full Paper' },
  paper: { label: 'Full Paper', statuses: ['full_paper_submitted', 'full_paper_passed', 'full_paper_rejected'], pending: 'full_paper_submitted', document: 'full_paper_document_id', title: 'work_title', pass: 'full_paper_passed', reject: 'full_paper_rejected', passText: 'Loloskan ke Poster' },
  poster: { label: 'Poster & Presentasi', statuses: ['poster_uploaded', 'presentation_pptx_submitted', 'poster_submitted', 'poster_passed', 'poster_rejected', 'presentation_submitted'], pending: 'poster_submitted', document: 'poster_document_id', title: 'work_title', pass: 'poster_passed', reject: 'poster_rejected', passText: 'Loloskan Tahap Akhir' },
};
const statusLabels = { abstract_submitted: 'Menunggu Penilaian Abstrak', abstract_passed: 'Lolos Abstrak', abstract_rejected: 'Tidak Lolos Abstrak', full_paper_submitted: 'Full Paper Terkirim', full_paper_passed: 'Lolos Full Paper', full_paper_rejected: 'Tidak Lolos Full Paper', poster_uploaded: 'Poster Terkirim - Menunggu Materi Presentasi', presentation_pptx_submitted: 'Materi Utama Terkirim', poster_submitted: 'Poster dan Presentasi Terkirim', poster_passed: 'Lolos Tahap Akhir', poster_rejected: 'Tidak Lolos Tahap Akhir', presentation_submitted: 'Materi Presentasi Terkirim' };

export default function AdminLKTIPage({ items, onReload }) {
  const [tab, setTab] = useState('abstract'); const [query, setQuery] = useState(''); const [page, setPage] = useState(1); const [confirmation, setConfirmation] = useState(null); const [updating, setUpdating] = useState(false); const [error, setError] = useState('');
  const config = tabs[tab];
  const filtered = useMemo(() => items.filter((item) => config.statuses.includes(item.status) && `${item.team_name} ${item.leader_name} ${item.institution} ${item.abstract_title} ${item.work_title}`.toLowerCase().includes(query.toLowerCase())), [items, query, config]);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startItem = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(safePage * pageSize, filtered.length);
  const openDocument = (id) => id && window.open(`${API_URL}/admin/documents/${id}/view`, '_blank', 'noopener,noreferrer');
  const downloadDocument = async (id, name) => {
    if (!id) return;
    try {
      const response = await fetch(`${API_URL}/admin/documents/${id}/view`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unduhan dokumen gagal.');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = name || 'dokumen';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.message);
    }
  };
  const updateStatus = async () => { setUpdating(true); setError(''); try { await apiRequest(`/admin/lkti-submissions/${confirmation.item.id}/status`, { method: 'PUT', body: JSON.stringify({ status: confirmation.status }) }); setConfirmation(null); await onReload(); } catch (err) { setError(err.message); } finally { setUpdating(false); } };
  return <div className="border border-slate-200 bg-white"><div className="flex flex-col gap-4 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-xl font-extrabold text-slate-900">Karya LKTI</h2><p className="mt-1 text-sm text-slate-500">Seleksi abstrak, full paper, poster, dan materi presentasi.</p></div><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Cari tim, ketua, sekolah, judul..." className="h-11 w-full border border-slate-300 px-4 text-sm lg:w-80" /></div>
    <div className="flex flex-wrap gap-2 border-b border-slate-200 p-4">{Object.entries(tabs).map(([key, value]) => <button key={key} onClick={() => { setTab(key); setPage(1); }} className={`px-4 py-2 text-xs font-extrabold ${tab === key ? 'bg-[#073b4c] text-white' : 'bg-slate-100 text-slate-600'}`}>{value.label} ({items.filter((item) => value.statuses.includes(item.status)).length})</button>)}</div>
    {error && <div className="m-4 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}<div className="overflow-x-auto"><table className="min-w-[1100px] w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="w-14 p-4">No.</th><th className="p-4">Tim</th><th className="p-4">Sekolah</th><th className="p-4">Karya</th><th className="p-4">Pembayaran</th><th className="p-4">Status</th><th className="p-4">Berkas</th><th className="p-4">Aksi</th></tr></thead><tbody>{visible.map((item, index) => <tr key={item.id} className="border-t border-slate-100 align-top"><td className="p-4 font-bold text-slate-500">{(safePage - 1) * pageSize + index + 1}</td><td className="p-4"><div className="font-extrabold text-slate-800">{item.team_name || '-'}</div><div className="mt-1 text-xs text-slate-500">{item.leader_name}<br />{item.participant_email}</div></td><td className="p-4">{item.institution || '-'}</td><td className="max-w-xs p-4"><div className="font-bold">{item[config.title] || item.abstract_title}</div><div className="mt-1 text-xs text-slate-500">{item.subtheme}{item.work_type ? ` - ${item.work_type}` : ''}</div></td><td className="p-4"><span className={`px-2 py-1 text-[11px] font-extrabold ${item.payment_status === 'verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.payment_status}</span></td><td className="p-4"><span className="bg-slate-100 px-2 py-1 text-[11px] font-extrabold text-slate-700">{statusLabels[item.status]}</span></td><td className="p-4"><Documents item={item} tab={tab} openDocument={openDocument} downloadDocument={downloadDocument} /></td><td className="p-4">{item.status === config.pending && <div className="flex gap-2"><button onClick={() => setConfirmation({ item, status: config.pass, action: config.passText })} className="bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700">Loloskan</button><button onClick={() => setConfirmation({ item, status: config.reject, action: 'Nyatakan Tidak Lolos' })} className="bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700">Tidak Lolos</button></div>}</td></tr>)}</tbody></table></div>
    {filtered.length === 0 && <div className="p-12 text-center text-sm font-bold text-slate-400">Belum ada data untuk ditampilkan.</div>}<div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Menampilkan {startItem}-{endItem} dari {filtered.length} data</span><div className="flex items-center gap-2"><button type="button" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40">Sebelumnya</button><span className="grid h-9 min-w-16 place-items-center bg-slate-50 px-3 font-bold text-[#17324d]">{safePage}/{pageCount}</span><button type="button" disabled={safePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40">Berikutnya</button></div></div>{confirmation && createPortal(<div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget && !updating) setConfirmation(null); }}><div className="w-full max-w-md bg-white shadow-2xl"><div className={`p-6 ${confirmation.status.includes('passed') ? 'bg-emerald-50' : 'bg-red-50'}`}><p className="text-xs font-extrabold uppercase text-slate-500">Konfirmasi Penilaian LKTI</p><h3 className="mt-1 text-xl font-extrabold text-slate-900">{confirmation.action}?</h3></div><div className="p-6"><div className="bg-slate-50 p-4"><strong>{confirmation.item.team_name}</strong><div className="mt-1 text-sm text-slate-500">{confirmation.item.work_title || confirmation.item.abstract_title}</div></div><p className="mt-4 text-sm leading-6 text-slate-600">Keputusan akan tersimpan dan pemberitahuan dikirim ke email peserta.</p></div><div className="flex justify-end gap-3 border-t border-slate-200 p-4"><button disabled={updating} onClick={() => setConfirmation(null)} className="border border-slate-300 px-4 py-2 text-sm font-bold">Batal</button><button disabled={updating} onClick={updateStatus} className={`px-4 py-2 text-sm font-extrabold text-white ${confirmation.status.includes('passed') ? 'bg-emerald-600' : 'bg-red-600'}`}>{updating ? 'Menyimpan...' : 'Ya, Simpan'}</button></div></div></div>, document.body)}</div>;
}

function Documents({ item, tab, openDocument, downloadDocument }) {
  const docs = tab === 'poster'
      ? [
        ['Poster', item.poster_document_id, item.poster_original_name, item.poster_uploaded_at],
        ['Materi Utama', item.presentation_pptx_document_id, item.presentation_pptx_original_name, item.presentation_pptx_uploaded_at],
        ['PDF Cadangan', item.presentation_pdf_document_id, item.presentation_pdf_original_name, item.presentation_pdf_uploaded_at],
      ]
    : [[tab === 'paper' ? 'Full Paper' : 'Abstrak', item[tabs[tab].document], tab === 'paper' ? item.full_paper_original_name : item.abstract_original_name, tab === 'paper' ? item.full_paper_submitted_at : item.abstract_submitted_at]];
  return <div className="flex flex-wrap gap-3">{docs.map(([label, id, name, uploadedAt]) => <div key={label} className="min-w-24"><div className="inline-flex overflow-hidden border border-blue-100 text-xs font-extrabold"><button disabled={!id} onClick={() => openDocument(id)} className="bg-blue-50 px-2 py-2 text-blue-700 disabled:opacity-40" title={`Lihat ${label}`}>{label}</button><button disabled={!id} onClick={() => downloadDocument(id, name)} className="border-l border-blue-100 bg-white px-2 py-2 text-blue-700 disabled:opacity-40" title={`Unduh ${label}`}>Unduh</button></div>{tab === 'poster' && <div className="mt-1 text-[10px] text-slate-500">{uploadedAt ? `Unggah ${uploadedAt}` : id ? 'Waktu tidak tersedia' : 'Belum diunggah'}</div>}</div>)}</div>;
}
