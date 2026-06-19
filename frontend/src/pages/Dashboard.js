import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/trips', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTrips(response.data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchTrips();
  }, []);

  return (
    <div className="container">
      <h1>Mes Voyages</h1>
      <ul>
        {trips.map((trip) => (
          <li key={trip.id}>
            <h3>{trip.title}</h3>
            <p>{trip.description}</p>
            <p>Budget: {trip.budget}€</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
