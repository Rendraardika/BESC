import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import App from './App.jsx';
import './styles.css';

function AnimatedApp() {
  const [routeKey, setRouteKey] = useState(window.location.hash);

  useEffect(() => {
    const updateRouteKey = () => setRouteKey(window.location.hash);
    window.addEventListener('hashchange', updateRouteKey);
    return () => window.removeEventListener('hashchange', updateRouteKey);
  }, []);

  return <div key={routeKey} className="page-transition"><App /></div>;
}

createRoot(document.getElementById('root')).render(<AnimatedApp />);
