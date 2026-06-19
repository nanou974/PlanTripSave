import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function TripDetailsPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      const response = await axios.get(`/api/trips/${id}`);
      setTrip(response.data.trip);
      setPlaces(response.data.places);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!trip) return <div>Trip non trouvé</div>;

  return (
    <div className="trip-details">
      <h1>{trip.title}</h1>
      <p>{trip.description}</p>
      <p>Budget: {trip.budget}€</p>
      
      <h2>Étapes du voyage</h2>
      <ul>
        {places.map(place => (
          <li key={place.id}>{place.name} - {place.estimated_cost}€</li>
        ))}
      </ul>
    </div>
  );
}
