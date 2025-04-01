// Transactions.js
import React, { useEffect, useState } from 'react';
import { listTransactions, createTransaction, deleteTransaction } from './services/api';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(0);
  const [isIncome, setIsIncome] = useState(false);
  const [frequency, setFrequency] = useState("once");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = localStorage.getItem("token");

  const fetchTransactions = () => {
    listTransactions(token)
      .then(data => setTransactions(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [token]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!token) return;
    const newTr = {
      title,
      amount: parseFloat(amount),
      is_income: isIncome,
      frequency,
      start_date: startDate,
      end_date: endDate || null
    };
    createTransaction(token, newTr)
      .then(() => {
        setTitle("");
        setAmount(0);
        setIsIncome(false);
        setFrequency("once");
        setStartDate("");
        setEndDate("");
        fetchTransactions();
      })
      .catch(err => alert(err.message));
  };

  const handleDelete = (id) => {
    if (!token) return;
    deleteTransaction(token, id)
      .then(() => {
        fetchTransactions();
      })
      .catch(err => alert(err.message));
  };

  if (!token) {
    return <div className="card">Musisz być zalogowany, aby zobaczyć transakcje.</div>;
  }

  return (
    <div className="card">
      <h2>Transakcje</h2>

      {/* Formularz dodawania */}
      <form onSubmit={handleAddTransaction}>
        <div className="form-group">
          <label>Tytuł: </label>
          <input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Kwota: </label>
          <input 
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Rodzaj: </label>
          <select value={isIncome} onChange={e => setIsIncome(e.target.value === "true")}>
            <option value="false">Wydatek</option>
            <option value="true">Przychód</option>
          </select>
        </div>
        <div className="form-group">
          <label>Częstotliwość: </label>
          <select value={frequency} onChange={e => setFrequency(e.target.value)}>
            <option value="once">Jednorazowa</option>
            <option value="monthly">Miesięczna</option>
            <option value="weekly">Tygodniowa</option>
          </select>
        </div>
        <div className="form-group">
          <label>Data początkowa: </label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Data końcowa (opcjonalna): </label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <button className="button-primary" type="submit">Dodaj</button>
      </form>

      <hr />
      <h3>Lista transakcji</h3>
      <ul>
        {transactions.map((tr) => (
          <li key={tr.id}>
            <strong>{tr.title}</strong> | {tr.is_income ? "+" : "-"}{tr.amount} | {tr.frequency} | {tr.start_date} 
            {tr.end_date ? ` do ${tr.end_date}` : ""} 
            <button 
              style={{ marginLeft: '1rem' }} 
              className="button-primary"
              onClick={() => handleDelete(tr.id)}
            >
              Usuń
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Transactions;
