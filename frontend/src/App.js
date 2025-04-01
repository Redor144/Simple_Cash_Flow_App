// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';              // import pliku z stylami
import NavBar from './NavBar';   // pasek nawigacji
import LandingPage from './LandingPage';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Transactions from './Transactions';
import Goals from './Goals';

function App() {
  return (
    <div className="app-container">
      <Router>
        {/* Możesz chcieć pokazywać pasek nav tylko na wybranych stronach. 
            Jeżeli Landing ma być "pełnoekranowa" bez nav, wtedy:
            <Routes> ... a NavBar zrobisz w innym miejscu. 
        */}
        <NavBar />

        <div className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/goals" element={<Goals />} />
          </Routes>
        </div>

        <footer className="footer">
          {/* &copy; 2025 SelfAccounting - All rights reserved. */}
        </footer>
      </Router>
    </div>
  );
}

export default App;
