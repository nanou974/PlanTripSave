import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/TripPlanner.css';

function TripPlanner() {
  const tripId = window.location.pathname.split('/')[2];
  const [trip, setTrip] = useState(null);
  const [places, setPlaces] = useState([]);
  const [newPlace, setNewPlace] = useState({ name: '', latitude: '', longitude: '' });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      const tripRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/trips/${tripId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrip(tripRes.data);
      const placesRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/trips/${tripId}/places`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlaces(placesRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlace = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/trips/${tripId}/places`,
        { ...newPlace, latitude: parseFloat(newPlace.latitude), longitude: parseFloat(newPlace.longitude) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlaces([...places, response.data]);
      setNewPlace({ name: '', latitude: '', longitude: '' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeletePlace = async (placeId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/trips/places/${placeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlaces(places.filter(p => p.id !== placeId));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!trip) return <div>Trip non trouve</div>;

  return (
    <div className="planner-container">
      <h1>{trip.name}</h1>
      <div className="planner-grid">
        <div className="info-section">
          <h2>Ajouter un lieu</h2>
          <form onSubmit={handleAddPlace}>
            <input type="text" placeholder="Nom du lieu" value={newPlace.name} onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })} required />
            <input type="number" step="0.0001" placeholder="Latitude" value={newPlace.latitude} onChange={(e) => setNewPlace({ ...newPlace, latitude: e.target.value })} required />
            <input type="number" step="0.0001" placeholder="Longitude" value={newPlace.longitude} onChange={(e) => setNewPlace({ ...newPlace, longitude: e.target.value })} required />
            <button type="submit">Ajouter</button>
          </form>
          <h3>Lieux ({places.length})</h3>
          <ul className="places-list">
            {places.map((place) => (
              <li key={place.id}>
                <div><strong>{place.name}</strong><p>{place.latitude}, {place.longitude}</p></div>
                <button onClick={() => handleDeletePlace(place.id)} className="btn-delete">X</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TripPlanner;
