import { useState, useEffect } from 'react';
import { API_URL, apiRequest } from '../lib/api.js';

export default function TeamDetailModal({ team, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadDocs = async () => {
      try {
        if (team?.user_id) {
          const docs = await apiRequest(`/admin/teams/${team.user_id}/documents`);
          if (!cancelled && docs) setDocuments(docs);
        }
      } catch {} finally { if (!cancelled) setLoadingDocs(false); }
    };
    loadDocs();
    return () => { cancelled = true; };
  }, [team]);

  const Row = ({ label, value }) => (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">{label}</div>
      <div className="mt-1 text-sm font-bold text-gray-800 break-all">{value || '-'}</div>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        style={{ padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{team?.name || 'Detail Tim'}</h2>
          <button
            onClick={onClose}
            style={{ fontSize: '24px', color: '#999', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            x
          </button>
        </div>

        <Section title="Informasi Tim">
          <Row label="Nama Tim" value={team?.name} />
          <Row label="Kategori" value={team?.category} />
          <Row label="Status" value={team?.status} />
          <Row label="Institusi" value={team?.institution} />
        </Section>

        <Section title="Ketua Tim">
          <Row label="Nama" value={team?.leader_name} />
          <Row label="Email" value={team?.leader_email} />
          <Row label="WhatsApp" value={team?.leader_phone} />
        </Section>

        {team?.member1_name && (
          <Section title="Anggota 1">
            <Row label="Nama" value={team?.member1_name} />
            <Row label="Email" value={team?.member1_email} />
          </Section>
        )}

        {team?.member2_name && (
          <Section title="Anggota 2">
            <Row label="Nama" value={team?.member2_name} />
            <Row label="Email" value={team?.member2_email} />
          </Section>
        )}

        {team?.notes && (
          <Section title="Catatan">
            <Row label="Keterangan" value={team?.notes} />
          </Section>
        )}

        <div style={{ marginTop: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '12px' }}>
            Dokumen
          </h3>
          {loadingDocs ? (
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Memuat dokumen...</div>
          ) : documents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {documents.map((doc) => (
                <a
                  key={doc.id}
                  href={`${API_URL}/admin/documents/${doc.id}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb', textDecoration: 'none', color: 'inherit'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📄</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.original_name}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{doc.doc_type}</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb' }}>Lihat</span>
                </a>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Tidak ada dokumen.</div>
          )}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer', backgroundColor: 'white'
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
