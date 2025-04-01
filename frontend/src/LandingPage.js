// LandingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1 className="landing-title">SelfAccounting</h1>
      <p className="landing-subtitle">Your personal accounting platform</p>
      <div>
        <button className="landing-button" onClick={() => navigate('/login')}>
          Logowanie
        </button>
        <button className="landing-button" onClick={() => navigate('/register')}>
          Rejestracja
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
