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

  var Row = function(props) {
    return (
      <div style={{background:'#f9fafb',borderRadius:'8px',padding:'10px'}}>
        <div style={{fontSize:'10px',fontWeight:'700',color:'#9ca3af',textTransform:'uppercase'}}>{props.label}</div>
        <div style={{fontSize:'14px',fontWeight:'700',color:'#111827',marginTop:'4px',wordBreak:'break-all'}}>{props.value || '-'}</div>
      </div>
    );
  };

  var Section = function(props) {
    return (
      <div style={{marginBottom:'16px'}}>
        <h3 style={{fontSize:'14px',fontWeight:'700',borderBottom:'1px solid #e5e7eb',paddingBottom:'8px',marginBottom:'12px'}}>{props.title}</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'8px'}}>
          {props.children}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor:'rgba(0,0,0,0.5)'}} onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" style={{padding:'24px'}} onClick={function(e) { e.stopPropagation(); }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <h2 style={{fontSize:'18px',fontWeight:'800'}}>{t.name || 'Detail Tim'}</h2>
          <button onClick={onClose} style={{fontSize:'24px',color:'#999',cursor:'pointer',background:'none',border:'none'}}>x</button>
        </div>

        <Section title="Informasi Tim">
          <Row label="Nama Tim" value={t.name} />
          <Row label="Kategori" value={t.category} />
          <Row label="Status" value={t.status} />
          <Row label="Institusi" value={t.institution} />
          <Row label="Provinsi" value={t.province} />
          <Row label="Kota" value={t.city} />
          <Row label="Alamat" value={t.address} />
        </Section>

        <Section title="Ketua Tim">
          <Row label="Nama" value={t.leader_name} />
          <Row label="Email" value={t.leader_email} />
          <Row label="WhatsApp" value={t.leader_phone} />
          <Row label="NISN" value={t.leader_nisn} />
          <Row label="Kelas" value={t.leader_kelas} />
          <Row label="Username IG" value={t.leader_ig} />
          <Row label="Username TikTok" value={t.leader_tiktok} />
        </Section>

        {t.member1_name ? (
          <Section title="Anggota 1">
            <Row label="Nama" value={t.member1_name} />
            <Row label="Email" value={t.member1_email} />
            <Row label="NISN" value={t.member1_nisn} />
            <Row label="Kelas" value={t.member1_kelas} />
            <Row label="Username IG" value={t.member1_ig} />
            <Row label="Username TikTok" value={t.member1_tiktok} />
          </Section>
        ) : null}

        {t.member2_name ? (
          <Section title="Anggota 2">
            <Row label="Nama" value={t.member2_name} />
            <Row label="Email" value={t.member2_email} />
            <Row label="NISN" value={t.member2_nisn} />
            <Row label="Kelas" value={t.member2_kelas} />
            <Row label="Username IG" value={t.member2_ig} />
            <Row label="Username TikTok" value={t.member2_tiktok} />
          </Section>
        ) : null}

        {(t.guardian_name || t.guardian_hp || t.guardian_email) ? (
          <Section title="Guru Pembimbing">
            <Row label="Nama Guru" value={t.guardian_name} />
            <Row label="HP Guru" value={t.guardian_hp} />
            <Row label="Email Guru" value={t.guardian_email} />
          </Section>
        ) : null}

        {t.notes ? (
          <Section title="Catatan / Karya">
            <Row label="Keterangan" value={t.notes} />
          </Section>
        ) : null}

        {!t.user_id ? (
          <div style={{marginBottom:'16px',padding:'12px',background:'#fffbeb',borderRadius:'8px',border:'1px solid #fde68a',fontSize:'12px',color:'#92400e'}}>
            Dokumen tidak tersedia untuk entri ini.
          </div>
        ) : (
          <div style={{marginBottom:'16px'}}>
            <h3 style={{fontSize:'14px',fontWeight:'700',borderBottom:'1px solid #e5e7eb',paddingBottom:'8px',marginBottom:'12px'}}>Dokumen Pendaftaran</h3>
            {loadingDocs ? (
              <div style={{fontSize:'12px',color:'#9ca3af',padding:'8px 0'}}>Memuat dokumen...</div>
            ) : docsError ? (
              <div style={{fontSize:'12px',color:'#dc2626',padding:'8px 0'}}>Gagal memuat dokumen. Coba tutup dan buka lagi.</div>
            ) : docs.length > 0 ? (
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                {['ketua', 'anggota1', 'anggota2'].map(function(prefix) {
                  var prefixLabel = prefix === 'ketua' ? 'Ketua Tim' : prefix === 'anggota1' ? 'Anggota 1' : 'Anggota 2';
                  var groupDocs = docs.filter(function(d) { return d.doc_type && d.doc_type.startsWith(prefix + '_'); });
                  if (groupDocs.length === 0) return null;
                  return (
                    <div key={prefix} style={{border:'1px solid #e5e7eb',borderRadius:'8px',padding:'12px'}}>
                      <div style={{fontSize:'12px',fontWeight:'700',color:'#374151',marginBottom:'8px'}}>{prefixLabel}</div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'8px'}}>
                        {groupDocs.map(function(doc) {
                          var label = doc.doc_type.replace(prefix + '_', '').replace(/([A-Z])/g, ' $1').trim();
                          var isPdf = doc.original_name && doc.original_name.toLowerCase().endsWith('.pdf');
                          return (
                            <a key={doc.id} href={API_URL + '/docs/view/' + doc.id} target="_blank" rel="noopener noreferrer"
                               style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',padding:'8px',borderRadius:'8px',border:'1px solid #e5e7eb',backgroundColor:'#f9fafb',textDecoration:'none',color:'inherit',textAlign:'center'}}>
                              <span style={{fontSize:'24px'}}>{isPdf ? '\uD83D\uDCC4' : '\uD83D\uDDBC\uFE0F'}</span>
                              <div style={{fontSize:'11px',fontWeight:'600',color:'#374151'}}>{label}</div>
                              <div style={{fontSize:'10px',color:'#2563eb',fontWeight:'600'}}>Buka</div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {/* Extra documents: biodata kelompok, biodata guru, abstrak */}
                {docs.filter(function(d) { return !d.doc_type || (!d.doc_type.startsWith('ketua_') && !d.doc_type.startsWith('anggota1_') && !d.doc_type.startsWith('anggota2_')); }).length > 0 && (
                  <div style={{border:'1px solid #e5e7eb',borderRadius:'8px',padding:'12px'}}>
                    <div style={{fontSize:'12px',fontWeight:'700',color:'#374151',marginBottom:'8px'}}>Dokumen Lainnya</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'8px'}}>
                      {docs.filter(function(d) { return !d.doc_type || (!d.doc_type.startsWith('ketua_') && !d.doc_type.startsWith('anggota1_') && !d.doc_type.startsWith('anggota2_')); }).map(function(doc) {
                        var label = (doc.doc_type || 'Dokumen').replace(/([A-Z])/g, ' $1').trim();
                        var isPdf = doc.original_name && doc.original_name.toLowerCase().endsWith('.pdf');
                        return (
                          <a key={doc.id} href={API_URL + '/docs/view/' + doc.id} target="_blank" rel="noopener noreferrer"
                             style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',padding:'8px',borderRadius:'8px',border:'1px solid #e5e7eb',backgroundColor:'#f9fafb',textDecoration:'none',color:'inherit',textAlign:'center'}}>
                            <span style={{fontSize:'24px'}}>{isPdf ? '\uD83D\uDCC4' : '\uD83D\uDDBC\uFE0F'}</span>
                            <div style={{fontSize:'11px',fontWeight:'600',color:'#374151'}}>{label}</div>
                            <div style={{fontSize:'10px',color:'#2563eb',fontWeight:'600'}}>Buka</div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{fontSize:'12px',color:'#9ca3af',padding:'8px 0'}}>Tidak ada dokumen yang di-upload.</div>
            )}
          </div>
        )}

        <div style={{display:'flex',justifyContent:'flex-end',marginTop:'16px'}}>
          <button onClick={onClose} style={{padding:'8px 16px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px',fontWeight:'700',cursor:'pointer',backgroundColor:'white'}}>Tutup</button>
        </div>
      </div>
    </div>
  );
}
