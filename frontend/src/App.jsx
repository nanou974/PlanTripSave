import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TripPlanner from './pages/TripPlanner';
import BudgetTracker from './pages/BudgetTracker';
import './App.css';

function App() {
  const token = localStorage.getItem('token');
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/trip/:tripId" element={token ? <TripPlanner /> : <Navigate to="/login" />} />
        <Route path="/trip/:tripId/budget" element={token ? <BudgetTracker /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
