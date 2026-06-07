import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import OlimpiadePage from './pages/OlimpiadePage.jsx';
import TryoutPage from './pages/TryoutPage.jsx';
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
  if (window.location.hash === '#tryout-page') return 'tryout';
  if (window.location.hash === '#detail-kompetisi') return 'competition-detail';
  if (window.location.hash === '#pendaftaran-event') return 'event-registration';
  if (window.location.hash === '#pendaftaran-berhasil') return 'event-registration-success';
  if (window.location.hash === '#paket-tryout') return 'tryout-package';
  if (window.location.hash === '#admin-login') return 'login';
  if (window.location.hash === '#admin-dashboard') return 'admin-dashboard';
  if (window.location.hash === '#ketentuan-ujian') return 'exam-rules';
  if (window.location.hash === '#kerjakan-soal') return 'exam';
  return 'home';
};

const pageHashes = ['#home', '#daftar', '#login', '#profile', '#olimpiade', '#tryout-page', '#detail-kompetisi', '#pendaftaran-event', '#pendaftaran-berhasil', '#paket-tryout', '#admin-login', '#admin-dashboard', '#ketentuan-ujian', '#kerjakan-soal'];

const isProfileComplete = () => {
  const user = JSON.parse(localStorage.getItem('besc_user') ?? '{}');
  const key = `besc_profile_${user.id || user.email || 'guest'}`;
  const profile = JSON.parse(localStorage.getItem(key) ?? '{}');
  return ['photo', 'fullName', 'email', 'whatsapp', 'birthDate', 'school', 'gender', 'province', 'city']
    .every((field) => Boolean(profile[field]));
};

export default function App() {
  const [page, setPage] = useState(getPageFromHash);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('besc_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem('besc_admin');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });
  const [competitionIndex, setCompetitionIndex] = useState(() => Number(localStorage.getItem('besc_competition_index') ?? 0));
  const [registeredEventTitle, setRegisteredEventTitle] = useState(() => localStorage.getItem('besc_registered_event') || 'kompetisi BESC');
  const [registrations, setRegistrations] = useState([]);
  const [apiCompetitions, setApiCompetitions] = useState([]);
  const [examCompetition, setExamCompetition] = useState(() => {
    const savedCompetition = localStorage.getItem('besc_exam_competition');
    return savedCompetition ? JSON.parse(savedCompetition) : null;
  });

  useEffect(() => {
    if (window.location.hash !== '#reset-session') return;
    ['besc_user', 'besc_token', 'besc_after_profile', 'besc_after_login'].forEach((key) => localStorage.removeItem(key));
    setUser(null);
    window.location.hash = 'login';
    setPage('login');
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
    apiRequest('/competitions?limit=100').then(setApiCompetitions).catch(() => setApiCompetitions([]));
  }, []);

  useEffect(() => {
    if (!user || user.role === 'admin') return;
    apiRequest('/me/competitions?limit=100', { headers: { Authorization: `Bearer ${localStorage.getItem('besc_token')}` } })
      .then(setRegistrations)
      .catch(() => setRegistrations([]));
  }, [user]);

  const openRegister = () => {
    window.location.hash = 'daftar';
    window.scrollTo(0, 0);
    setPage('register');
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
    window.location.hash = 'profile';
    window.scrollTo(0, 0);
    setPage('profile');
  };

  const openOlimpiade = () => {
    window.location.hash = 'olimpiade';
    window.scrollTo(0, 0);
    setPage('olimpiade');
  };

  const openTryout = () => {
    window.location.hash = 'tryout-page';
    window.scrollTo(0, 0);
    setPage('tryout');
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

  const handleAuthSuccess = (auth) => {
    if (auth.user?.role === 'admin') {
      handleAdminLoginSuccess(auth);
      return;
    }

    saveAuthSession(auth);
    setUser(auth.user);
    const afterLogin = localStorage.getItem('besc_after_login');
    localStorage.removeItem('besc_after_login');

    if (afterLogin === 'event-registration') {
      localStorage.setItem('besc_after_profile', 'event-registration');
      window.location.hash = 'profile';
      window.scrollTo(0, 0);
      setPage('profile');
      return;
    }

    backHome();
  };

  const handleRegisterSuccess = (auth, options = {}) => {
    if (options.source === 'google') {
      handleAuthSuccess(auth);
      return;
    }
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

  const handleLogout = () => {
    clearAuthSession();
    localStorage.removeItem('besc_profile');
    setUser(null);
    backHome();
  };

  const handleAdminLoginSuccess = (auth) => {
    localStorage.setItem('besc_admin_token', auth.token);
    localStorage.setItem('besc_admin', JSON.stringify(auth.user));
    setAdmin(auth.user);
    window.location.hash = 'admin-dashboard';
    window.scrollTo(0, 0);
    setPage('admin-dashboard');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('besc_admin_token');
    localStorage.removeItem('besc_admin');
    setAdmin(null);
    window.location.hash = 'admin-login';
    window.scrollTo(0, 0);
    setPage('admin-login');
  };

  const handleSaveProfile = (profile) => {
    const updatedUser = { ...user, ...profile.backendUser, name: profile.fullName || user?.name || 'Rendra Ardika', photo: profile.photo };
    localStorage.setItem('besc_user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    const afterProfile = localStorage.getItem('besc_after_profile');
    localStorage.removeItem('besc_after_profile');
    if (afterProfile === 'event-registration') {
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
    if (!admin) {
      return <LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleAuthSuccess} />;
    }

    return <AdminDashboardPage admin={admin} onLogout={handleAdminLogout} />;
  }

  if (page === 'profile') {
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

  if (page === 'tryout') {
    return (
      <TryoutPage
        onLogin={openLogin}
        onLogout={handleLogout}
        onOlimpiade={openOlimpiade}
        onProfile={openProfile}
        onRegister={openRegister}
        onTryoutPackage={openTryoutPackage}
        onTryout={openTryout}
        user={user}
      />
    );
  }

  if (page === 'competition-detail') {
    return (
      <CompetitionDetailPage
        competitionIndex={competitionIndex}
        onCompetitionDetail={openCompetitionDetail}
        onLogin={openLogin}
        onLogout={handleLogout}
        onOlimpiade={openOlimpiade}
        onProfile={openProfile}
        onRegister={openRegister}
        onEventRegistration={openEventRegistration}
        onTryout={openTryout}
        user={user}
      />
    );
  }

  if (page === 'event-registration') {
    if (!user) {
      return <LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleAuthSuccess} />;
    }
    if (!isProfileComplete()) {
      localStorage.setItem('besc_after_profile', 'event-registration');
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

    return (
      <EventRegistrationPage
        competitionIndex={competitionIndex}
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

  return <HomePage competitions={apiCompetitions} onCompetitionDetail={openCompetitionDetail} onRegister={openRegister} onLogin={openLogin} onLogout={handleLogout} onOlimpiade={openOlimpiade} onProfile={openProfile} onTryout={openTryout} onTryoutPackage={openTryoutPackage} onVerifiedCompetition={openExamRules} registrations={registrations} user={user} />;
}
