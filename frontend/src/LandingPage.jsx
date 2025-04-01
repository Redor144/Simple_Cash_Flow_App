// LandingPage.jsx
import React from 'react';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="logo">SelfAccounting</div>
        <div className="nav-links">
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </div>
      </nav>

      <main className="landing-main">
        <h1>SelfAccounting</h1>
        <p>Your personal accounting platform</p>
        <button 
          className="cta-button" 
          onClick={() => (window.location.href = "/register")}
        >
          Register Now
        </button>
      </main>
    </div>
  );
}

export default LandingPage;
