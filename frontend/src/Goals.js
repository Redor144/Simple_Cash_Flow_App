// Goals.js
import React, { useState, useEffect } from 'react';
import { listGoals, createGoal, createSubGoal } from './services/api';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);

  const [subTitle, setSubTitle] = useState("");
  const [subAmount, setSubAmount] = useState(0);
  const [selectedGoalId, setSelectedGoalId] = useState("");

  const token = localStorage.getItem("token");

  const fetchGoals = () => {
    listGoals(token)
      .then(g => setGoals(g))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    if (token) {
      fetchGoals();
    }
  }, [token]);

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!token) return;
    createGoal(token, { title, target_amount: parseFloat(targetAmount) })
      .then(() => {
        setTitle("");
        setTargetAmount(0);
        fetchGoals();
      })
      .catch(err => alert(err.message));
  };

  const handleCreateSubGoal = (e) => {
    e.preventDefault();
    if (!token || !selectedGoalId) return;
    createSubGoal(token, selectedGoalId, {
      title: subTitle,
      target_amount: parseFloat(subAmount)
    })
      .then(() => {
        setSubTitle("");
        setSubAmount(0);
        setSelectedGoalId("");
        fetchGoals();
      })
      .catch(err => alert(err.message));
  };

  if (!token) {
    return <div className="card">Musisz się zalogować, aby zobaczyć cele</div>;
  }

  return (
    <div className="card">
      <h2>Cele</h2>

      {/* Formularz dodawania celu */}
      <form onSubmit={handleCreateGoal}>
        <div className="form-group">
          <label>Tytuł celu:</label>
          <input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Kwota docelowa (PLN):</label>
          <input 
            type="number"
            value={targetAmount}
            onChange={e => setTargetAmount(e.target.value)}
          />
        </div>
        <button className="button-primary" type="submit">Dodaj cel</button>
      </form>

      <hr />

      {/* Formularz dodawania podcelu */}
      <form onSubmit={handleCreateSubGoal}>
        <div className="form-group">
          <label>Wybierz cel:</label>
          <select 
            value={selectedGoalId}
            onChange={e => setSelectedGoalId(e.target.value)}
          >
            <option value="">-- wybierz --</option>
            {goals.map(g => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Tytuł podcelu:</label>
          <input value={subTitle} onChange={e => setSubTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Kwota docelowa (PLN):</label>
          <input 
            type="number"
            value={subAmount}
            onChange={e => setSubAmount(e.target.value)}
          />
        </div>
        <button className="button-primary" type="submit">Dodaj podcel</button>
      </form>

      <hr />

      <h3>Lista celów</h3>
      {goals.map(goal => (
        <div key={goal.id} className="card">
          <h4>{goal.title} - {goal.target_amount} PLN</h4>
          {goal.subgoals.length > 0 && (
            <ul>
              {goal.subgoals.map(sg => (
                <li key={sg.id}>
                  {sg.title} - {sg.target_amount} PLN
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default Goals;
