// Dashboard.js
import React, { useEffect, useState } from 'react';
import { getCurrentUser, getCashflow, listGoals } from './services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Brush
} from 'recharts';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [cashflow, setCashflow] = useState([]);
  const [monthsAhead, setMonthsAhead] = useState(6);

  // Zmienne do obsługi listy celów i wyboru
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // 1. Pobierz użytkownika
    getCurrentUser(token)
      .then(u => setUser(u))
      .catch(e => console.log(e));

    // 2. Pobierz transakcje / cashflow
    getCashflow(token, monthsAhead)
      .then(cf => setCashflow(cf))
      .catch(e => console.log(e));

    // 3. Pobierz cele
    listGoals(token)
      .then(g => setGoals(g))
      .catch(err => console.log(err));

  }, [monthsAhead]);

  // Przy zmianie liczby miesięcy
  const handleMonthsChange = (e) => {
    setMonthsAhead(parseInt(e.target.value, 10));
  };

  // Przy zmianie celu w <select>
  const handleGoalChange = (e) => {
    setSelectedGoalId(e.target.value);
  };

  if (!user) {
    return <div className="card">Musisz się zalogować, aby zobaczyć dashboard.</div>;
  }

  // Lista danych do wykresu
  const chartData = cashflow.map(item => ({
    date: item.date,
    balance: item.balance
  }));

  // Znajdź obiekt docelowy w tablicy goals
  const selectedGoal = goals.find(g => g.id === parseInt(selectedGoalId));

  // Wyliczamy moment, gdy saldo >= target_amount (tylko jeśli selectedGoal istnieje)
  let firstGoalDate = null;
  if (selectedGoal) {
    const { target_amount } = selectedGoal;
    const firstGoalIndex = chartData.findIndex(d => d.balance >= target_amount);
    if (firstGoalIndex !== -1) {
      firstGoalDate = chartData[firstGoalIndex].date;
    }
  }

  return (
    <div className="card">
      <h2>Witaj, {user.username || user.email}!</h2>
      <p>Twoje saldo początkowe: {user.initial_balance} PLN</p>

      <div style={{ marginBottom: '1rem' }}>
        <label>Liczba miesięcy (prognoza): </label>
        <select value={monthsAhead} onChange={handleMonthsChange} style={{ marginRight: '1rem' }}>
          <option value={3}>3</option>
          <option value={6}>6</option>
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={36}>36</option>
          <option value={60}>60</option>
          <option value={90}>90</option>
          <option value={120}>120</option>
        </select>

        <label>Wybierz cel: </label>
        <select value={selectedGoalId} onChange={handleGoalChange}>
          <option value="">-- brak --</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title} ({g.target_amount} PLN)
            </option>
          ))}
        </select>
      </div>

      {/* Komunikat kiedy osiągamy cel */}
      {selectedGoal && (
        firstGoalDate ? (
          <p>Cel <strong>{selectedGoal.title}</strong> (kwota: {selectedGoal.target_amount} PLN) zostanie osiągnięty ok. <strong>{firstGoalDate}</strong>.</p>
        ) : (
          <p>W tym okresie saldo nie osiągnie celu "{selectedGoal.title}" (kwota: {selectedGoal.target_amount} PLN).</p>
        )
      )}

      <h3>Prognoza cashflow (najbliższe {monthsAhead} miesięcy)</h3>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />

            {/* Linia celu, tylko jeśli jest wybrany cel */}
            {selectedGoal && (
              <ReferenceLine
                y={selectedGoal.target_amount}
                stroke="red"
                strokeDasharray="3 3"
                label={`Cel ${selectedGoal.target_amount} PLN`}
              />
            )}

            <Line
              type="monotone"
              dataKey="balance"
              stroke="#82ca9d"
              strokeWidth={2}
            />

            <Brush dataKey="date" height={30} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;
