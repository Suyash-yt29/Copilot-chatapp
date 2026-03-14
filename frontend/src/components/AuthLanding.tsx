import React from 'react';
import '../styles/Auth.css';

interface AuthLandingProps {
  onSelect: (mode: 'login' | 'register' | 'guest') => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({ onSelect }) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome</h1>
        <p className="tagline">Be real. Not viral. Connect through honesty.</p>
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={() => onSelect('login')}>Login</button>
          <button onClick={() => onSelect('register')}>Sign Up</button>
          <button onClick={() => onSelect('guest')}>Continue as Guest</button>
        </div>
      </div>
    </div>
  );
};
