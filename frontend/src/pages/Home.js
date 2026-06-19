import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container">
      <h1>Bienvenue sur PlanTripSave</h1>
      <p>Planifier votre voyage économique en toute simplicité</p>
      <Link to="/login">
        <button className="btn">Se connecter</button>
      </Link>
      <Link to="/register">
        <button className="btn">S'inscrire</button>
      </Link>
    </div>
  );
}

export default Home;
