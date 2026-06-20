import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [newTrip, setNewTrip] = useState({ name: '', startDate: '', endDate: '', budget: '' });
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/trips/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrips(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/trips`,
        { ...newTrip, budget: parseFloat(newTrip.budget), userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrips([...trips, response.data]);
      setNewTrip({ name: '', startDate: '', endDate: '', budget: '' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/trips/${tripId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="dashboard-container">
      <h1>Mes Voyages</h1>
      <div className="form-section">
        <h2>Creer un nouveau voyage</h2>
        <form onSubmit={handleCreateTrip}>
          <input type="text" placeholder="Nom du voyage" value={newTrip.name} onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })} required />
          <input type="date" value={newTrip.startDate} onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })} required />
          <input type="date" value={newTrip.endDate} onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })} required />
          <input type="number" step="0.01" placeholder="Budget (EUR)" value={newTrip.budget} onChange={(e) => setNewTrip({ ...newTrip, budget: e.target.value })} required />
          <button type="submit">Creer</button>
        </form>
      </div>
      <div className="trips-grid">
        {trips.length === 0 ? <p>Aucun voyage</p> : trips.map((trip) => (
          <div key={trip.id} className="trip-card">
            <h3>{trip.name}</h3>
            <p>{new Date(trip.startDate).toLocaleDateString()}</p>
            <p>Budget: {trip.budget} EUR</p>
            <div className="card-actions">
              <a href={`/trip/${trip.id}`} className="btn-primary">Details</a>
              <button onClick={() => handleDeleteTrip(trip.id)} className="btn-danger">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
