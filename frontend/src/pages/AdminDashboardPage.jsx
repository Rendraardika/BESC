import { useEffect, useMemo, useState } from 'react';
import bescLogo from '../assets/images/logo BESC biru tua FIX.png';
import { API_URL, apiRequest } from '../lib/api.js';

const menuItems = ['Dashboard', 'Peserta', 'Kompetisi', 'Pembayaran', 'Bank Soal', 'Hasil Ujian', 'Pengaturan'];

const initials = (name = '') => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'B';

const getProofURL = (activity) => `${API_URL}/admin/payments/${activity.payment_id}/proof`;

const formatDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatWorkDuration = (startedAt, submittedAt, durationSeconds) => {
  if (Number.isFinite(Number(durationSeconds)) && Number(durationSeconds) >= 0) {
    const totalSeconds = Number(durationSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return hours > 0 ? `${hours}j ${minutes}m ${seconds}d` : `${minutes}m ${seconds}d`;
  }
  if (!startedAt) return '-';
  if (!submittedAt) return 'Belum selesai';
  const start = new Date(startedAt);
  const finish = new Date(submittedAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(finish.getTime())) return '-';
  const totalSeconds = Math.max(0, Math.floor((finish.getTime() - start.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}j ${minutes}m ${seconds}d`;
  return `${minutes}m ${seconds}d`;
};

const defaultCompetitionForm = {
  title: '',
  slug: '',
  description: '',
  participant_requirements: '',
  banner: '',
  category: 'Olimpiade',
  level: 'SMA',
  badges: 'Online,Nasional',
  quota: 0,
  price: 0,
  original_price: 0,
  duration_minutes: 60,
  tab_switch_limit: 3,
  start_time: '',
  end_time: '',
  registration_deadline: '',
  status: 'draft',
};

const competitionToForm = (competition) => ({
  ...defaultCompetitionForm,
  title: competition?.title || '',
  slug: competition?.slug || '',
  description: competition?.description || '',
  participant_requirements: competition?.participant_requirements || '',
  banner: competition?.banner || '',
  category: competition?.category || defaultCompetitionForm.category,
  level: competition?.level || defaultCompetitionForm.level,
  badges: Array.isArray(competition?.badges) ? competition.badges.join(',') : (competition?.badges || ''),
  quota: competition?.quota ?? 0,
  price: competition?.price ?? 0,
  original_price: competition?.original_price ?? 0,
  duration_minutes: competition?.duration_minutes ?? defaultCompetitionForm.duration_minutes,
  tab_switch_limit: competition?.tab_switch_limit ?? defaultCompetitionForm.tab_switch_limit,
  start_time: formatDateTimeLocal(competition?.start_time),
  end_time: formatDateTimeLocal(competition?.end_time),
  registration_deadline: formatDateTimeLocal(competition?.registration_deadline),
  status: competition?.status || defaultCompetitionForm.status,
});

const downloadPaymentProof = async (activity) => {
  const response = await fetch(getProofURL(activity), {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Gagal mengunduh bukti pembayaran.');

  const blob = await response.blob();
  const extension = activity.proof_image?.split('.').pop()?.split('?')[0] || 'jpg';
  const participantName = (activity.user_name || 'peserta').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const fileURL = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = fileURL;
  link.download = `bukti-pembayaran-${participantName || 'peserta'}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(fileURL);
};

export default function AdminDashboardPage({ admin, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('semua');
  const [activePage, setActivePage] = useState('Dashboard');
  const [participants, setParticipants] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [updatingPayment, setUpdatingPayment] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showCompetitionForm, setShowCompetitionForm] = useState(false);
  const [questionCompetition, setQuestionCompetition] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [proofActivity, setProofActivity] = useState(null);
  const [reviewedPayments, setReviewedPayments] = useState(() => new Set());
  const [editingCompetition, setEditingCompetition] = useState(null);

  const refreshDashboard = async () => {
    const data = await apiRequest('/admin/dashboard');
    setDashboard(data);
    return data;
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        await refreshDashboard();
      } catch (err) {
        setError(err.message);
      }
    };
    loadDashboard();
  }, []);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        if (activePage === 'Peserta' && participants.length === 0) {
          setParticipants(await apiRequest('/admin/participants'));
        }
        if ((activePage === 'Kompetisi' || activePage === 'Bank Soal') && competitions.length === 0) {
          setCompetitions(await apiRequest('/competitions?limit=100'));
        }
        if (activePage === 'Hasil Ujian') {
          setSubmissions(await apiRequest('/admin/submissions?limit=100'));
        }
      } catch (err) {
        setError(err.message);
      }
    };
    loadPageData();
  }, [activePage, competitions.length, participants.length]);

  const activities = useMemo(() => {
    const items = dashboard?.recent_activities || [];
    if (filter === 'semua') return items;
    return items.filter((item) => (item.payment_status || item.status) === filter);
  }, [dashboard, filter]);

  const statItems = dashboard ? [
    { label: 'Peserta terdaftar', value: dashboard.total_participants, note: 'Akun peserta aktif', color: 'bg-[#0d9488]', soft: 'bg-teal-50 text-teal-700' },
    { label: 'Kompetisi berjalan', value: dashboard.active_competitions, note: 'Event yang sedang dipublikasikan', color: 'bg-[#f05d4e]', soft: 'bg-rose-50 text-rose-700' },
    { label: 'Pembayaran tertunda', value: dashboard.pending_payments, note: 'Menunggu pemeriksaan admin', color: 'bg-[#f0b429]', soft: 'bg-amber-50 text-amber-700' },
    { label: 'Total pendaftaran', value: dashboard.total_registrations, note: 'Seluruh pendaftaran kompetisi', color: 'bg-[#4257b2]', soft: 'bg-indigo-50 text-indigo-700' },
  ] : [];

  const rankedSubmissions = useMemo(() => {
    const ranksByCompetition = new Map();
    return submissions.map((item) => {
      const nextRank = (ranksByCompetition.get(item.competition_id) || 0) + 1;
      ranksByCompetition.set(item.competition_id, nextRank);
      return { ...item, rank: nextRank };
    });
  }, [submissions]);

  const updatePaymentStatus = async (paymentID, status) => {
    if (!paymentID) return;
    setUpdatingPayment(paymentID);
    setError('');
    try {
      await apiRequest(`/admin/payments/${paymentID}/verify`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      await refreshDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingPayment('');
    }
  };

  const reviewProof = (activity) => {
    setProofActivity(activity);
  };

  const handleDownloadProof = async (activity) => {
    try {
      setError('');
      await downloadPaymentProof(activity);
      setReviewedPayments((current) => new Set([...current, activity.payment_id]));
      await refreshDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteParticipant = async (participant) => {
    if (!window.confirm(`Hapus peserta ${participant.name}? Data pendaftaran dan pembayaran terkait juga akan terhapus.`)) return;
    try {
      await apiRequest(`/admin/participants/${participant.id}`, {
        method: 'DELETE',
      });
      setParticipants((items) => items.filter((item) => item.id !== participant.id));
      setSelectedParticipant(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreateCompetition = () => {
    setEditingCompetition(null);
    setShowCompetitionForm(true);
  };

  const closeCompetitionForm = () => {
    setShowCompetitionForm(false);
    setEditingCompetition(null);
  };

  const openEditCompetition = (competition) => {
    setEditingCompetition(competition);
    setShowCompetitionForm(true);
  };

  const saveCompetition = async (form) => {
    if (editingCompetition) {
      const updated = await apiRequest(`/admin/competitions/${editingCompetition.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setCompetitions((items) => items.map((item) => item.id === editingCompetition.id ? { ...item, ...updated } : item));
    } else {
      const created = await apiRequest('/admin/competitions', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setCompetitions((items) => [created, ...items]);
    }
    closeCompetitionForm();
  };

  const deleteCompetition = async (competition) => {
    if (!window.confirm(`Hapus kompetisi ${competition.title}?`)) return;
    await apiRequest(`/admin/competitions/${competition.id}`, {
      method: 'DELETE',
    });
    setCompetitions((items) => items.filter((item) => item.id !== competition.id));
  };

  const openQuestions = async (competition) => {
    setQuestionCompetition(competition);
    setActivePage('Kelola Soal');
    setQuestions(await apiRequest(`/admin/competitions/${competition.id}/questions`));
  };

  const createQuestion = async (input) => {
    const created = await apiRequest(`/admin/competitions/${questionCompetition.id}/questions`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setQuestions((items) => [...items, created]);
  };

  const updateQuestion = async (questionID, input) => {
    const updated = await apiRequest(`/admin/questions/${questionID}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    setQuestions((items) => items.map((item) => item.id === questionID ? updated : item));
  };

  const deleteQuestion = async (question) => {
    if (!window.confirm('Hapus soal ini?')) return;
    await apiRequest(`/admin/questions/${question.id}`, { method: 'DELETE' });
    setQuestions((items) => items.filter((item) => item.id !== question.id));
  };

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#17324d]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] flex-col border-r border-teal-900/10 bg-[#073b4c] text-white lg:flex">
        <div className="border-b border-white/10 px-7 py-7">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-white p-2">
              <img src={bescLogo} alt="BESC" className="w-full object-contain" />
            </div>
            <div>
              <div className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold">BESC Control</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-teal-200">Competition Center</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-7">
          <div className="mb-4 px-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-teal-200/70">Navigasi Admin</div>
          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <button key={item} type="button" onClick={() => setActivePage(item)} className={`flex h-12 w-full items-center gap-3 rounded-lg px-4 text-left text-sm font-bold transition ${activePage === item ? 'bg-[#06a896] text-white shadow-lg shadow-black/10' : 'text-teal-50/80 hover:bg-white/10 hover:text-white'}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${activePage === item ? 'bg-[#ffd166]' : 'border border-current'}`}></span>
                {item}
              </button>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/10 p-5">
          <div className="flex items-center gap-3 rounded-lg bg-white/8 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#ffd166] text-xs font-extrabold text-[#073b4c]">{initials(admin?.name)}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold">{admin?.name}</div>
              <div className="truncate text-xs text-teal-200">{admin?.email}</div>
            </div>
            <button type="button" onClick={onLogout} className="text-xs font-extrabold text-[#ffd166]">Keluar</button>
          </div>
        </div>
      </aside>

      <section className="lg:pl-[270px]">
        <header className="border-b border-slate-200 bg-white px-5 py-4 md:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0d9488]">BESC Admin Workspace</div>
              <div className="mt-1 text-sm text-slate-500">{activePage}</div>
            </div>
            <button type="button" onClick={onLogout} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-extrabold text-slate-600 lg:hidden">Keluar</button>
          </div>
        </header>

        <div key={activePage} className="content-transition px-5 py-7 md:px-8 lg:px-10">
          {activePage === 'Dashboard' && <><section className="relative overflow-hidden rounded-lg bg-[#0d9488] px-7 py-8 text-white md:px-9">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-[#ffd166] opacity-20"></div>
            <div className="relative max-w-2xl">
              <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-teal-100">Ringkasan hari ini</div>
              <h1 className="mt-3 font-['Plus_Jakarta_Sans'] text-3xl font-extrabold md:text-4xl">Selamat datang, {admin?.name}</h1>
              <p className="mt-3 text-sm leading-6 text-teal-50">Pantau pendaftaran, kompetisi aktif, dan verifikasi pembayaran dari data BESC terbaru.</p>
            </div>
          </section>

          {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

          {!dashboard && !error ? (
            <div className="mt-8 text-sm font-bold text-slate-400">Memuat data dashboard...</div>
          ) : dashboard && (
            <>
              <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statItems.map((item) => (
                  <article key={item.label} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className={`h-1.5 ${item.color}`}></div>
                    <div className="p-5">
                      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">{item.label}</div>
                      <div className="mt-5 text-3xl font-extrabold text-[#17324d]">{Number(item.value).toLocaleString('id-ID')}</div>
                      <div className={`mt-5 inline-flex rounded-md px-2.5 py-1.5 text-[11px] font-bold ${item.soft}`}>{item.note}</div>
                    </div>
                  </article>
                ))}
              </section>

              <section className="mt-7 border border-slate-200 bg-white">
                <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
                  <div>
                    <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-[#17324d]">Arus Pendaftaran Terbaru</h2>
                    <p className="mt-1 text-xs font-medium text-slate-500">Data langsung dari pendaftaran peserta dan pembayaran.</p>
                  </div>
                  <select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-600 outline-none">
                    <option value="semua">Semua aktivitas</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left">
                    <thead className="bg-[#f3f8f7]">
                      <tr className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                        <th className="px-7 py-4">Peserta</th>
                        <th className="px-7 py-4">Kompetisi</th>
                        <th className="px-7 py-4">Tanggal Daftar</th>
                        <th className="px-7 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((item) => {
                        const status = item.payment_status || item.status;
                        return (
                          <tr key={item.id} className="border-t border-slate-100">
                            <td className="px-7 py-4">
                              <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-xs font-extrabold text-[#0d9488]">{initials(item.user_name)}</div>
                                <div>
                                  <div className="text-sm font-extrabold text-[#17324d]">{item.user_name}</div>
                                  <div className="mt-0.5 text-xs text-slate-400">{item.user_email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-7 py-4 text-sm font-semibold text-slate-600">{item.competition_title}</td>
                            <td className="px-7 py-4 text-xs font-semibold text-slate-500">{new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            <td className="px-7 py-4">
                              <span className={`inline-flex rounded-md px-3 py-1.5 text-[10px] font-extrabold uppercase ${status === 'verified' ? 'bg-teal-50 text-teal-700' : status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {activities.length === 0 && <div className="px-7 py-12 text-center text-sm font-semibold text-slate-400">Belum ada aktivitas pendaftaran.</div>}
                </div>
              </section>
            </>
          )}</>}

          {activePage === 'Peserta' && <DataTable title="Manajemen Peserta" subtitle="Daftar akun peserta yang terhubung ke BESC." headers={['Peserta', 'WhatsApp', 'Sekolah', 'Tanggal Bergabung', 'Aksi']} rows={participants.map((item) => [
            <div key={item.id} className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-teal-50 text-xs font-extrabold text-teal-700">{item.photo ? <img src={item.photo} alt={item.name} className="h-full w-full object-cover" /> : initials(item.name)}</span><div><div className="font-bold">{item.name}</div><div className="text-xs text-slate-400">{item.email}</div></div></div>,
            item.phone || '-',
            item.institution || '-',
            new Date(item.created_at).toLocaleDateString('id-ID'),
            <div key={item.id} className="flex gap-2"><button type="button" onClick={() => setSelectedParticipant(item)} className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-extrabold text-teal-700">Lihat</button><button type="button" onClick={() => deleteParticipant(item)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-extrabold text-red-600">Hapus</button></div>,
          ])} />}

          {activePage === 'Kompetisi' && <DataTable title="Manajemen Kompetisi" subtitle="Kompetisi yang tersimpan pada database BESC." action={<button type="button" onClick={openCreateCompetition} className="rounded-lg bg-[#0d9488] px-4 py-2.5 text-xs font-extrabold text-white">Tambah Kompetisi</button>} headers={['Judul', 'Harga', 'Periode', 'Status', 'Aksi']} rows={competitions.map((item) => [
            <div key={item.id} className="font-bold">{item.title}</div>,
            Number(item.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
            `${new Date(item.start_time).toLocaleDateString('id-ID')} - ${new Date(item.end_time).toLocaleDateString('id-ID')}`,
            <Status key={item.id} value={item.status} />,
            <div key={item.id} className="flex gap-2"><button type="button" onClick={() => openEditCompetition(item)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700">Edit</button><button type="button" onClick={() => deleteCompetition(item)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-extrabold text-red-600">Hapus</button></div>,
          ])} />}

          {activePage === 'Pembayaran' && <DataTable title="Verifikasi Pembayaran" subtitle="Status pembayaran dapat diubah setelah admin membuka bukti pembayaran." headers={['Peserta', 'Kompetisi', 'Tanggal', 'Bukti', 'Status']} rows={(dashboard?.recent_activities || []).filter((item) => item.payment_status).map((item) => {
            const proofViewed = Boolean(item.proof_viewed_at) || reviewedPayments.has(item.payment_id);
            return [
              <div key={item.id} className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-teal-50 text-xs font-extrabold text-teal-700">{item.user_photo ? <img src={item.user_photo} alt={item.user_name} className="h-full w-full object-cover" /> : initials(item.user_name)}</span><div><div className="font-bold">{item.user_name}</div><div className="text-xs text-slate-400">{item.user_email}</div></div></div>,
              item.competition_title,
              new Date(item.created_at).toLocaleDateString('id-ID'),
              <div key={item.id} className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => reviewProof(item)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700">Lihat Bukti</button><button type="button" onClick={() => handleDownloadProof(item)} className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-extrabold text-teal-700">Download</button>{proofViewed ? <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase text-emerald-700">Bukti sudah dilihat</span> : <span className="rounded-md bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase text-amber-700">Buka bukti dulu</span>}</div>,
              <select key={item.id} value={item.payment_status} disabled={!proofViewed || updatingPayment === item.payment_id} onChange={(event) => updatePaymentStatus(item.payment_id, event.target.value)} title={proofViewed ? 'Ubah status pembayaran' : 'Buka bukti pembayaran terlebih dahulu'} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-600 outline-none disabled:cursor-not-allowed disabled:opacity-50">
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>,
            ];
          })} />}

          {activePage === 'Bank Soal' && <DataTable title="Bank Soal" subtitle="Pilih kompetisi untuk mengelola soal ujian." headers={['Kompetisi', 'Status', 'Periode', 'Aksi']} rows={competitions.map((item) => [
            <div key={item.id} className="font-bold">{item.title}</div>,
            <Status key={item.id} value={item.status} />,
            new Date(item.start_time).toLocaleDateString('id-ID'),
            <button key={item.id} type="button" onClick={() => openQuestions(item)} className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-extrabold text-teal-700">Kelola Soal</button>,
          ])} />}

          {activePage === 'Kelola Soal' && questionCompetition && <QuestionManager competition={questionCompetition} questions={questions} onBack={() => { setQuestionCompetition(null); setActivePage('Bank Soal'); }} onCreate={createQuestion} onDelete={deleteQuestion} onUpdate={updateQuestion} />}

          {activePage === 'Hasil Ujian' && <DataTable title="Hasil Ujian Otomatis" subtitle="Peringkat dihitung per kompetisi dari skor tertinggi lalu waktu tercepat." headers={['Peringkat', 'Peserta', 'Kompetisi', 'Benar', 'Salah', 'Terjawab', 'Tidak Dijawab', 'Total Soal', 'Skor', 'Waktu Pengerjaan', 'Status']} rows={rankedSubmissions.map((item) => [
            <span key={item.id} className="font-mono text-sm font-extrabold text-[#17324d]">#{item.rank}</span>,
            <div key={item.id}><div className="font-bold">{item.user_name}</div><div className="text-xs text-slate-400">{item.user_email}</div></div>,
            item.competition_title,
            item.correct_count,
            item.wrong_count,
            item.answered_questions,
            item.unanswered_questions,
            item.total_questions,
            item.score,
            <span key={item.id} className="font-mono text-xs font-bold text-slate-700">{formatWorkDuration(item.started_at, item.submitted_at, item.duration_seconds)}</span>,
            <Status key={item.id} value={item.status} />,
          ])} />}

          {activePage === 'Pengaturan' && <section className="max-w-2xl border border-slate-200 bg-white p-7"><h2 className="text-xl font-extrabold">Pengaturan Admin</h2><p className="mt-2 text-sm text-slate-500">Informasi akun admin yang sedang digunakan.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><Setting label="Nama Admin" value={admin?.name} /><Setting label="Email" value={admin?.email} /><Setting label="Role" value={admin?.role} /><Setting label="Workspace" value="BESC Competition Center" /></div></section>}
        </div>
      </section>
      {selectedParticipant && <ParticipantModal participant={selectedParticipant} onClose={() => setSelectedParticipant(null)} onDelete={() => deleteParticipant(selectedParticipant)} />}
      {showCompetitionForm && <CompetitionForm initialData={editingCompetition} onClose={closeCompetitionForm} onSubmit={saveCompetition} />}
      {proofActivity && <ProofModal activity={proofActivity} onClose={() => setProofActivity(null)} onDownload={handleDownloadProof} onViewed={async (paymentID) => { setReviewedPayments((current) => new Set([...current, paymentID])); await refreshDashboard(); }} />}
    </main>
  );
}

function DataTable({ action, headers, rows, subtitle, title }) {
  return (
    <section className="border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5"><div><h1 className="text-xl font-extrabold">{title}</h1><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div>{action}</div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#f3f8f7]"><tr>{headers.map((header) => <th key={header} className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="border-t border-slate-100">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-6 py-4 text-sm text-slate-600">{cell}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <div className="px-6 py-14 text-center text-sm font-semibold text-slate-400">Belum ada data untuk ditampilkan.</div>}</div>
    </section>
  );
}

function Status({ value }) {
  return <span className="rounded-md bg-teal-50 px-3 py-1.5 text-[10px] font-extrabold uppercase text-teal-700">{value || 'pending'}</span>;
}

function Setting({ label, value }) {
  return <div className="rounded-lg bg-slate-50 p-4"><div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</div><div className="mt-2 text-sm font-bold text-[#17324d]">{value || '-'}</div></div>;
}

function ParticipantModal({ onClose, onDelete, participant }) {
  const fields = [['Email', participant.email], ['WhatsApp', participant.phone], ['Sekolah', participant.institution], ['Tanggal Lahir', participant.birth_date ? new Date(participant.birth_date).toLocaleDateString('id-ID') : '-'], ['Jenis Kelamin', participant.gender], ['Domisili', [participant.city, participant.province].filter(Boolean).join(', ') || '-']];
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-5" onClick={onClose}><section className="content-transition w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div className="flex items-center gap-4"><div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-teal-50 font-extrabold text-teal-700">{participant.photo ? <img src={participant.photo} alt={participant.name} className="h-full w-full object-cover" /> : initials(participant.name)}</div><div><h2 className="text-xl font-extrabold">{participant.name}</h2><p className="mt-1 text-xs text-slate-400">Profil peserta BESC</p></div></div><button type="button" onClick={onClose} className="text-xl text-slate-400">×</button></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{fields.map(([label, value]) => <Setting key={label} label={label} value={value} />)}</div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-extrabold">Tutup</button><button type="button" onClick={onDelete} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-extrabold text-white">Hapus Peserta</button></div></section></div>;
}

function CompetitionForm({ initialData, onClose, onSubmit }) {
  const isEditMode = Boolean(initialData);
  const [form, setForm] = useState(() => initialData ? competitionToForm(initialData) : defaultCompetitionForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(initialData ? competitionToForm(initialData) : defaultCompetitionForm);
    setError('');
  }, [initialData]);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value, ...(field === 'title' ? { slug: value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') } : {}) }));
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const startTime = new Date(form.start_time);
      const endTime = new Date(form.end_time);
      if (endTime < startTime) {
        throw new Error('Waktu selesai tidak boleh lebih awal dari waktu mulai.');
      }
      await onSubmit({ ...form, badges: Array.isArray(form.badges) ? form.badges.join(',') : String(form.badges || '').split(',').map((badge) => badge.trim()).filter(Boolean).join(','), quota: Number(form.quota), price: Number(form.price), original_price: Number(form.original_price), duration_minutes: Number(form.duration_minutes), tab_switch_limit: Number(form.tab_switch_limit), start_time: startTime.toISOString(), end_time: endTime.toISOString(), registration_deadline: form.registration_deadline ? new Date(form.registration_deadline).toISOString() : null });
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };
  const imageUpload = (event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => update('banner', reader.result); reader.readAsDataURL(file); };
  const input = 'h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-500';
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-5"><div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_400px]"><form onSubmit={submit} className="content-transition rounded-lg bg-white p-6"><div className="flex justify-between"><div><h2 className="text-xl font-extrabold">{isEditMode ? 'Edit Kompetisi' : 'Tambah Kompetisi'}</h2><p className="mt-1 text-xs text-slate-500">Lengkapi informasi yang akan tampil pada kartu kompetisi.</p></div><button type="button" onClick={onClose} className="text-xl">×</button></div>{error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>}<div className="mt-6 grid gap-4 sm:grid-cols-2"><FormField label="Judul"><input className={input} value={form.title} onChange={(e) => update('title', e.target.value)} required /></FormField><FormField label="Slug"><input className={input} value={form.slug} onChange={(e) => update('slug', e.target.value)} required /></FormField><FormField label="Kategori"><input className={input} value={form.category} onChange={(e) => update('category', e.target.value)} required /></FormField><FormField label="Jenjang"><select className={input} value={form.level} onChange={(e) => update('level', e.target.value)}><option>SMP</option><option>SMA</option><option>Umum</option></select></FormField><FormField label="Badge (pisahkan koma)"><input className={input} value={form.badges} onChange={(e) => update('badges', e.target.value)} /></FormField><FormField label="Kuota Peserta"><input className={input} type="number" min="0" value={form.quota} onChange={(e) => update('quota', e.target.value)} /></FormField><FormField label="Harga Promo"><input className={input} type="number" min="0" value={form.price} onChange={(e) => update('price', e.target.value)} /></FormField><FormField label="Harga Asli"><input className={input} type="number" min="0" value={form.original_price} onChange={(e) => update('original_price', e.target.value)} /></FormField><FormField label="Durasi Ujian (menit)"><input className={input} type="number" min="1" max="600" value={form.duration_minutes} onChange={(e) => update('duration_minutes', e.target.value)} required /></FormField><FormField label="Batas Tab Switch"><input className={input} type="number" min="1" max="20" value={form.tab_switch_limit} onChange={(e) => update('tab_switch_limit', e.target.value)} required /></FormField><FormField label="Mulai Kompetisi"><input className={input} type="datetime-local" value={form.start_time} onChange={(e) => update('start_time', e.target.value)} required /></FormField><FormField label="Selesai Kompetisi"><input className={input} type="datetime-local" value={form.end_time} onChange={(e) => update('end_time', e.target.value)} required /></FormField><FormField label="Deadline Pendaftaran"><input className={input} type="datetime-local" value={form.registration_deadline} onChange={(e) => update('registration_deadline', e.target.value)} /></FormField><FormField label="Status"><select className={input} value={form.status} onChange={(e) => update('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option></select></FormField><div className="sm:col-span-2"><FormField label="Deskripsi"><textarea className="min-h-24 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-teal-500" value={form.description} onChange={(e) => update('description', e.target.value)} required /></FormField></div><div className="sm:col-span-2"><FormField label="Persyaratan Peserta"><textarea className="min-h-28 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-teal-500" value={form.participant_requirements} onChange={(e) => update('participant_requirements', e.target.value)} placeholder={'Peserta merupakan siswa aktif SMA/MA/SMK sederajat\nProfil peserta wajib diisi lengkap\nPeserta wajib mengunggah bukti pembayaran\nPeserta wajib mengikuti technical meeting'} /><p className="mt-2 text-xs font-semibold text-slate-500">Tulis satu persyaratan pada setiap baris.</p></FormField></div><div className="sm:col-span-2"><FormField label="Banner Kompetisi"><input type="file" accept="image/*" onChange={imageUpload} required={!isEditMode && !form.banner} />{isEditMode && form.banner && <div className="mt-2 text-xs font-semibold text-slate-500">Banner lama tetap digunakan jika tidak memilih file baru.</div>}</FormField></div></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-extrabold">Batal</button><button type="submit" disabled={saving} className="rounded-lg bg-[#0d9488] px-5 py-2 text-xs font-extrabold text-white disabled:opacity-50">{saving ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Kompetisi'}</button></div></form><CompetitionPreview form={form} /></div></div>;
}

function FormField({ children, label }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span>{children}</label>; }

function CompetitionPreview({ form }) {
  const badges = [form.category, form.level, ...form.badges.split(',')].filter(Boolean);
  return <aside className="content-transition h-fit overflow-hidden rounded-[24px] bg-white shadow-2xl"><div className="h-52 bg-[#176b5a]">{form.banner ? <img src={form.banner} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm font-bold text-white/70">Preview Banner</div>}</div><div className="p-5"><div className="flex flex-wrap gap-2">{badges.map((badge) => <span key={badge} className="rounded-full bg-teal-50 px-2.5 py-1 text-[9px] font-extrabold uppercase text-teal-700">{badge.trim()}</span>)}</div><h3 className="mt-4 text-xl font-extrabold">{form.title || 'Judul Kompetisi'}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{form.description || 'Deskripsi kompetisi akan tampil di sini.'}</p><div className="mt-5 grid grid-cols-2 gap-3"><Setting label="Deadline" value={form.registration_deadline ? new Date(form.registration_deadline).toLocaleDateString('id-ID') : '-'} /><Setting label="Peserta" value={`${Number(form.quota).toLocaleString('id-ID')} peserta`} /></div><div className="mt-5 border-t border-slate-100 pt-5"><div className="text-2xl font-extrabold text-teal-700">{Number(form.price) === 0 ? 'Gratis' : Number(form.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</div></div></div></aside>;
}

function QuestionManager({ competition, onBack, onCreate, onDelete, onUpdate, questions }) {
  const [editorQuestion, setEditorQuestion] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('oldest');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState('');
  const pageSize = 10;
  const totalScore = questions.reduce((total, item) => total + Number(item.score), 0);
  const filtered = questions.filter((item) => item.question.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'score-high' ? Number(b.score) - Number(a.score) : sort === 'score-low' ? Number(a.score) - Number(b.score) : sort === 'newest' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2200); };
  return <section className="content-transition"><div className="mb-5 flex items-center gap-3 text-xs font-bold text-slate-400"><button type="button" onClick={onBack} className="text-teal-700 hover:underline">Bank Soal</button><span>/</span><span>Kelola Soal</span></div><header className="border border-slate-200 bg-white px-5 py-5 md:px-7"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-start gap-4"><button type="button" onClick={onBack} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-lg text-slate-500 hover:bg-slate-50">←</button><div><div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-teal-600">Kelola Soal Kompetisi</div><h2 className="mt-2 text-2xl font-extrabold text-[#17324d]">{competition.title}</h2><div className="mt-4 flex flex-wrap gap-3"><StatBadge icon="📄" label={`${questions.length} Soal`} /><StatBadge icon="🎯" label={`Total Bobot ${totalScore}`} /></div></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setEditorQuestion({})} className="rounded-lg bg-[#0d9488] px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-teal-900/10 transition hover:bg-[#087f75]">+ Tambah Soal</button></div></div></header><main className="mt-5">{questions.length === 0 ? <div className="grid min-h-[260px] place-items-center rounded-lg border border-dashed border-slate-300 bg-white text-center"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal-50 text-2xl">📄</div><div className="mt-4 text-lg font-extrabold text-[#17324d]">Belum ada soal</div><p className="mt-2 text-sm text-slate-500">Tambahkan soal pertama untuk kompetisi ini.</p><button type="button" onClick={() => setEditorQuestion({})} className="mt-5 rounded-lg bg-[#0d9488] px-5 py-2.5 text-xs font-extrabold text-white">+ Tambah Soal</button></div></div> : <section className="border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between"><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Cari pertanyaan..." className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-500 md:max-w-sm" /><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-600"><option value="oldest">Urutan awal</option><option value="newest">Terbaru</option><option value="score-high">Bobot tertinggi</option><option value="score-low">Bobot terendah</option></select></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-[#f3f8f7] text-[10px] font-extrabold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">No</th><th className="px-5 py-4">Pertanyaan</th><th className="px-5 py-4">Kunci</th><th className="px-5 py-4">Bobot</th><th className="px-5 py-4">Aksi</th></tr></thead><tbody>{visible.map((item, index) => <tr key={item.id} className="border-t border-slate-100 transition hover:bg-teal-50/40"><td className="px-5 py-4 text-sm font-bold">{(page - 1) * pageSize + index + 1}</td><td className="max-w-xl px-5 py-4 text-sm font-semibold text-[#17324d]"><div className="flex items-start gap-3">{item.image && <img src={item.image} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 object-cover" />}<span>{item.question}</span></div></td><td className="px-5 py-4"><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-extrabold text-emerald-700">{item.correct_answer}</span></td><td className="px-5 py-4 text-sm font-bold">{item.score}</td><td className="px-5 py-4"><div className="flex gap-2"><button type="button" onClick={() => setEditorQuestion(item)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">Edit</button><button type="button" onClick={async () => { await onDelete(item); notify('Soal berhasil dihapus.'); }} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100">Hapus</button></div></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-xs font-semibold text-slate-500"><span>Menampilkan {visible.length} dari {filtered.length} soal</span><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40">Sebelumnya</button><span className="grid place-items-center px-2">{page}/{pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40">Berikutnya</button></div></div></section>}</main>{editorQuestion && <QuestionEditor question={editorQuestion} onClose={() => setEditorQuestion(null)} onSave={async (input) => { if (editorQuestion.id) { await onUpdate(editorQuestion.id, input); notify('Perubahan soal berhasil disimpan.'); } else { await onCreate(input); notify('Soal berhasil ditambahkan.'); } setEditorQuestion(null); }} />}{toast && <div className="fixed bottom-6 right-6 z-[80] rounded-lg bg-[#073b4c] px-5 py-3 text-sm font-bold text-white shadow-xl">{toast}</div>}</section>;
}

function StatBadge({ icon, label }) { return <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold text-[#17324d]"><span>{icon}</span>{label}</div>; }

function QuestionEditor({ onClose, onSave, question }) {
  const empty = { question: '', image: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_answer: 'A', score: 10, wrong_score: 2 };
  const [form, setForm] = useState({ ...empty, ...question });
  const [saving, setSaving] = useState(false);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => { event.preventDefault(); setSaving(true); try { await onSave({ question: form.question, image: form.image, option_a: form.option_a, option_b: form.option_b, option_c: form.option_c, option_d: form.option_d, option_e: form.option_e, correct_answer: form.correct_answer, score: Number(form.score), wrong_score: Number(form.wrong_score || 0) }); } finally { setSaving(false); } };
  const imageUpload = (event) => { const file = event.target.files?.[0]; if (!file) return; if (!['image/jpeg','image/png','image/webp'].includes(file.type)) return; const reader = new FileReader(); reader.onload = () => update('image', reader.result); reader.readAsDataURL(file); };
  const input = 'h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100';
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 p-4" onClick={onClose}><form onSubmit={submit} className="content-transition flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}><header className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5"><div><h3 className="text-xl font-extrabold text-[#17324d]">{question.id ? 'Edit Soal' : 'Tambah Soal'}</h3><p className="mt-1 text-xs text-slate-500">Lengkapi pertanyaan, pilihan jawaban, dan kunci jawaban.</p></div><button type="button" onClick={onClose} className="text-xl text-slate-400">×</button></header><div className="min-h-0 flex-1 overflow-y-auto px-6 py-5"><FormField label="Pertanyaan"><textarea className="min-h-24 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.question} onChange={(e) => update('question', e.target.value)} required /></FormField><FormField label="Gambar Soal (opsional)"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={imageUpload} />{form.image && <div className="mt-3 flex items-start gap-3"><img src={form.image} alt="Preview gambar soal" className="max-h-48 max-w-full rounded-lg border border-slate-200 object-contain" /><button type="button" onClick={() => update('image', '')} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">Hapus gambar</button></div>}</FormField><div className="mt-4 grid gap-4 sm:grid-cols-2">{['a','b','c','d','e'].map((key) => <FormField key={key} label={`Pilihan ${key.toUpperCase()}`}><input className={input} value={form[`option_${key}`]} onChange={(e) => update(`option_${key}`, e.target.value)} required /></FormField>)}<FormField label="Kunci Jawaban"><select className={input} value={form.correct_answer} onChange={(e) => update('correct_answer', e.target.value)}>{['A','B','C','D','E'].map((value) => <option key={value}>{value}</option>)}</select></FormField><FormField label="Bobot Benar (+)"><input className={input} type="number" min="1" value={form.score} onChange={(e) => update('score', e.target.value)} required /></FormField><FormField label="Bobot Salah (-)"><input className={input} type="number" min="0" value={form.wrong_score} onChange={(e) => update('wrong_score', e.target.value)} required /></FormField></div></div><footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4"><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-5 py-2.5 text-xs font-extrabold text-slate-600">Batal</button><button type="submit" disabled={saving} className="rounded-lg bg-[#0d9488] px-5 py-2.5 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Soal'}</button></footer></form></div>;
}

function ProofModal({ activity, onClose, onDownload, onViewed }) {
  const [proofURL, setProofURL] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let objectURL = '';
    const loadProof = async () => {
      try {
        const response = await fetch(getProofURL(activity), {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Gagal membuka bukti pembayaran.');
        objectURL = URL.createObjectURL(await response.blob());
        setProofURL(objectURL);
        await onViewed(activity.payment_id);
      } catch (err) {
        setError(err.message);
      }
    };
    loadProof();
    return () => { if (objectURL) URL.revokeObjectURL(objectURL); };
  }, [activity]);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-5" onClick={onClose}><section className="content-transition w-full max-w-3xl rounded-lg bg-white p-5" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><h2 className="text-xl font-extrabold">Bukti Pembayaran</h2><p className="mt-1 text-sm text-slate-500">{activity.user_name} • {activity.competition_title}</p></div><button type="button" onClick={onClose} className="text-xl">×</button></div><div className="mt-5 grid min-h-80 place-items-center overflow-hidden rounded-lg bg-slate-100 p-3">{error ? <div className="text-sm font-bold text-red-600">{error}</div> : proofURL ? <img src={proofURL} alt={`Bukti pembayaran ${activity.user_name}`} className="max-h-[65vh] max-w-full object-contain" /> : <div className="text-sm font-bold text-slate-500">Memuat bukti pembayaran...</div>}</div><div className="mt-4 flex justify-end">{proofURL && <a href={proofURL} target="_blank" rel="noreferrer" className="rounded-lg bg-[#0d9488] px-4 py-2.5 text-xs font-extrabold text-white">Buka Ukuran Penuh</a>}</div></section></div>;
}
