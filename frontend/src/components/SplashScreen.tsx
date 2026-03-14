import React, { useEffect } from 'react';
import '../styles/SplashScreen.css';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-container">
      <div className="splash-content">
        <h1>Chat App</h1>
        <p className="tagline">Be real. Not viral. Connect through honesty.</p>
      </div>
    </div>
  );
};
