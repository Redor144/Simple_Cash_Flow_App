// frontend/src/services/api.js
const BASE_URL = "http://localhost:8000";

export async function registerUser(email, password, username, initialBalance) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      username,
      initial_balance: initialBalance
    }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Błąd rejestracji");
  }
  return response.json();
}

export async function loginUser(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email); 
  formData.append("password", password);

  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Błąd logowania");
  }
  return response.json();
}

export async function getCurrentUser(token) {
  const response = await fetch(`${BASE_URL}/me`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Błąd pobrania użytkownika");
  return response.json();
}

export async function createTransaction(token, transaction) {
  const response = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(transaction)
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Błąd tworzenia transakcji");
  }
  return response.json();
}

export async function listTransactions(token) {
  const response = await fetch(`${BASE_URL}/transactions`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Błąd pobrania transakcji");
  return response.json();
}

export async function deleteTransaction(token, id) {
  const response = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Błąd usuwania transakcji");
  }
  return response.json();
}

export async function createGoal(token, goal) {
  const response = await fetch(`${BASE_URL}/goals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(goal)
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Błąd tworzenia celu");
  }
  return response.json();
}

export async function listGoals(token) {
  const response = await fetch(`${BASE_URL}/goals`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Błąd pobrania celów");
  return response.json();
}

export async function createSubGoal(token, goalId, subgoal) {
  const response = await fetch(`${BASE_URL}/goals/${goalId}/subgoals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(subgoal)
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Błąd tworzenia podcelu");
  }
  return response.json();
}

export async function getCashflow(token, monthsAhead=6) {
  const response = await fetch(`${BASE_URL}/cashflow?months_ahead=${monthsAhead}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Błąd pobrania cashflow");
  return response.json();
}
