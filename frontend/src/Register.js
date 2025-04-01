// Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from './services/api';

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [initialBalance, setInitialBalance] = useState(0);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser(email, password, username, initialBalance);
      alert("Rejestracja udana. Możesz się zalogować.");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Rejestracja</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Email:</label>
          <input 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>
        <div className="form-group">
          <label>Nazwa użytkownika:</label>
          <input 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
          />
        </div>
        <div className="form-group">
          <label>Hasło:</label>
          <input 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </div>
        <div className="form-group">
          <label>Saldo początkowe (PLN):</label>
          <input
            type="number"
            value={initialBalance}
            onChange={(e) => setInitialBalance(parseFloat(e.target.value))}
          />
        </div>
        <button className="button-primary" type="submit">Zarejestruj</button>
      </form>
    </div>
  );
}

export default Register;
