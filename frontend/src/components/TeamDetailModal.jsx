import { useState, useEffect } from 'react';
import { API_URL, apiRequest } from '../lib/api.js';

export default function TeamDetailModal({ team, onClose }) {
  const t = team || {};
  const [docs, setDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(!!t.user_id);
  const [docsError, setDocsError] = useState(false);

  const loadDocs = function() {
    if (!t.user_id) { setLoadingDocs(false); return; }
    setLoadingDocs(true);
    setDocsError(false);
    apiRequest('/admin/teams/' + t.user_id + '/documents')
      .then(function(d) { setDocs(d || []); })
      .catch(function() { setDocsError(true); })
      .finally(function() { setLoadingDocs(false); });
  };

  useEffect(function() { loadDocs(); }, [t.user_id]);

  const Row = function({ label, value }) {
    return (
      <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-2 sm:p-2.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
        <div className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900 break-words">{value || '-'}</div>
      </div>
    );
  };

  const Section = function({ title, children }) {
    return (
      <div className="mb-3.5 last:mb-0">
        <h3 className="mb-2 border-b border-slate-100 pb-1 text-xs font-extrabold uppercase tracking-wide text-teal-700">
          {title}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {children}
        </div>
      </div>
    );
  };

  const downloadDoc = async (doc, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(API_URL + '/docs/view/' + doc.id, { credentials: 'include' });
      if (!res.ok) throw new Error('Gagal mengunduh berkas');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.original_name || `${(doc.doc_type || 'dokumen').replace(/[^a-z0-9_-]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(API_URL + '/docs/view/' + doc.id, '_blank');
    }
  };

  const renderDocCard = (doc, prefix = '') => {
    const label = (prefix ? doc.doc_type?.replace(prefix + '_', '') : doc.doc_type || 'Dokumen')?.replace(/([A-Z])/g, ' $1').trim();
    const isPdf = doc.original_name && doc.original_name.toLowerCase().endsWith('.pdf');
    return (
      <div
        key={doc.id}
        className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-center transition hover:border-teal-500 hover:shadow-sm"
      >
        <div>
          <span className="text-2xl">{isPdf ? '📄' : '🖼️'}</span>
          <div className="mt-1 text-[11px] font-bold text-slate-800 line-clamp-1" title={doc.original_name || label}>
            {label}
          </div>
          {doc.original_name && (
            <div className="text-[9px] text-slate-400 line-clamp-1" title={doc.original_name}>
              {doc.original_name}
            </div>
          )}
        </div>
        <div className="mt-2.5 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-2">
          <a
            href={API_URL + '/docs/view/' + doc.id}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700 hover:bg-teal-100 transition"
          >
            Buka ↗
          </a>
          <button
            type="button"
            onClick={(e) => downloadDoc(doc, e)}
            className="flex-1 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200 transition"
            title="Unduh file ke perangkat"
          >
            Unduh 📥
          </button>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative my-4 sm:my-6 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal - Sticky Top */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/90 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800 text-xs font-bold">
              👥
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                {t.name || 'Detail Tim'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">{t.institution || t.category || 'Data Pendaftaran Peserta'}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200/70 text-slate-600 hover:bg-slate-300 hover:text-slate-900 transition text-sm font-bold"
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <Section title="Informasi Tim">
            <Row label="Nama Tim" value={t.name} />
            <Row label="Kategori" value={t.category} />
            <Row label="Status" value={t.status} />
            <Row label="Institusi / Sekolah" value={t.institution} />
            <Row label="Provinsi" value={t.province} />
            <Row label="Kota / Kab" value={t.city} />
            <div className="col-span-2 sm:col-span-3">
              <Row label="Alamat Lengkap" value={t.address} />
            </div>
          </Section>

          <Section title="Ketua Tim">
            <Row label="Nama" value={t.leader_name} />
            <Row label="Email" value={t.leader_email} />
            <Row label="WhatsApp" value={t.leader_phone} />
            <Row label="NISN" value={t.leader_nisn} />
            <Row label="Kelas" value={t.leader_kelas} />
            <Row label="Instagram" value={t.leader_ig} />
            <Row label="TikTok" value={t.leader_tiktok} />
          </Section>

          <Section title="Anggota 1">
            <Row label="Nama" value={t.member1_name} />
            <Row label="Email" value={t.member1_email} />
            <Row label="WhatsApp" value={t.member1_wa} />
            <Row label="NISN" value={t.member1_nisn} />
            <Row label="Kelas" value={t.member1_kelas} />
            <Row label="Instagram" value={t.member1_ig} />
            <Row label="TikTok" value={t.member1_tiktok} />
          </Section>

          {t.member2_name && (
            <Section title="Anggota 2">
              <Row label="Nama" value={t.member2_name} />
              <Row label="Email" value={t.member2_email} />
              <Row label="WhatsApp" value={t.member2_wa} />
              <Row label="NISN" value={t.member2_nisn} />
              <Row label="Kelas" value={t.member2_kelas} />
              <Row label="Instagram" value={t.member2_ig} />
              <Row label="TikTok" value={t.member2_tiktok} />
            </Section>
          )}

          {t.guardian_name && (
            <Section title="Guru Pendamping">
              <Row label="Nama Guru" value={t.guardian_name} />
              <Row label="WhatsApp / HP" value={t.guardian_hp} />
              <Row label="Email" value={t.guardian_email} />
            </Section>
          )}

          {t.notes && (
            <div className="mb-3.5">
              <h3 className="mb-2 border-b border-slate-100 pb-1 text-xs font-extrabold uppercase tracking-wide text-teal-700">
                Catatan / Informasi Tambahan
              </h3>
              <Row label="Keterangan" value={t.notes} />
            </div>
          )}

          {/* Dokumen Pendaftaran */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-teal-700">
              Dokumen Pendaftaran
            </h3>
            {!t.user_id ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                Dokumen tidak tersedia untuk entri ini.
              </div>
            ) : loadingDocs ? (
              <div className="text-xs text-slate-400 py-2">Memuat dokumen...</div>
            ) : docsError ? (
              <div className="text-xs text-red-600 py-2">Gagal memuat dokumen. Coba tutup dan buka lagi.</div>
            ) : docs.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {['ketua', 'anggota1', 'anggota2'].map(function(prefix) {
                  const prefixLabel = prefix === 'ketua' ? 'Ketua Tim' : prefix === 'anggota1' ? 'Anggota 1' : 'Anggota 2';
                  const groupDocs = docs.filter((d) => d.doc_type && d.doc_type.startsWith(prefix + '_'));
                  if (groupDocs.length === 0) return null;
                  return (
                    <div key={prefix} className="rounded-xl border border-slate-200 p-2.5 bg-slate-50/50">
                      <div className="mb-1.5 text-xs font-bold text-slate-700">{prefixLabel}</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {groupDocs.map((doc) => renderDocCard(doc, prefix))}
                      </div>
                    </div>
                  );
                })}
                {docs.filter((d) => !d.doc_type || (!d.doc_type.startsWith('ketua_') && !d.doc_type.startsWith('anggota1_') && !d.doc_type.startsWith('anggota2_'))).length > 0 && (
                  <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50/50">
                    <div className="mb-1.5 text-xs font-bold text-slate-700">Dokumen Lainnya</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {docs.filter((d) => !d.doc_type || (!d.doc_type.startsWith('ketua_') && !d.doc_type.startsWith('anggota1_') && !d.doc_type.startsWith('anggota2_'))).map((doc) => renderDocCard(doc))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-1">Tidak ada dokumen yang di-upload.</div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 px-5 py-3 flex justify-end">
          <button 
            type="button"
            onClick={onClose} 
            className="rounded-xl bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
