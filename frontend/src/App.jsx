import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import OlimpiadePage from './pages/OlimpiadePage.jsx';
import CompetitionDetailPage from './pages/CompetitionDetailPage.jsx';
import EventRegistrationPage from './pages/EventRegistrationPage.jsx';
import EventRegistrationSuccessPage from './pages/EventRegistrationSuccessPage.jsx';
import TryoutPackagePage from './pages/TryoutPackagePage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import ExamRulesPage from './pages/ExamRulesPage.jsx';
import ExamPage from './pages/ExamPage.jsx';
import { apiRequest, clearAuthSession, saveAuthSession } from './lib/api.js';

const getPageFromHash = () => {
  if (window.location.hash === '#daftar') return 'register';
  if (window.location.hash === '#login') return 'login';
  if (window.location.hash === '#profile') return 'profile';
  if (window.location.hash === '#olimpiade') return 'olimpiade';
  if (window.location.hash === '#detail-kompetisi') return 'competition-detail';
  if (window.location.hash === '#pendaftaran-event') return 'event-registration';
  if (window.location.hash === '#pendaftaran-berhasil') return 'event-registration-success';
  if (window.location.hash === '#paket-tryout') return 'tryout-package';
  if (window.location.hash === '#tryout-page') return 'home';
  if (window.location.hash === '#admin-login') return 'login';
  if (window.location.hash === '#admin-dashboard') return 'admin-dashboard';
  if (window.location.hash === '#ketentuan-ujian') return 'exam-rules';
  if (window.location.hash === '#kerjakan-soal') return 'exam';
  return 'home';
};

const pageHashes = ['#home', '#daftar', '#login', '#profile', '#olimpiade', '#detail-kompetisi', '#pendaftaran-event', '#pendaftaran-berhasil', '#paket-tryout', '#tryout-page', '#admin-login', '#admin-dashboard', '#ketentuan-ujian', '#kerjakan-soal'];

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
          localStorage.setItem('besc_admin', JSON.stringify(serverUser));
          localStorage.removeItem('besc_user');
          setAdmin(serverUser);
          setUser(null);
          return;
        }
        localStorage.setItem('besc_user', JSON.stringify(serverUser));
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
    if (!['home', 'olimpiade', 'competition-detail', 'event-registration', 'tryout-package'].includes(page)) return;
    setCompetitionsLoading(true);
    apiRequest('/competitions?limit=100')
      .then(setApiCompetitions)
      .catch(() => setApiCompetitions([]))
      .finally(() => setCompetitionsLoading(false));
  }, [page]);

  useEffect(() => {
    if (!user || user.role === 'admin') {
      setRegistrations([]);
      return;
    }
    if (!['home', 'olimpiade', 'competition-detail', 'event-registration', 'exam-rules'].includes(page)) return;
    apiRequest('/me/competitions?limit=100')
      .then(setRegistrations)
      .catch(() => setRegistrations([]));
  }, [user, page]);

  const openRegister = () => {
    window.location.hash = 'daftar';
    window.scrollTo(0, 0);
    setPage('register');
  };

  const openCompetitions = () => {
    const scrollToCompetitions = () => {
      document.getElementById('kompetisi')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (page !== 'home') {
      window.location.hash = 'kompetisi';
      setPage('home');
      window.setTimeout(scrollToCompetitions, 0);
      return;
    }

    if (window.location.hash !== '#kompetisi') {
      window.location.hash = 'kompetisi';
    }
    scrollToCompetitions();
  };

  const openLogin = () => {
    window.location.hash = 'login';
    window.scrollTo(0, 0);
    setPage('login');
  };

  const backHome = () => {
    window.location.hash = 'home';
    window.scrollTo(0, 0);
    setPage('home');
  };

  const openProfile = () => {
    localStorage.removeItem('besc_after_profile');
    window.location.hash = 'profile';
    window.scrollTo(0, 0);
    setPage('profile');
  };

  const openOlimpiade = () => {
    window.location.hash = 'olimpiade';
    window.scrollTo(0, 0);
    setPage('olimpiade');
  };

  const openCompetitionDetail = (index = 0) => {
    localStorage.setItem('besc_competition_index', String(index));
    setCompetitionIndex(index);
    window.location.hash = 'detail-kompetisi';
    window.scrollTo(0, 0);
    setPage('competition-detail');
  };

  const openEventRegistration = () => {
    if (!user) {
      localStorage.setItem('besc_after_login', 'event-registration');
      window.location.hash = 'login';
      window.scrollTo(0, 0);
      setPage('login');
      return;
    }

    window.location.hash = 'pendaftaran-event';
    window.scrollTo(0, 0);
    setPage('event-registration');
  };

  const openTryoutPackage = () => {
    window.location.hash = 'paket-tryout';
    window.scrollTo(0, 0);
    setPage('tryout-package');
  };

  const openTryout = () => {
    openTryoutPackage();
  };

  const handleAuthSuccess = (auth) => {
    if (auth.user?.role === 'admin') {
      handleAdminLoginSuccess(auth);
      return;
    }

    saveAuthSession(auth);
    setUser(auth.user);
    setAuthChecked(true);
    const afterLogin = localStorage.getItem('besc_after_login');
    localStorage.removeItem('besc_after_login');

    if (afterLogin === 'event-registration') {
      if (isProfileComplete(auth.user)) {
        window.location.hash = 'pendaftaran-event';
        window.scrollTo(0, 0);
        setPage('event-registration');
        return;
      }
      localStorage.setItem('besc_after_profile', 'event-registration');
      window.location.hash = 'profile';
      window.scrollTo(0, 0);
      setPage('profile');
      return;
    }

    backHome();
  };

  const handleRegisterSuccess = (auth) => {
    clearAuthSession();
    setUser(null);
    localStorage.removeItem('besc_after_profile');
    localStorage.removeItem('besc_after_login');
    window.location.hash = 'login';
    window.scrollTo(0, 0);
    setPage('login');
  };

  const handleRegistrationSuccess = (eventTitle) => {
    localStorage.setItem('besc_registered_event', eventTitle);
    setRegisteredEventTitle(eventTitle);
    window.location.hash = 'pendaftaran-berhasil';
    window.scrollTo(0, 0);
    setPage('event-registration-success');
  };

  const openExamRules = (competition) => {
    localStorage.setItem('besc_exam_competition', JSON.stringify(competition));
    setExamCompetition(competition);
    window.location.hash = 'ketentuan-ujian';
    window.scrollTo(0, 0);
    setPage('exam-rules');
  };

  const startExam = () => {
    window.location.hash = 'kerjakan-soal';
    window.scrollTo(0, 0);
    setPage('exam');
  };

  const handleLogout = async () => {
    await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    removeProfileCache(user);
    clearAuthSession();
    setUser(null);
    setAuthChecked(true);
    backHome();
  };

  const handleAdminLoginSuccess = (auth) => {
    localStorage.removeItem('besc_token');
    localStorage.removeItem('besc_admin_token');
    localStorage.setItem('besc_admin', JSON.stringify(auth.user));
    localStorage.removeItem('besc_user');
    setUser(null);
    setAdmin(auth.user);
    window.location.hash = 'admin-dashboard';
    window.scrollTo(0, 0);
    setPage('admin-dashboard');
  };

  const handleAdminLogout = async () => {
    await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('besc_admin_token');
    localStorage.removeItem('besc_admin');
    setAdmin(null);
    window.location.hash = 'admin-login';
    window.scrollTo(0, 0);
    setPage('admin-login');
  };

  const handleSaveProfile = (profile) => {
    const updatedUser = { ...user, ...profile.backendUser };
    localStorage.setItem('besc_user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    const afterProfile = localStorage.getItem('besc_after_profile');
    localStorage.removeItem('besc_after_profile');
    if (afterProfile === 'event-registration' && window.location.hash === '#pendaftaran-event') {
      window.location.hash = 'pendaftaran-event';
      window.scrollTo(0, 0);
      setPage('event-registration');
    }
  };

  if (page === 'register') {
    return <RegisterPage onLogin={openLogin} onRegisterSuccess={handleRegisterSuccess} />;
  }

  if (page === 'login') {
    return <LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleAuthSuccess} />;
  }

  if (page === 'admin-login') {
    return <LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleAuthSuccess} />;
  }

  if (page === 'admin-dashboard') {
    if (!authChecked) {
      return null;
    }
    if (!admin) {
      return <LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleAuthSuccess} />;
    }

    return <AdminDashboardPage admin={admin} onLogout={handleAdminLogout} />;
  }

  if (page === 'profile') {
    if (!authChecked) {
      return null;
    }
    if (!user) {
      return <LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleAuthSuccess} />;
    }

    return (
      <ProfilePage
        onLogin={openLogin}
        onLogout={handleLogout}
        onOlimpiade={openOlimpiade}
        onProfile={openProfile}
        onRegister={openRegister}
        onSaveProfile={handleSaveProfile}
        onTryout={openTryout}
        user={user}
      />
    );
  }

  if (page === 'olimpiade') {
    return (
      <OlimpiadePage
        competitions={apiCompetitions}
        competitionsLoading={competitionsLoading}
        onLogin={openLogin}
        onLogout={handleLogout}
        onOlimpiade={openOlimpiade}
        onProfile={openProfile}
        onRegister={openRegister}
        onTryout={openTryout}
        onCompetitionDetail={openCompetitionDetail}
        user={user}
      />
    );
  }

  if (page === 'competition-detail') {
    return (
        <CompetitionDetailPage
          competitionIndex={competitionIndex}
          competitions={apiCompetitions}
          onCompetitionDetail={openCompetitionDetail}
        onLogin={openLogin}
        onLogout={handleLogout}
        onOlimpiade={openOlimpiade}
        onProfile={openProfile}
        onRegister={openRegister}
        onEventRegistration={openEventRegistration}
        onTryout={openTryout}
        onVerifiedCompetition={openExamRules}
        registrations={registrations}
        user={user}
      />
    );
  }

  if (page === 'event-registration') {
    if (!authChecked) {
      return null;
    }
    if (!user) {
      return <LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleAuthSuccess} />;
    }
    if (!isProfileComplete(user)) {
      localStorage.setItem('besc_after_profile', 'event-registration');
      return (
        <ProfilePage
          onLogin={openLogin}
          onLogout={handleLogout}
          onOlimpiade={openOlimpiade}
          onProfile={openProfile}
          onRegister={openRegister}
          onSaveProfile={handleSaveProfile}
          user={user}
        />
      );
    }

    return (
        <EventRegistrationPage
          competitionIndex={competitionIndex}
          competitions={apiCompetitions}
          onCompetitionDetail={openCompetitionDetail}
        onLogin={openLogin}
        onLogout={handleLogout}
        onOlimpiade={openOlimpiade}
        onProfile={openProfile}
        onRegister={openRegister}
        onRegistrationSuccess={handleRegistrationSuccess}
        onTryout={openTryout}
        user={user}
      />
    );
  }

  if (page === 'event-registration-success') {
    return <EventRegistrationSuccessPage eventTitle={registeredEventTitle} onHome={backHome} onOlimpiade={openOlimpiade} />;
  }

  if (page === 'exam-rules') {
    if (!examCompetition) {
      window.location.hash = 'home';
      return null;
    }
    return <ExamRulesPage competition={examCompetition} onBack={backHome} onStart={startExam} />;
  }

  if (page === 'exam') {
    if (!examCompetition) {
      window.location.hash = 'home';
      return null;
    }
    return <ExamPage competition={examCompetition} onFinish={(result) => { alert(`Ujian selesai. Skor: ${result.score}`); backHome(); }} />;
  }

  if (page === 'tryout-package') {
    return (
      <TryoutPackagePage
        onLogin={openLogin}
        onLogout={handleLogout}
        onOlimpiade={openOlimpiade}
        onProfile={openProfile}
        onRegister={openRegister}
        onTryout={openTryout}
        onTryoutPackage={openTryoutPackage}
        user={user}
      />
    );
  }

  return <HomePage competitions={apiCompetitions} onCompetitionDetail={openCompetitionDetail} onCompetitions={openCompetitions} onRegister={openRegister} onLogin={openLogin} onLogout={handleLogout} onOlimpiade={openOlimpiade} onProfile={openProfile} onTryout={openTryout} onTryoutPackage={openTryoutPackage} onVerifiedCompetition={openExamRules} registrations={registrations} user={user} />;
}
