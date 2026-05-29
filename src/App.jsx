import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import OlimpiadePage from './pages/OlimpiadePage.jsx';
import TryoutPage from './pages/TryoutPage.jsx';
import CompetitionDetailPage from './pages/CompetitionDetailPage.jsx';
import EventRegistrationPage from './pages/EventRegistrationPage.jsx';
import TryoutPackagePage from './pages/TryoutPackagePage.jsx';

const getPageFromHash = () => {
  if (window.location.hash === '#daftar') return 'register';
  if (window.location.hash === '#login') return 'login';
  if (window.location.hash === '#profile') return 'profile';
  if (window.location.hash === '#olimpiade') return 'olimpiade';
  if (window.location.hash === '#tryout-page') return 'tryout';
  if (window.location.hash === '#detail-kompetisi') return 'competition-detail';
  if (window.location.hash === '#pendaftaran-event') return 'event-registration';
  if (window.location.hash === '#paket-tryout') return 'tryout-package';
  return 'home';
};

const pageHashes = ['#home', '#daftar', '#login', '#profile', '#olimpiade', '#tryout-page', '#detail-kompetisi', '#pendaftaran-event', '#paket-tryout'];

export default function App() {
  const [page, setPage] = useState(getPageFromHash);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('besc_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [competitionIndex, setCompetitionIndex] = useState(() => Number(localStorage.getItem('besc_competition_index') ?? 0));

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

  const handleLoginSuccess = () => {
    const loggedInUser = { name: 'Ardika' };
    localStorage.setItem('besc_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    const afterLogin = localStorage.getItem('besc_after_login');
    localStorage.removeItem('besc_after_login');

    if (afterLogin === 'event-registration') {
      window.location.hash = 'pendaftaran-event';
      window.scrollTo(0, 0);
      setPage('event-registration');
      return;
    }

    backHome();
  };

  const handleLogout = () => {
    localStorage.removeItem('besc_user');
    setUser(null);
    backHome();
  };

  const handleSaveProfile = (profile) => {
    const updatedUser = { name: profile.fullName || user?.name || 'Ardika' };
    localStorage.setItem('besc_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  if (page === 'register') {
    return <RegisterPage onLogin={openLogin} />;
  }

  if (page === 'login') {
    return <LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleLoginSuccess} />;
  }

  if (page === 'profile') {
    if (!user) {
      return <LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleLoginSuccess} />;
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
      return <LoginPage onBack={backHome} onRegister={openRegister} onLoginSuccess={handleLoginSuccess} />;
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
        onTryout={openTryout}
        user={user}
      />
    );
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

  return <HomePage onCompetitionDetail={openCompetitionDetail} onRegister={openRegister} onLogin={openLogin} onLogout={handleLogout} onOlimpiade={openOlimpiade} onProfile={openProfile} onTryout={openTryout} onTryoutPackage={openTryoutPackage} user={user} />;
}
