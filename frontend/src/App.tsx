
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './context/authStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatDashboard } from './pages/ChatDashboard';

import { SplashScreen } from './components/SplashScreen';
import { AuthLanding } from './components/AuthLanding';
import { StatusPage } from './pages/StatusPage';
import './styles/index.css';


function App() {
  const { accessToken, logout } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'guest' | null>(null);
  const [guestMode, setGuestMode] = useState(false);

  // Reset authMode and guestMode on logout
  const handleLogout = () => {
    logout();
    setAuthMode(null);
    setGuestMode(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!accessToken && !authMode && !guestMode) {
    return <AuthLanding onSelect={(mode) => {
      if (mode === 'guest') setGuestMode(true);
      else setAuthMode(mode);
    }} />;
  }

  // After signup, redirect to login
  if (authMode === 'register' && accessToken) {
    setAuthMode(null);
  }

  return (
    <Router>
      <Routes>
        {accessToken ? (
          <>
            <Route path="/" element={<ChatDashboard onLogout={handleLogout} />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : guestMode ? (
          <>
            <Route path="/" element={<ChatDashboard guestMode={true} onLogout={handleLogout} />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : authMode === 'login' ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : authMode === 'register' ? (
          <>
            <Route path="/register" element={<RegisterPage onRegister={() => setAuthMode('login')} />} />
            <Route path="*" element={<Navigate to="/register" replace />} />
          </>
        ) : null}
      </Routes>
    </Router>
  );
}

export default App;
