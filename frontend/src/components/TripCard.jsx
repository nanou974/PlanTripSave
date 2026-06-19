import { Link } from 'react-router-dom';

export default function TripCard({ trip }) {
  return (
    <div className="trip-card">
      <h3>{trip.title}</h3>
      <p>{trip.description}</p>
      <p>De {trip.start_location} à {trip.end_location}</p>
      <p>Budget: {trip.budget}€</p>
      <Link to={`/trip/${trip.id}`}>Voir les détails</Link>
    </div>
  );
}
