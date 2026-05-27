import { useState } from 'react';
import HomePage from './pages/HomePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

export default function App() {
  const initialPage = window.location.hash === '#daftar' ? 'register' : window.location.hash === '#login' ? 'login' : 'home';
  const [page, setPage] = useState(initialPage);

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

  if (page === 'register') {
    return <RegisterPage onBack={backHome} />;
  }

  if (page === 'login') {
    return <LoginPage onBack={backHome} onRegister={openRegister} />;
  }

  return <HomePage onRegister={openRegister} onLogin={openLogin} />;
}
