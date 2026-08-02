import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Sidebar from './components/Sidebar';
import PetLoader from './components/PetLoader';
import Overview from './pages/Overview';
import Sites from './pages/Sites';
import SiteDetail from './pages/SiteDetail';
import SeoOverview from './pages/SeoOverview';
import SecurityOverview from './pages/SecurityOverview';
import Plugins from './pages/Plugins';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ComingSoon from './pages/ComingSoon';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Configure axios authorization header globally
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Check token validity on start
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        await axios.get('/api/auth/me');
      } catch (err) {
        // Invalid token
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-200">
        <PetLoader size={80} state="jumping" text="Bootstrapping WP Monitor..." />
      </div>
    );
  }

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <BrowserRouter>
      {token ? (
        <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100">
          <Sidebar onLogout={handleLogout} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
          <main className={`flex-1 px-6 pt-20 pb-8 md:py-8 overflow-y-auto max-w-7xl mx-auto w-full transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-[3.75rem]' : 'md:pl-56'}`}>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/sites" element={<Sites />} />
              <Route path="/sites/:id" element={<SiteDetail />} />
              <Route path="/seo" element={<SeoOverview />} />
              <Route path="/seo/sitemap" element={<ComingSoon />} />
              <Route path="/seo/schema" element={<ComingSoon />} />
              <Route path="/security" element={<SecurityOverview />} />
              <Route path="/security/headers" element={<ComingSoon />} />
              <Route path="/security/hardening" element={<ComingSoon />} />
              <Route path="/plugins" element={<Plugins />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
