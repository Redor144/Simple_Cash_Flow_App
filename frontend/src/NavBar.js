// NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">SelfAccounting</span>
      </div>
      <div className="navbar-right">
        <Link className="navbar-link" to="/dashboard">Dashboard</Link>
        <Link className="navbar-link" to="/transactions">Transakcje</Link>
        <Link className="navbar-link" to="/goals">Cele</Link>
        <Link className="navbar-link" to="/login">Logowanie</Link>
        <Link className="navbar-link" to="/register">Rejestracja</Link>
      </div>
    </header>
  );
}

export default NavBar;
