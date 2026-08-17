import { Suspense, lazy, useEffect, useState, Component } from 'react';
import { apiRequest, clearAuthSession, safeSetItem, saveAuthSession } from './lib/api.js';

const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const hasRefreshed = sessionStorage.getItem('chunk_retry');
    try {
      const component = await componentImport();
      sessionStorage.removeItem('chunk_retry');
      return component;
    } catch (error) {
      if (!hasRefreshed) {
        sessionStorage.setItem('chunk_retry', '1');
        window.location.reload();
        return { default: () => null };
      }
      throw error;
    }
  });

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error) {
    if (error?.message?.includes('dynamically imported') || error?.message?.includes('Failed to fetch')) {
      const hasReloaded = sessionStorage.getItem('chunk_reload');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_reload', '1');
        window.location.reload();
      }
    }
  }
  handleReset = () => {
    try {
      localStorage.removeItem('besc_competitions_cache');
      localStorage.removeItem('besc_competitions_cache_time');
      sessionStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-red-50 text-3xl">⚠️</div>
            <h2 className="text-xl font-extrabold text-slate-900">Terjadi Kesalahan</h2>
            <p className="mt-2 text-sm text-slate-500">Aplikasi sedang diperbarui. Silakan muat ulang halaman.</p>
            <button onClick={this.handleReset} className="mt-5 rounded-xl bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:opacity-90 transition">Muat Ulang</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const HomePage = lazyWithRetry(() => import('./pages/HomePage.jsx'));
const RegisterPage = lazyWithRetry(() => import('./pages/RegisterPage.jsx'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage.jsx'));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage.jsx'));
const OlimpiadePage = lazyWithRetry(() => import('./pages/OlimpiadePage.jsx'));
const CompetitionDetailPage = lazyWithRetry(() => import('./pages/CompetitionDetailPage.jsx'));
const EventRegistrationPage = lazyWithRetry(() => import('./pages/EventRegistrationPage.jsx'));
const EventRegistrationSuccessPage = lazyWithRetry(() => import('./pages/EventRegistrationSuccessPage.jsx'));
const AdminDashboardPage = lazyWithRetry(() => import('./pages/AdminDashboardPage.jsx'));
const ExamRulesPage = lazyWithRetry(() => import('./pages/ExamRulesPage.jsx'));
const ExamPage = lazyWithRetry(() => import('./pages/ExamPage.jsx'));
const ForgotPasswordPage = lazyWithRetry(() => import('./pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazyWithRetry(() => import('./pages/ResetPasswordPage.jsx'));

const Loading = () => (
  <div className="grid min-h-screen place-items-center bg-slate-50">
    <div className="text-center">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#1c79c6] border-t-transparent"></div>
      <p className="text-sm font-bold text-slate-400">Memuat...</p>
    </div>
  </div>
);

const getPageFromHash = () => {
  if (window.location.hash === '#daftar') return 'register';
  if (window.location.hash === '#login') return 'login';
  if (window.location.hash === '#profile') return 'profile';
  if (window.location.hash === '#olimpiade') return 'olimpiade';
  if (window.location.hash === '#detail-kompetisi') return 'competition-detail';
  if (window.location.hash === '#pendaftaran-event') return 'event-registration';
  if (window.location.hash === '#pendaftaran-berhasil') return 'event-registration-success';
  if (window.location.hash === '#admin-login') return 'login';
  if (window.location.hash === '#admin-dashboard') return 'admin-dashboard';
  if (window.location.hash === '#ketentuan-ujian') return 'exam-rules';
  if (window.location.hash === '#kerjakan-soal') return 'exam';
  if (window.location.hash.startsWith('#forgot-password')) return 'forgot-password';
  if (window.location.hash.startsWith('#reset-password')) return 'reset-password';
  return 'home';
};

const pageHashes = ['#home', '#daftar', '#login', '#profile', '#olimpiade', '#detail-kompetisi', '#pendaftaran-event', '#pendaftaran-berhasil', '#admin-login', '#admin-dashboard', '#ketentuan-ujian', '#kerjakan-soal'];

const isProfileComplete = (currentUser) => Boolean(currentUser?.profile_complete);

const profileStorageKey = (currentUser) => `besc_profile_${currentUser?.id || currentUser?.email || 'guest'}`;

const removeProfileCache = (currentUser) => {
  localStorage.removeItem(profileStorageKey(currentUser));
};

export default function App() {
  const [page, setPage] = useState(getPageFromHash);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('besc_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authChecked, setAuthChecked] = useState(false);
  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem('besc_admin');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });
  const [competitionIndex, setCompetitionIndex] = useState(() => Number(localStorage.getItem('besc_competition_index') ?? 0));
  const [registeredEventTitle, setRegisteredEventTitle] = useState(() => localStorage.getItem('besc_registered_event') || 'kompetisi BESC');
  const [registrations, setRegistrations] = useState([]);
  const [apiCompetitions, setApiCompetitions] = useState([]);
  const [competitionsLoading, setCompetitionsLoading] = useState(false);
  const [examCompetition, setExamCompetition] = useState(() => {
    const savedCompetition = localStorage.getItem('besc_exam_competition');
    return savedCompetition ? JSON.parse(savedCompetition) : null;
  });

  useEffect(() => {
    if (window.location.hash !== '#reset-session') return;
    ['besc_user', 'besc_admin', 'besc_token', 'besc_admin_token', 'besc_after_profile', 'besc_after_login'].forEach((key) => localStorage.removeItem(key));
    Object.keys(localStorage).filter((key) => key.startsWith('besc_profile_')).forEach((key) => localStorage.removeItem(key));
    setUser(null);
    setAuthChecked(true);
    window.location.hash = 'login';
    setPage('login');
  }, []);

  useEffect(() => {
    localStorage.removeItem('besc_token');
    localStorage.removeItem('besc_admin_token');
    apiRequest('/auth/me')
      .then((serverUser) => {
        if (serverUser.role === 'admin') {
          safeSetItem('besc_admin', JSON.stringify(serverUser));
          localStorage.removeItem('besc_user');
          setAdmin(serverUser);
          setUser(null);
          return;
        }
        safeSetItem('besc_user', JSON.stringify(serverUser));
        localStorage.removeItem('besc_admin');
        setUser(serverUser);
        setAdmin(null);
      })
      .catch(() => {
        clearAuthSession();
        setUser(null);
        setAdmin(null);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash;
      setPage(getPageFromHash());
      if (pageHashes.includes(currentHash)) {
        window.scrollTo(0, 0);
        return;
      }
      requestAnimationFrame(() => {
        document.getElementById(currentHash.replace('#', ''))?.scrollIntoView();
      });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!['home', 'olimpiade', 'competition-detail', 'event-registration'].includes(page)) return;
    const cached = localStorage.getItem('besc_competitions_cache');
    const cacheTime = localStorage.getItem('besc_competitions_cache_time');
    if (cached && cacheTime && Date.now() - Number(cacheTime) < 300000) {
      try { setApiCompetitions(JSON.parse(cached)); } catch {}
    }
    setCompetitionsLoading(true);
    apiRequest('/competitions?limit=100')
      .then((data) => { setApiCompetitions(data); try { safeSetItem('besc_competitions_cache', JSON.stringify(data)); safeSetItem('besc_competitions_cache_time', String(Date.now())); } catch {} })
      .catch(() => setApiCompetitions([]))
      .finally(() => setCompetitionsLoading(false));
  }, [page]);

  useEffect(() => {
    if (!user || user.role === 'admin') {
      setRegistrations([]);
      return;
    }
    if (!['home', 'olimpiade', 'competition-detail', 'event-registration', 'event-registration-success', 'exam-rules'].includes(page)) return;
    apiRequest('/me/competitions?limit=100')
      .then(setRegistrations)
      .catch(() => setRegistrations([]));
  }, [user, page]);

  useEffect(() => {
    if (page === 'login' || page === 'admin-login') {
      if (admin) {
        window.location.replace('#admin-dashboard');
        setPage('admin-dashboard');
      } else if (user) {
        window.location.replace('#home');
        setPage('home');
      }
    }
  }, [page, admin, user]);

  const openRegister = () => { window.location.hash = 'daftar'; window.scrollTo(0, 0); setPage('register'); };
  const openCompetitions = () => {
    const scrollTo = () => document.getElementById('kompetisi')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (page !== 'home') { window.location.hash = 'kompetisi'; setPage('home'); window.setTimeout(scrollTo, 0); return; }
    if (window.location.hash !== '#kompetisi') window.location.hash = 'kompetisi';
    scrollTo();
  };
  const openLogin = () => { window.location.hash = 'login'; window.scrollTo(0, 0); setPage('login'); };
  const backHome = () => { window.location.hash = 'home'; window.scrollTo(0, 0); setPage('home'); };
  const openProfile = () => { localStorage.removeItem('besc_after_profile'); window.location.hash = 'profile'; window.scrollTo(0, 0); setPage('profile'); };
  const openOlimpiade = () => { window.location.hash = 'olimpiade'; window.scrollTo(0, 0); setPage('olimpiade'); };
  const openCompetitionDetail = (index = 0) => { safeSetItem('besc_competition_index', String(index)); setCompetitionIndex(index); window.location.hash = 'detail-kompetisi'; window.scrollTo(0, 0); setPage('competition-detail'); };
  const openEventRegistration = (resumeRejected = false) => {
    if (resumeRejected) {
      safeSetItem('besc_resume_rejected', '1');
    } else {
      localStorage.removeItem('besc_resume_rejected');
    }
    if (!user) { safeSetItem('besc_after_login', 'event-registration'); window.location.hash = 'login'; window.scrollTo(0, 0); setPage('login'); return; }
    window.location.hash = 'pendaftaran-event'; window.scrollTo(0, 0); setPage('event-registration');
  };

  const handleAuthSuccess = (auth) => {
    if (auth.user?.role === 'admin') { handleAdminLoginSuccess(auth); return; }
    saveAuthSession(auth); setUser(auth.user); setAuthChecked(true);
    const afterLogin = localStorage.getItem('besc_after_login'); localStorage.removeItem('besc_after_login');
    if (afterLogin === 'event-registration') {
      if (isProfileComplete(auth.user)) { window.location.replace('#pendaftaran-event'); window.scrollTo(0, 0); setPage('event-registration'); return; }
      safeSetItem('besc_after_profile', 'event-registration'); window.location.replace('#profile'); window.scrollTo(0, 0); setPage('profile'); return;
    }
    window.location.replace('#home');
    window.scrollTo(0, 0);
    setPage('home');
  };
  const handleRegisterSuccess = (auth) => { clearAuthSession(); setUser(null); localStorage.removeItem('besc_after_profile'); localStorage.removeItem('besc_after_login'); window.location.replace('#login'); window.scrollTo(0, 0); setPage('login'); };
  const handleRegistrationSuccess = (eventTitle) => { 
    safeSetItem('besc_registered_event', eventTitle); 
    setRegisteredEventTitle(eventTitle); 
    // Refresh registrations after successful registration
    if (user) {
      apiRequest('/me/competitions?limit=100')
        .then(setRegistrations)
        .catch(() => setRegistrations([]));
    }
    window.location.hash = 'pendaftaran-berhasil'; 
    window.scrollTo(0, 0); 
    setPage('event-registration-success'); 
  };
  const openExamRules = (competition) => { safeSetItem('besc_exam_competition', JSON.stringify(competition)); setExamCompetition(competition); window.location.hash = 'ketentuan-ujian'; window.scrollTo(0, 0); setPage('exam-rules'); };
  const startExam = () => { window.location.hash = 'kerjakan-soal'; window.scrollTo(0, 0); setPage('exam'); };
  const handleLogout = async () => { await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {}); removeProfileCache(user); clearAuthSession(); setUser(null); setAuthChecked(true); window.location.replace('#home'); setPage('home'); };
  const handleAdminLoginSuccess = (auth) => { localStorage.removeItem('besc_token'); localStorage.removeItem('besc_admin_token'); safeSetItem('besc_admin', JSON.stringify(auth.user)); localStorage.removeItem('besc_user'); setUser(null); setAdmin(auth.user); window.location.replace('#admin-dashboard'); window.scrollTo(0, 0); setPage('admin-dashboard'); };
  const handleAdminLogout = async () => { await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {}); localStorage.removeItem('besc_admin_token'); localStorage.removeItem('besc_admin'); setAdmin(null); window.location.replace('#admin-login'); window.scrollTo(0, 0); setPage('admin-login'); };
  const handleSaveProfile = (profile) => {
    const updatedUser = {
      ...user,
      ...profile.backendUser,
      name: profile.fullName || user?.name,
      photo: profile.backendUser?.photo || user?.photo,
      phone: profile.whatsapp || user?.phone,
      institution: profile.school || user?.institution,
      birth_date: profile.birthDate || user?.birth_date,
      gender: profile.gender || user?.gender,
      province: profile.province || user?.province,
      city: profile.city || user?.city,
      student_card: profile.cardPhoto || user?.student_card,
      team_name: profile.teamName || user?.team_name,
      member1_name: profile.member1Name || user?.member1_name,
      member2_name: profile.member2Name || user?.member2_name,
    };
    safeSetItem('besc_user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    const afterProfile = localStorage.getItem('besc_after_profile');
    localStorage.removeItem('besc_after_profile');
    if (afterProfile === 'event-registration' && window.location.hash === '#pendaftaran-event') {
      window.location.replace('#pendaftaran-event');
      window.scrollTo(0, 0);
      setPage('event-registration');
    }
  };

  const openForgotPassword = () => { window.location.hash = 'forgot-password'; window.scrollTo(0, 0); setPage('forgot-password'); };
  const openResetPassword = () => { window.location.hash = 'reset-password'; window.scrollTo(0, 0); setPage('reset-password'); };

  if (page === 'forgot-password') return <Suspense fallback={<Loading />}><ForgotPasswordPage onBack={openLogin} onLogin={openLogin} /></Suspense>;
  if (page === 'reset-password') return <Suspense fallback={<Loading />}><ResetPasswordPage onBack={openLogin} onLogin={openLogin} /></Suspense>;
  if (page === 'register') return <Suspense fallback={<Loading />}><RegisterPage onLogin={openLogin} onRegisterSuccess={handleRegisterSuccess} /></Suspense>;
  if (page === 'login') return <Suspense fallback={<Loading />}><LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleAuthSuccess} /></Suspense>;
  if (page === 'admin-login') return <Suspense fallback={<Loading />}><LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleAuthSuccess} /></Suspense>;
  if (page === 'admin-dashboard') { if (!authChecked) return <Loading />; if (!admin) return <Suspense fallback={<Loading />}><LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleAuthSuccess} /></Suspense>; return <Suspense fallback={<Loading />}><AdminDashboardPage admin={admin} onLogout={handleAdminLogout} /></Suspense>; }
  if (page === 'profile') { if (!authChecked) return null; if (!user) return <LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleAuthSuccess} />; return <ProfilePage onLogin={openLogin} onLogout={handleLogout} onOlimpiade={openOlimpiade} onProfile={openProfile} onRegister={openRegister} onSaveProfile={handleSaveProfile} user={user} />; }
  if (page === 'olimpiade') return <OlimpiadePage competitions={apiCompetitions} competitionsLoading={competitionsLoading} onCompetitionDetail={openCompetitionDetail} onLogin={openLogin} onLogout={handleLogout} onOlimpiade={openOlimpiade} onProfile={openProfile} onRegister={openRegister} onVerifiedCompetition={openExamRules} registrations={registrations} user={user} />;
  if (page === 'competition-detail') return <CompetitionDetailPage competitionIndex={competitionIndex} competitions={apiCompetitions} onCompetitionDetail={openCompetitionDetail} onLogin={openLogin} onLogout={handleLogout} onOlimpiade={openOlimpiade} onProfile={openProfile} onRegister={openRegister} onEventRegistration={openEventRegistration} onVerifiedCompetition={openExamRules} registrations={registrations} user={user} />;
  if (page === 'event-registration') { if (!authChecked) return null; if (!user) return <LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleAuthSuccess} />; if (!isProfileComplete(user)) { safeSetItem('besc_after_profile', 'event-registration'); return <ProfilePage onLogin={openLogin} onLogout={handleLogout} onOlimpiade={openOlimpiade} onProfile={openProfile} onRegister={openRegister} onSaveProfile={handleSaveProfile} user={user} />; } return <EventRegistrationPage competitionIndex={competitionIndex} competitions={apiCompetitions} onLogin={openLogin} onLogout={handleLogout} onOlimpiade={openOlimpiade} onProfile={openProfile} onRegister={openRegister} onRegistrationSuccess={handleRegistrationSuccess} registrations={registrations} user={user} />; }
  if (page === 'event-registration-success') return <EventRegistrationSuccessPage eventTitle={registeredEventTitle} onHome={backHome} onOlimpiade={openOlimpiade} />;
  if (page === 'exam-rules') { if (!examCompetition) { window.location.hash = 'home'; return null; } return <ExamRulesPage competition={examCompetition} onBack={backHome} onStart={startExam} />; }
  if (page === 'exam') { if (!examCompetition) { window.location.hash = 'home'; return null; } return <ExamPage competition={examCompetition} onFinish={backHome} />; }
  return <HomePage competitions={apiCompetitions} competitionsLoading={competitionsLoading} onCompetitionDetail={openCompetitionDetail} onCompetitions={openCompetitions} onRegister={openRegister} onLogin={openLogin} onLogout={handleLogout} onOlimpiade={openOlimpiade} onProfile={openProfile} onVerifiedCompetition={openExamRules} registrations={registrations} user={user} />;
}
