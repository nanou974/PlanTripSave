import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BudgetTracker.css';

function BudgetTracker() {
  const tripId = window.location.pathname.split('/')[2];
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ category: 'Transport', amount: '', description: '' });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    try {
      const tripRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/trips/${tripId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrip(tripRes.data);
      const expensesRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/trips/${tripId}/expenses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpenses(expensesRes.data.expenses);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/trips/${tripId}/expenses`,
        { ...newExpense, amount: parseFloat(newExpense.amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpenses([...expenses, response.data]);
      setNewExpense({ category: 'Transport', amount: '', description: '' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/trips/expenses/${expenseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpenses(expenses.filter(e => e.id !== expenseId));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="budget-container">
      <h1>Budget</h1>
      <div className="budget-grid">
        <div className="expenses-section">
          <h2>Ajouter une depense</h2>
          <form onSubmit={handleAddExpense}>
            <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}>
              <option>Transport</option><option>Hebergement</option><option>Nourriture</option><option>Activites</option>
            </select>
            <input type="number" step="0.01" placeholder="Montant (EUR)" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} required />
            <input type="text" placeholder="Description" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} />
            <button type="submit">Ajouter</button>
          </form>
        </div>
        <div className="expenses-list-section">
          <h2>Depenses</h2>
          <ul className="expenses-list">
            {expenses.map((expense) => (
              <li key={expense.id} className="expense-item">
                <div><strong>{expense.category}</strong><p>{expense.description}</p></div>
                <div className="expense-actions">
                  <span className="amount">{expense.amount} EUR</span>
                  <button onClick={() => handleDeleteExpense(expense.id)} className="btn-delete">X</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default BudgetTracker;
