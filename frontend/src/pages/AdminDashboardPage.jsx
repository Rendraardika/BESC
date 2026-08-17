import { useEffect, useMemo, useState } from 'react';
import bescLogo from '../assets/images/logo BESC biru tua FIX.png';
import { API_URL, apiRequest } from '../lib/api.js';
import TeamDetailModal from '../components/TeamDetailModal.jsx';

const menuItems = ['Dashboard', 'Peserta', 'Kompetisi', 'Tim', 'Pembayaran', 'Bank Soal', 'Hasil Ujian', 'Pengaturan'];

const initials = (name = '') => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'B';

const normalizePhotoSrc = (src) => {
  if (!src) return '';
  const value = String(src).trim();
  if (!value || value === 'null' || value === 'undefined') return '';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image')) {
    return value;
  }
  const cleanPath = value.replace(/^public\//, '').replace(/^\/?uploads\//, '');
  const baseUrl = API_URL.replace(/\/api\/v1\/?$/, '');
  return `${baseUrl}/uploads/${cleanPath}`;
};

function Avatar({ src, name, className }) {
  const [failed, setFailed] = useState(false);
  const imageSrc = normalizePhotoSrc(src);
  if (imageSrc && !failed) {
    return (
      <span className={`grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-teal-50 text-xs font-extrabold text-teal-700 ${className || ''}`}>
        <img
          src={imageSrc}
          alt={name || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }
  return (
    <span className={`grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-teal-50 text-xs font-extrabold text-teal-700 ${className || ''}`}>
      {initials(name)}
    </span>
  );
}

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

const downloadFileFromUrl = async (url, filename) => {
  try {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Gagal mengunduh berkas.');
    const blob = await response.blob();
    const fileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(fileURL);
  } catch {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
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
  const [payments, setPayments] = useState([]);
  const [editingCompetition, setEditingCompetition] = useState(null);
  const [teams, setTeams] = useState([]);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeamDetail, setSelectedTeamDetail] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  // Auto-refresh dashboard every 5 seconds when on Dashboard page
  useEffect(() => {
    if (activePage !== 'Dashboard') return;
    
    const interval = setInterval(async () => {
      try {
        await refreshDashboard();
      } catch (err) {
        console.error('Failed to refresh dashboard:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activePage]);

  // Scroll to top when active page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        if (activePage === 'Peserta') {
          setParticipants(await apiRequest('/admin/participants'));
        }
        if (activePage === 'Pembayaran') {
          setPayments(await apiRequest('/admin/payments'));
        }
        if (activePage === 'Kompetisi' || activePage === 'Bank Soal') {
          setCompetitions(await apiRequest('/competitions?limit=100'));
        }
        if (activePage === 'Tim') {
          setTeams(await apiRequest('/admin/teams'));
        }
        if (activePage === 'Hasil Ujian') {
          setSubmissions(await apiRequest('/admin/submissions?limit=100'));
        }
      } catch (err) {
        setError(err.message);
      }
    };
    loadPageData();

    // Auto-refresh data for specific pages every 20 seconds
    const interval = setInterval(async () => {
      try {
        if (activePage === 'Peserta') {
          setParticipants(await apiRequest('/admin/participants'));
        }
        if (activePage === 'Pembayaran') {
          setPayments(await apiRequest('/admin/payments'));
        }
        if (activePage === 'Tim') {
          setTeams(await apiRequest('/admin/teams'));
        }
        if (activePage === 'Hasil Ujian') {
          setSubmissions(await apiRequest('/admin/submissions?limit=100'));
        }
      } catch (err) {
        console.error('Failed to refresh page data:', err);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [activePage]);

  const activities = useMemo(() => {
    const items = dashboard?.recent_activities || [];
    const filtered = filter === 'semua' ? items : items.filter((item) => (item.payment_status || item.status) === filter);
    return filtered.slice(0, 10);
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
      setPayments((current) => current.map((item) => (item.payment_id === paymentID ? { ...item, payment_status: status } : item)));
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

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.onConfirm) return;
    setIsDeleting(true);
    setError('');
    try {
      await deleteTarget.onConfirm();
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteParticipant = (participant) => {
    setDeleteTarget({
      title: 'Hapus Peserta',
      description: `Apakah Anda yakin ingin menghapus peserta "${participant.name}" (${participant.email})? Data pendaftaran dan pembayaran terkait juga akan terhapus secara permanen.`,
      onConfirm: async () => {
        await apiRequest(`/admin/participants/${participant.id}`, {
          method: 'DELETE',
        });
        setParticipants((items) => items.filter((item) => item.id !== participant.id));
        setSelectedParticipant(null);
      },
    });
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

  const deleteCompetition = (competition) => {
    setDeleteTarget({
      title: 'Hapus Kompetisi',
      description: `Apakah Anda yakin ingin menghapus kompetisi "${competition.title}"? Seluruh soal, pendaftaran, dan data terkait kompetisi ini akan terhapus secara permanen.`,
      onConfirm: async () => {
        await apiRequest(`/admin/competitions/${competition.id}`, {
          method: 'DELETE',
        });
        setCompetitions((items) => items.filter((item) => item.id !== competition.id));
      },
    });
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

  const deleteQuestion = (question) => {
    setDeleteTarget({
      title: 'Hapus Soal Ujian',
      description: `Apakah Anda yakin ingin menghapus soal ini "${question.question ? (question.question.length > 80 ? question.question.slice(0, 80) + '...' : question.question) : ''}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        await apiRequest(`/admin/questions/${question.id}`, { method: 'DELETE' });
        setQuestions((items) => items.filter((item) => item.id !== question.id));
      },
    });
  };

  const openCreateTeam = () => {
    setEditingTeam(null);
    setShowTeamForm(true);
  };

  const closeTeamForm = () => {
    setShowTeamForm(false);
    setEditingTeam(null);
  };

  const openEditTeam = (team) => {
    setEditingTeam(team);
    setShowTeamForm(true);
  };

  const saveTeam = async (form) => {
    if (editingTeam) {
      const updated = await apiRequest(`/admin/teams/${editingTeam.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setTeams((items) => items.map((item) => item.id === editingTeam.id ? { ...item, ...updated } : item));
    } else {
      const created = await apiRequest('/admin/teams', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setTeams((items) => [created, ...items]);
    }
    closeTeamForm();
  };

  const deleteTeam = (team) => {
    setDeleteTarget({
      title: 'Hapus Tim',
      description: `Apakah Anda yakin ingin menghapus tim "${team.name}" (Ketua: ${team.leader_name})? Data berkas dan registrasi tim ini akan terhapus secara permanen.`,
      onConfirm: async () => {
        await apiRequest(`/admin/teams/${team.id}`, { method: 'DELETE' });
        setTeams((items) => items.filter((item) => item.id !== team.id));
      },
    });
  };

  return (
    <main className="flex min-h-screen bg-[#f6f8f7] text-[#17324d]">
      <aside
        className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col justify-between overflow-hidden border-r border-teal-900/10 bg-[#073b4c] text-white lg:flex"
      >
        <div className="shrink-0 border-b border-white/10 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white p-1.5 shadow-sm">
              <img src={bescLogo} alt="BESC" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="font-['Plus_Jakarta_Sans'] text-base font-extrabold leading-tight">BESC Control</div>
              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-teal-200">Competition Center</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-1">
          <div className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-teal-200/70">Navigasi Admin</div>
          {menuItems.map((item) => (
            <button key={item} type="button" onClick={() => setActivePage(item)} className={`flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs font-bold transition ${activePage === item ? 'bg-[#06a896] text-white shadow-md shadow-black/10 font-extrabold' : 'text-teal-50/80 hover:bg-white/10 hover:text-white'}`}>
              <span className={`h-2 w-2 shrink-0 rounded-full ${activePage === item ? 'bg-[#ffd166]' : 'border border-current'}`}></span>
              {item}
            </button>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 bg-[#052e3b] p-2.5">
          <div className="flex items-center gap-2 rounded-xl bg-white/10 p-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#ffd166] text-xs font-extrabold text-[#073b4c]">{initials(admin?.name)}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-extrabold leading-tight">{admin?.name}</div>
              <div className="truncate text-[10px] text-teal-200">{admin?.email}</div>
            </div>
            <button type="button" onClick={onLogout} className="rounded-lg bg-red-500/20 px-2 py-1 text-[10px] font-extrabold text-red-200 hover:bg-red-500 hover:text-white transition">Keluar</button>
          </div>
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-5 py-3.5 md:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setMobileNavOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 lg:hidden" aria-label="Buka menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
              </button>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0d9488]">BESC Admin Workspace</div>
                <div className="mt-1 text-sm text-slate-500">{activePage}</div>
              </div>
            </div>
            <button type="button" onClick={onLogout} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-extrabold text-slate-600 lg:hidden">Keluar</button>
          </div>
        </header>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-[70] bg-black/50 lg:hidden" onClick={() => setMobileNavOpen(false)}>
            <div className="h-full w-[260px] bg-[#073b4c] p-5 text-white" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={bescLogo} alt="BESC" className="h-8 w-auto" />
                  <span className="text-sm font-extrabold">Admin</span>
                </div>
                <button type="button" onClick={() => setMobileNavOpen(false)} className="text-white">✕</button>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button key={item} type="button" onClick={() => { setActivePage(item); setMobileNavOpen(false); }} className={`flex h-11 w-full items-center gap-3 rounded-lg px-4 text-left text-sm font-bold transition ${activePage === item ? 'bg-[#06a896] text-white' : 'text-teal-50/80 hover:bg-white/10 hover:text-white'}`}>
                    <span className={`h-2 w-2 rounded-full ${activePage === item ? 'bg-[#ffd166]' : 'border border-current'}`}></span>
                    {item}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

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

          {activePage === 'Peserta' && <DataTable title="Manajemen Peserta" subtitle="Daftar akun peserta yang terhubung ke BESC." searchPlaceholder="Cari nama, email, sekolah, domisili..." headers={['Peserta', 'WhatsApp', 'Sekolah', 'Domisili', 'Tanggal Bergabung', 'Aksi']} rows={participants.map((item) => [
            <div key={item.id} className="flex items-center gap-3"><Avatar src={item.photo} name={item.name} className="shrink-0" /><div><div className="font-bold">{item.name}</div><div className="text-xs text-slate-400">{item.email}</div></div></div>,
            item.phone || '-',
            item.institution || '-',
            [item.city, item.province].filter(Boolean).join(', ') || '-',
            new Date(item.created_at).toLocaleDateString('id-ID'),
            <div key={item.id} className="flex gap-2"><button type="button" onClick={() => setSelectedParticipant(item)} className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-extrabold text-teal-700">Lihat</button><button type="button" onClick={() => deleteParticipant(item)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-extrabold text-red-600">Hapus</button></div>,
          ])} />}

          {activePage === 'Kompetisi' && <DataTable title="Manajemen Kompetisi" subtitle="Kompetisi yang tersimpan pada database BESC." searchPlaceholder="Cari judul, harga, periode, status..." action={<button type="button" onClick={openCreateCompetition} className="rounded-lg bg-[#0d9488] px-4 py-2.5 text-xs font-extrabold text-white">Tambah Kompetisi</button>} headers={['Judul', 'Harga', 'Periode', 'Status', 'Aksi']} rows={competitions.map((item) => [
            <div key={item.id} className="font-bold">{item.title}</div>,
            Number(item.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
            `${new Date(item.start_time).toLocaleDateString('id-ID')} - ${new Date(item.end_time).toLocaleDateString('id-ID')}`,
            <Status key={item.id} value={item.status} />,
            <div key={item.id} className="flex gap-2"><button type="button" onClick={() => openEditCompetition(item)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700">Edit</button><button type="button" onClick={() => deleteCompetition(item)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-extrabold text-red-600">Hapus</button></div>,
          ])} />}

          {activePage === 'Tim' && <>
            <DataTable title="Manajemen Tim" subtitle="Data tim yang terdaftar di BESC 2026." searchPlaceholder="Cari nama tim, ketua, email, institusi, kategori..." headers={['Nama Tim', 'Ketua', 'Institusi', 'Kategori', 'Status', 'Aksi']} rows={teams.map((item) => [
              <div key={item.id} className="max-w-[200px] truncate font-bold">{item.name}</div>,
              <div key={item.id}><div className="font-bold">{item.leader_name}</div><div className="text-xs text-slate-400">{item.leader_email}</div></div>,
              item.institution || '-',
              <Status key={item.id} value={item.category} />,
              <span key={item.id} className={`inline-flex rounded-md px-3 py-1.5 text-[10px] font-extrabold uppercase ${item.status === 'active' ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>{item.status || 'active'}</span>,
              <div key={item.id} className="flex gap-2"><button type="button" onClick={() => setSelectedTeamDetail(item)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700">Lihat</button><button type="button" onClick={() => deleteTeam(item)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-extrabold text-red-600">Hapus</button></div>,
            ])} />
            {selectedTeamDetail && <TeamDetailModal team={selectedTeamDetail} onClose={() => setSelectedTeamDetail(null)} />}
          </>}

          {activePage === 'Pembayaran' && <DataTable title="Verifikasi Pembayaran" subtitle="Ubah status pembayaran peserta. Bukti pembayaran bisa dilihat secara opsional." searchPlaceholder="Cari peserta, email, kompetisi, status pembayaran..." headers={['Peserta', 'Kompetisi', 'Waktu Daftar', 'Bukti', 'Status']} rows={(payments.length > 0 ? payments : (dashboard?.recent_activities || [])).filter((item) => item.payment_status).map((item) => {
            const payDate = new Date(item.created_at);
            const payDateTime = `${payDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}, ${payDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
            return [
              <div key={item.id} className="flex items-center gap-3"><Avatar src={item.user_photo} name={item.user_name} className="shrink-0" /><div><div className="font-bold">{item.user_name}</div><div className="text-xs text-slate-400">{item.user_email}</div></div></div>,
              item.competition_title,
              <span key={item.id} title={payDate.toISOString()} className="whitespace-nowrap">{payDateTime}</span>,
              <div key={item.id} className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => reviewProof(item)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700">Lihat Bukti</button><button type="button" onClick={() => handleDownloadProof(item)} className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-extrabold text-teal-700">Download</button></div>,
              <select key={item.id} value={item.payment_status} disabled={updatingPayment === item.payment_id} onChange={(event) => updatePaymentStatus(item.payment_id, event.target.value)} title="Ubah status pembayaran" className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-600 outline-none disabled:cursor-not-allowed disabled:opacity-50">
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>,
            ];
          })} />}

          {activePage === 'Bank Soal' && <DataTable title="Bank Soal" subtitle="Pilih kompetisi untuk mengelola soal ujian." searchPlaceholder="Cari kompetisi, status, periode..." headers={['Kompetisi', 'Status', 'Periode', 'Aksi']} rows={competitions.map((item) => [
            <div key={item.id} className="font-bold">{item.title}</div>,
            <Status key={item.id} value={item.status} />,
            new Date(item.start_time).toLocaleDateString('id-ID'),
            <button key={item.id} type="button" onClick={() => openQuestions(item)} className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-extrabold text-teal-700">Kelola Soal</button>,
          ])} />}

          {activePage === 'Kelola Soal' && questionCompetition && <QuestionManager competition={questionCompetition} questions={questions} onBack={() => { setQuestionCompetition(null); setActivePage('Bank Soal'); }} onCreate={createQuestion} onDelete={deleteQuestion} onUpdate={updateQuestion} />}

          {activePage === 'Hasil Ujian' && <DataTable title="Hasil Ujian Otomatis" subtitle="Peringkat dihitung per kompetisi dari skor tertinggi lalu waktu tercepat." searchPlaceholder="Cari peserta, email, kompetisi, status..." headers={['Peringkat', 'Peserta', 'Kompetisi', 'Benar', 'Salah', 'Terjawab', 'Tidak Dijawab', 'Total Soal', 'Skor', 'Waktu Pengerjaan', 'Status']} rows={rankedSubmissions.map((item) => [
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
      {proofActivity && <ProofModal activity={proofActivity} onClose={() => setProofActivity(null)} onDownload={handleDownloadProof} />}
      {deleteTarget && <ConfirmDeleteModal deleteTarget={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} isDeleting={isDeleting} />}
    </main>
  );
}

const getSearchText = (value) => {
  if (value === null || value === undefined || typeof value === 'boolean') return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(getSearchText).join(' ');
  if (value?.type === 'select') return getSearchText(value.props?.value);
  if (value?.props) return [value.props.children, value.props.value, value.props.title].map(getSearchText).join(' ');
  return '';
};

function DataTable({ action, headers, rows, searchPlaceholder = 'Cari data...', subtitle, title }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => getSearchText(row).toLowerCase().includes(query));
  }, [rows, search]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startItem = filteredRows.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, filteredRows.length);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <section className="border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-extrabold">{title}</h1>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-500 sm:w-80"
          />
          {action}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-[#f3f8f7]">
            <tr>{headers.map((header) => <th key={header} className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{header}</th>)}</tr>
          </thead>
          <tbody>{visibleRows.map((row, rowIndex) => <tr key={`${safePage}-${rowIndex}`} className="border-t border-slate-100">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-6 py-4 text-sm text-slate-600">{cell}</td>)}</tr>)}</tbody>
        </table>
        {filteredRows.length === 0 && <div className="px-6 py-14 text-center text-sm font-semibold text-slate-400">Belum ada data untuk ditampilkan.</div>}
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Menampilkan {startItem}-{endItem} dari {filteredRows.length} data</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40">Sebelumnya</button>
          <span className="grid h-9 min-w-16 place-items-center rounded-lg bg-slate-50 px-3 font-bold text-[#17324d]">{safePage}/{pageCount}</span>
          <button type="button" disabled={safePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40">Berikutnya</button>
        </div>
      </div>
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-sm" onClick={onClose}>
      <section className="relative my-4 sm:my-6 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-teal-50 font-extrabold text-teal-700 text-sm">
              {normalizePhotoSrc(participant.photo) ? <img src={normalizePhotoSrc(participant.photo)} alt={participant.name} className="h-full w-full object-cover" /> : initials(participant.name)}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">{participant.name}</h2>
              <p className="text-xs text-slate-500 font-medium">Profil Peserta BESC</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200/70 text-slate-600 hover:bg-slate-300 hover:text-slate-900 transition text-sm font-bold">✕</button>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {fields.map(([label, value]) => <Setting key={label} label={label} value={value} />)}
          </div>
          <div className="mt-5 flex items-center justify-between gap-2.5 border-t border-slate-100 pt-4">
            <div>
              {normalizePhotoSrc(participant.photo) && (
                <button
                  type="button"
                  onClick={() => downloadFileFromUrl(normalizePhotoSrc(participant.photo), `foto-profil-${(participant.name || 'peserta').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`)}
                  className="rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2 text-xs font-bold text-teal-700 hover:bg-teal-100 transition inline-flex items-center gap-1.5"
                >
                  <span>📥</span> Unduh Foto
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">Tutup</button>
              <button type="button" onClick={onDelete} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition">Hapus Peserta</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
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
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-sm">
      <div className="mx-auto my-4 sm:my-6 grid w-full max-w-6xl gap-5 lg:grid-cols-[1fr_400px]">
        <form onSubmit={submit} className="rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100">
          <div className="flex justify-between items-start pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{isEditMode ? 'Edit Kompetisi' : 'Tambah Kompetisi'}</h2>
              <p className="mt-0.5 text-xs text-slate-500">Lengkapi informasi yang akan tampil pada kartu kompetisi.</p>
            </div>
            <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-sm font-bold">✕</button>
          </div>
          {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>}
          <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
            <FormField label="Judul"><input className={input} value={form.title} onChange={(e) => update('title', e.target.value)} required /></FormField>
            <FormField label="Slug"><input className={input} value={form.slug} onChange={(e) => update('slug', e.target.value)} required /></FormField>
            <FormField label="Kategori"><input className={input} value={form.category} onChange={(e) => update('category', e.target.value)} required /></FormField>
            <FormField label="Jenjang"><select className={input} value={form.level} onChange={(e) => update('level', e.target.value)}><option>SMP</option><option>SMA</option><option>Umum</option></select></FormField>
            <FormField label="Badge (pisahkan koma)"><input className={input} value={form.badges} onChange={(e) => update('badges', e.target.value)} /></FormField>
            <FormField label="Kuota Peserta"><input className={input} type="number" min="0" value={form.quota} onChange={(e) => update('quota', e.target.value)} /></FormField>
            <FormField label="Harga Promo"><input className={input} type="number" min="0" value={form.price} onChange={(e) => update('price', e.target.value)} /></FormField>
            <FormField label="Harga Asli"><input className={input} type="number" min="0" value={form.original_price} onChange={(e) => update('original_price', e.target.value)} /></FormField>
            <FormField label="Durasi Ujian (menit)"><input className={input} type="number" min="1" max="600" value={form.duration_minutes} onChange={(e) => update('duration_minutes', e.target.value)} required /></FormField>
            <FormField label="Batas Tab Switch"><input className={input} type="number" min="1" max="20" value={form.tab_switch_limit} onChange={(e) => update('tab_switch_limit', e.target.value)} required /></FormField>
            <FormField label="Mulai Kompetisi"><input className={input} type="datetime-local" value={form.start_time} onChange={(e) => update('start_time', e.target.value)} required /></FormField>
            <FormField label="Selesai Kompetisi"><input className={input} type="datetime-local" value={form.end_time} onChange={(e) => update('end_time', e.target.value)} required /></FormField>
            <FormField label="Deadline Pendaftaran"><input className={input} type="datetime-local" value={form.registration_deadline} onChange={(e) => update('registration_deadline', e.target.value)} /></FormField>
            <FormField label="Status"><select className={input} value={form.status} onChange={(e) => update('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option></select></FormField>
            <div className="sm:col-span-2"><FormField label="Deskripsi"><textarea className="min-h-20 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-teal-500" value={form.description} onChange={(e) => update('description', e.target.value)} required /></FormField></div>
            <div className="sm:col-span-2"><FormField label="Persyaratan Peserta"><textarea className="min-h-24 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-teal-500" value={form.participant_requirements} onChange={(e) => update('participant_requirements', e.target.value)} placeholder={'Peserta merupakan siswa aktif SMA/MA/SMK sederajat\nProfil peserta wajib diisi lengkap\nPeserta wajib mengunggah bukti pembayaran\nPeserta wajib mengikuti technical meeting'} /><p className="mt-1.5 text-xs font-semibold text-slate-500">Tulis satu persyaratan pada setiap baris.</p></FormField></div>
            <div className="sm:col-span-2"><FormField label="Banner Kompetisi"><input type="file" accept="image/*" onChange={imageUpload} required={!isEditMode && !form.banner} />{isEditMode && form.banner && <div className="mt-1.5 text-xs font-semibold text-slate-500">Banner lama tetap digunakan jika tidak memilih file baru.</div>}</FormField></div>
          </div>
          <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-[#0d9488] px-5 py-2 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50">{saving ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Kompetisi'}</button>
          </div>
        </form>
        <CompetitionPreview form={form} />
      </div>
    </div>
  );
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
  const input = 'h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100';
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={submit} className="relative my-4 sm:my-6 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100" onClick={(event) => event.stopPropagation()}>
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/90 px-5 py-3.5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">{question.id ? 'Edit Soal' : 'Tambah Soal'}</h3>
            <p className="mt-0.5 text-xs text-slate-500">Lengkapi pertanyaan, pilihan jawaban, dan kunci jawaban.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200/70 text-slate-600 hover:bg-slate-300 text-sm font-bold">✕</button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <FormField label="Pertanyaan"><textarea className="min-h-20 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.question} onChange={(e) => update('question', e.target.value)} required /></FormField>
          <FormField label="Gambar Soal (opsional)"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={imageUpload} />{form.image && <div className="mt-2.5 flex items-start gap-3"><img src={form.image} alt="Preview gambar soal" className="max-h-40 max-w-full rounded-lg border border-slate-200 object-contain" /><button type="button" onClick={() => update('image', '')} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">Hapus gambar</button></div>}</FormField>
          <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
            {['a','b','c','d','e'].map((key) => <FormField key={key} label={`Pilihan ${key.toUpperCase()}`}><input className={input} value={form[`option_${key}`]} onChange={(e) => update(`option_${key}`, e.target.value)} required /></FormField>)}
            <FormField label="Kunci Jawaban"><select className={input} value={form.correct_answer} onChange={(e) => update('correct_answer', e.target.value)}>{['A','B','C','D','E'].map((value) => <option key={value}>{value}</option>)}</select></FormField>
            <FormField label="Bobot Benar (+)"><input className={input} type="number" min="1" value={form.score} onChange={(e) => update('score', e.target.value)} required /></FormField>
            <FormField label="Bobot Salah (-)"><input className={input} type="number" min="0" value={form.wrong_score} onChange={(e) => update('wrong_score', e.target.value)} required /></FormField>
          </div>
        </div>
        <footer className="flex shrink-0 justify-end gap-2.5 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">Batal</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#0d9488] px-5 py-2 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Soal'}</button>
        </footer>
      </form>
    </div>
  );
}

function ProofModal({ activity, onClose, onDownload }) {
  const [opening, setOpening] = useState(false);

  const handleOpenFull = async () => {
    setOpening(true);
    try {
      const response = await fetch(getProofURL(activity), { credentials: 'include' });
      if (!response.ok) throw new Error('Gagal membuka bukti.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      window.open(getProofURL(activity), '_blank');
    } finally {
      setOpening(false);
    }
  };

  const payDate = new Date(activity.created_at);
  const payDateTime = `${payDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}, ${payDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150" onClick={onClose}>
      <section className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150" onClick={(event) => event.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/90 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-xl text-teal-700">
              🧾
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">Bukti Pembayaran</h2>
              <p className="mt-0.5 text-xs text-slate-500 font-medium truncate max-w-[220px]">{activity.competition_title}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200/70 text-slate-600 hover:bg-slate-300 hover:text-slate-900 transition text-sm font-bold">✕</button>
        </div>

        {/* Info Content */}
        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 font-semibold shrink-0">Nama Peserta:</span>
              <span className="font-extrabold text-slate-900 truncate">{activity.user_name}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 font-semibold shrink-0">Email:</span>
              <span className="font-bold text-slate-700 truncate">{activity.user_email}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 font-semibold shrink-0">Waktu Daftar:</span>
              <span className="font-bold text-slate-700">{payDateTime}</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
              <span className="text-slate-500 font-semibold">Status:</span>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${activity.payment_status === 'verified' ? 'bg-emerald-100 text-emerald-800' : activity.payment_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                {activity.payment_status || 'Pending'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed text-center">
            Pilih opsi di bawah untuk mengunduh bukti transfer atau melihatnya dalam ukuran penuh.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Tutup
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDownload(activity)}
                className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition inline-flex items-center gap-1.5"
              >
                <span>📥</span> Unduh Bukti
              </button>
              <button
                type="button"
                disabled={opening}
                onClick={handleOpenFull}
                className="rounded-xl bg-[#0d9488] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-900/10 hover:bg-teal-700 transition inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>↗</span> {opening ? 'Membuka...' : 'Lihat Penuh'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ConfirmDeleteModal({ deleteTarget, onClose, onConfirm, isDeleting }) {
  if (!deleteTarget) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150" onClick={!isDeleting ? onClose : undefined}>
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-100 text-red-600 text-2xl shadow-sm">
            ⚠️
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
              {deleteTarget.title || 'Konfirmasi Hapus'}
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
              {deleteTarget.description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/25 hover:bg-red-700 transition disabled:opacity-50"
          >
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}
