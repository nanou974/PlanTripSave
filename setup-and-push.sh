#!/bin/bash

# Configuration
GITHUB_USER="nanou974"
REPO_NAME="PlanTripSave"
GITHUB_TOKEN="$1"  # À passer en paramètre

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Erreur: Token GitHub manquant"
  echo "Usage: ./setup-and-push.sh <GITHUB_TOKEN>"
  exit 1
fi

echo "🚀 Démarrage du setup automatique..."

# Backend Structure
mkdir -p backend/controllers
mkdir -p backend/models
mkdir -p backend/routes
mkdir -p backend/middleware
mkdir -p backend/utils
mkdir -p backend/config

# Frontend Structure
mkdir -p frontend/src/pages
mkdir -p frontend/src/components
mkdir -p frontend/src/styles

# ==================== BACKEND ====================

# tripController.js
cat > backend/controllers/tripController.js << 'EOF'
const Trip = require('../models/Trip');
const Place = require('../models/Place');
const Budget = require('../models/Budget');
const { calculateOptimalRoute } = require('../utils/routeOptimizer');

exports.createTrip = async (req, res) => {
  try {
    const { name, startDate, endDate, budget, userId } = req.body;

    if (!name || !startDate || !endDate || !userId) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const trip = await Trip.create({
      name,
      startDate,
      endDate,
      budget,
      userId,
      status: 'planning'
    });

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;

    const trips = await Trip.findAll({
      where: { userId },
      include: [
        { model: Place, as: 'places' },
        { model: Budget, as: 'budgets' }
      ],
      order: [['startDate', 'DESC']]
    });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findByPk(tripId, {
      include: [
        { model: Place, as: 'places' },
        { model: Budget, as: 'budgets' }
      ]
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip non trouvé' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, startDate, endDate, budget, status } = req.body;

    const trip = await Trip.findByPk(tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip non trouvé' });
    }

    await trip.update({
      name: name || trip.name,
      startDate: startDate || trip.startDate,
      endDate: endDate || trip.endDate,
      budget: budget || trip.budget,
      status: status || trip.status
    });

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findByPk(tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip non trouvé' });
    }

    await trip.destroy();

    res.json({ message: 'Trip supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateOptimalRoute = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findByPk(tripId, {
      include: [{ model: Place, as: 'places' }]
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip non trouvé' });
    }

    if (trip.places.length === 0) {
      return res.status(400).json({ error: 'Aucun lieu dans ce trip' });
    }

    const optimizedRoute = await calculateOptimalRoute(trip.places);

    res.json(optimizedRoute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
EOF

# placeController.js
cat > backend/controllers/placeController.js << 'EOF'
const Place = require('../models/Place');
const Trip = require('../models/Trip');

exports.addPlace = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, latitude, longitude, description, visitDate, estimatedCost } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip non trouvé' });
    }

    const place = await Place.create({
      tripId,
      name,
      latitude,
      longitude,
      description,
      visitDate,
      estimatedCost: estimatedCost || 0,
      order: 0
    });

    res.status(201).json(place);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTripPlaces = async (req, res) => {
  try {
    const { tripId } = req.params;

    const places = await Place.findAll({
      where: { tripId },
      order: [['order', 'ASC']]
    });

    res.json(places);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { name, latitude, longitude, description, visitDate, estimatedCost, order } = req.body;

    const place = await Place.findByPk(placeId);

    if (!place) {
      return res.status(404).json({ error: 'Lieu non trouvé' });
    }

    await place.update({
      name: name || place.name,
      latitude: latitude !== undefined ? latitude : place.latitude,
      longitude: longitude !== undefined ? longitude : place.longitude,
      description: description || place.description,
      visitDate: visitDate || place.visitDate,
      estimatedCost: estimatedCost !== undefined ? estimatedCost : place.estimatedCost,
      order: order !== undefined ? order : place.order
    });

    res.json(place);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePlace = async (req, res) => {
  try {
    const { placeId } = req.params;

    const place = await Place.findByPk(placeId);

    if (!place) {
      return res.status(404).json({ error: 'Lieu non trouvé' });
    }

    await place.destroy();

    res.json({ message: 'Lieu supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reorderPlaces = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { places } = req.body;

    for (const place of places) {
      await Place.update(
        { order: place.order },
        { where: { id: place.id, tripId } }
      );
    }

    const updatedPlaces = await Place.findAll({
      where: { tripId },
      order: [['order', 'ASC']]
    });

    res.json(updatedPlaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
EOF

# budgetController.js
cat > backend/controllers/budgetController.js << 'EOF'
const Budget = require('../models/Budget');
const Trip = require('../models/Trip');

exports.addExpense = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { category, amount, description, date } = req.body;

    if (!category || amount === undefined) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip non trouvé' });
    }

    const budget = await Budget.create({
      tripId,
      category,
      amount,
      description,
      date: date || new Date()
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTripExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;

    const expenses = await Budget.findAll({
      where: { tripId },
      order: [['date', 'DESC']]
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({
      expenses,
      totalExpenses,
      remainingBudget: (await Trip.findByPk(tripId)).budget - totalExpenses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { category, amount, description, date } = req.body;

    const expense = await Budget.findByPk(expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }

    await expense.update({
      category: category || expense.category,
      amount: amount !== undefined ? amount : expense.amount,
      description: description || expense.description,
      date: date || expense.date
    });

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Budget.findByPk(expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }

    await expense.destroy();

    res.json({ message: 'Dépense supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBudgetSummary = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip non trouvé' });
    }

    const expenses = await Budget.findAll({ where: { tripId } });

    const summary = {
      totalBudget: trip.budget,
      totalSpent: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      remaining: trip.budget - expenses.reduce((sum, exp) => sum + exp.amount, 0),
      byCategory: {}
    };

    expenses.forEach(exp => {
      if (!summary.byCategory[exp.category]) {
        summary.byCategory[exp.category] = 0;
      }
      summary.byCategory[exp.category] += exp.amount;
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
EOF

# Models
cat > backend/models/User.js << 'EOF'
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: DataTypes.STRING
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
});

module.exports = User;
EOF

cat > backend/models/Trip.js << 'EOF'
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trip = sequelize.define('Trip', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  budget: DataTypes.FLOAT,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'planning'
  }
});

module.exports = Trip;
EOF

cat > backend/models/Place.js << 'EOF'
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Place = sequelize.define('Place', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: DataTypes.TEXT,
  visitDate: DataTypes.DATE,
  estimatedCost: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = Place;
EOF

cat > backend/models/Budget.js << 'EOF'
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define('Budget', {
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: DataTypes.TEXT,
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Budget;
EOF

# Routes
cat > backend/routes/trips.js << 'EOF'
const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const placeController = require('../controllers/placeController');
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/auth');

router.post('/', auth, tripController.createTrip);
router.get('/user/:userId', auth, tripController.getUserTrips);
router.get('/:tripId', auth, tripController.getTripById);
router.put('/:tripId', auth, tripController.updateTrip);
router.delete('/:tripId', auth, tripController.deleteTrip);
router.get('/:tripId/optimal-route', auth, tripController.generateOptimalRoute);

router.post('/:tripId/places', auth, placeController.addPlace);
router.get('/:tripId/places', auth, placeController.getTripPlaces);
router.put('/places/:placeId', auth, placeController.updatePlace);
router.delete('/places/:placeId', auth, placeController.deletePlace);
router.put('/:tripId/places/reorder', auth, placeController.reorderPlaces);

router.post('/:tripId/expenses', auth, budgetController.addExpense);
router.get('/:tripId/expenses', auth, budgetController.getTripExpenses);
router.put('/expenses/:expenseId', auth, budgetController.updateExpense);
router.delete('/expenses/:expenseId', auth, budgetController.deleteExpense);
router.get('/:tripId/budget-summary', auth, budgetController.getBudgetSummary);

module.exports = router;
EOF

# Utils - Route Optimizer
cat > backend/utils/routeOptimizer.js << 'EOF'
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function nearestNeighbor(places) {
  if (places.length === 0) return [];
  if (places.length === 1) return places;

  const unvisited = [...places];
  const route = [unvisited.shift()];

  while (unvisited.length > 0) {
    const current = route[route.length - 1];
    let nearest = unvisited[0];
    let minDistance = calculateDistance(
      current.latitude,
      current.longitude,
      nearest.latitude,
      nearest.longitude
    );

    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(
        current.latitude,
        current.longitude,
        unvisited[i].latitude,
        unvisited[i].longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = unvisited[i];
      }
    }

    route.push(nearest);
    unvisited.splice(unvisited.indexOf(nearest), 1);
  }

  return route;
}

async function calculateOptimalRoute(places) {
  if (!places || places.length === 0) {
    return {
      route: [],
      totalDistance: 0,
      optimizationLevel: 'N/A'
    };
  }

  const optimizedRoute = nearestNeighbor(places);

  let totalDistance = 0;
  for (let i = 0; i < optimizedRoute.length - 1; i++) {
    totalDistance += calculateDistance(
      optimizedRoute[i].latitude,
      optimizedRoute[i].longitude,
      optimizedRoute[i + 1].latitude,
      optimizedRoute[i + 1].longitude
    );
  }

  return {
    route: optimizedRoute,
    totalDistance: Math.round(totalDistance * 100) / 100,
    optimizationLevel: 'Optimal'
  };
}

module.exports = { calculateOptimalRoute, calculateDistance };
EOF

# Middleware - Auth
cat > backend/middleware/auth.js << 'EOF'
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};
EOF

# Config - Database
cat > backend/config/database.js << 'EOF'
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432
  }
);

module.exports = sequelize;
EOF

# Backend package.json
cat > backend/package.json << 'EOF'
{
  "name": "plantripave-backend",
  "version": "1.0.0",
  "description": "Backend for PlanTripSave",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.2",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF

# Backend server.js
cat > backend/server.js << 'EOF'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const tripsRouter = require('./routes/trips');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/trips', tripsRouter);

sequelize.sync().then(() => {
  console.log('Database synchronized');
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
}).catch(err => {
  console.error('Database sync failed:', err);
});
EOF

# Backend .env
cat > backend/.env << 'EOF'
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=plantripave
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
EOF

# ==================== FRONTEND ====================

# Frontend package.json
cat > frontend/package.json << 'EOF'
{
  "name": "plantripave-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  }
}
EOF

# Frontend .env
cat > frontend/.env << 'EOF'
REACT_APP_API_URL=http://localhost:5000/api
EOF

# Frontend pages
cat > frontend/src/pages/Dashboard.jsx << 'EOFJS'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTrip, setNewTrip] = useState({
    name: '',
    startDate: '',
    endDate: '',
    budget: ''
  });

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/trips/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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
        {
          ...newTrip,
          userId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTrips([...trips, response.data]);
      setNewTrip({ name: '', startDate: '', endDate: '', budget: '' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Êtes-vous sûr?')) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/trips/${tripId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setTrips(trips.filter(trip => trip.id !== tripId));
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="dashboard-container">
      <h1>Mes Voyages</h1>

      <div className="form-section">
        <h2>Créer un nouveau voyage</h2>
        <form onSubmit={handleCreateTrip}>
          <input
            type="text"
            placeholder="Nom du voyage"
            value={newTrip.name}
            onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
            required
          />
          <input
            type="date"
            value={newTrip.startDate}
            onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
            required
          />
          <input
            type="date"
            value={newTrip.endDate}
            onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Budget (€)"
            value={newTrip.budget}
            onChange={(e) => setNewTrip({ ...newTrip, budget: parseFloat(e.target.value) })}
            required
          />
          <button type="submit">Créer</button>
        </form>
      </div>

      <div className="trips-grid">
        {trips.length === 0 ? (
          <p>Aucun voyage</p>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className="trip-card">
              <h3>{trip.name}</h3>
              <p>{new Date(trip.startDate).toLocaleDateString()}</p>
              <p>Budget: {trip.budget}€</p>
              <div className="card-actions">
                <a href={`/trip/${trip.id}`} className="btn-primary">Détails</a>
                <button onClick={() => handleDeleteTrip(trip.id)} className="btn-danger">
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
EOFJS

cat > frontend/src/pages/TripPlanner.jsx << 'EOFJS'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/TripPlanner.css';

function TripPlanner() {
  const tripId = window.location.pathname.split('/')[2];
  const [trip, setTrip] = useState(null);
  const [places, setPlaces] = useState([]);
  const [newPlace, setNewPlace] = useState({
    name: '',
    latitude: '',
    longitude: ''
  });
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
        {
          ...newPlace,
          latitude: parseFloat(newPlace.latitude),
          longitude: parseFloat(newPlace.longitude)
        },
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
  if (!trip) return <div>Trip non trouvé</div>;

  return (
    <div className="planner-container">
      <h1>{trip.name}</h1>

      <div className="planner-grid">
        <div className="info-section">
          <h2>Ajouter un lieu</h2>
          <form onSubmit={handleAddPlace}>
            <input
              type="text"
              placeholder="Nom du lieu"
              value={newPlace.name}
              onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
              required
            />
            <input
              type="number"
              step="0.0001"
              placeholder="Latitude"
              value={newPlace.latitude}
              onChange={(e) => setNewPlace({ ...newPlace, latitude: e.target.value })}
              required
            />
            <input
              type="number"
              step="0.0001"
              placeholder="Longitude"
              value={newPlace.longitude}
              onChange={(e) => setNewPlace({ ...newPlace, longitude: e.target.value })}
              required
            />
            <button type="submit">Ajouter</button>
          </form>

          <h3>Lieux ({places.length})</h3>
          <ul className="places-list">
            {places.map((place) => (
              <li key={place.id}>
                <div>
                  <strong>{place.name}</strong>
                  <p>{place.latitude}, {place.longitude}</p>
                </div>
                <button 
                  onClick={() => handleDeletePlace(place.id)}
                  className="btn-delete"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TripPlanner;
EOFJS

cat > frontend/src/pages/BudgetTracker.jsx << 'EOFJS'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BudgetTracker.css';

function BudgetTracker() {
  const tripId = window.location.pathname.split('/')[2];
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    category: 'Transport',
    amount: '',
    description: ''
  });
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
        {
          ...newExpense,
          amount: parseFloat(newExpense.amount)
        },
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
          <h2>Ajouter une dépense</h2>
          <form onSubmit={handleAddExpense}>
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            >
              <option>Transport</option>
              <option>Hébergement</option>
              <option>Nourriture</option>
              <option>Activités</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Montant (€)"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            />
            <button type="submit">Ajouter</button>
          </form>
        </div>

        <div className="expenses-list-section">
          <h2>Dépenses</h2>
          <ul className="expenses-list">
            {expenses.map((expense) => (
              <li key={expense.id} className="expense-item">
                <div>
                  <strong>{expense.category}</strong>
                  <p>{expense.description}</p>
                </div>
                <div className="expense-actions">
                  <span className="amount">{expense.amount}€</span>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="btn-delete"
                  >
                    ✕
                  </button>
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
EOFJS

# Frontend styles
cat > frontend/src/styles/Dashboard.css << 'EOF'
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-container h1 {
  color: #333;
  margin-bottom: 30px;
}

.form-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.form-section form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.form-section input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-section button {
  padding: 12px 25px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-section button:hover {
  background: #0056b3;
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.trip-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.trip-card h3 {
  color: #333;
  margin-bottom: 10px;
}

.trip-card p {
  color: #666;
  margin: 5px 0;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-primary, .btn-danger {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
}

.btn-primary {
  background: #28a745;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}
EOF

cat > frontend/src/styles/TripPlanner.css << 'EOF'
.planner-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.planner-container h1 {
  color: #333;
  margin-bottom: 20px;
}

.planner-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.info-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-section h2 {
  color: #555;
  margin-bottom: 15px;
}

.info-section form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.info-section input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.info-section button {
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.places-list {
  list-style: none;
  padding: 0;
}

.places-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  gap: 10px;
}

.btn-delete {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
}
EOF

cat > frontend/src/styles/BudgetTracker.css << 'EOF'
.budget-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.budget-container h1 {
  color: #333;
  margin-bottom: 30px;
}

.budget-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.expenses-section,
.expenses-list-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.expenses-section h2,
.expenses-list-section h2 {
  color: #555;
  margin-bottom: 20px;
}

.expenses-section form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.expenses-section select,
.expenses-section input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.expenses-section button {
  padding: 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.expenses-list {
  list-style: none;
  padding: 0;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  gap: 15px;
}

.expense-item strong {
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.expense-item p {
  color: #666;
  margin: 0;
}

.expense-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.expense-actions .amount {
  font-weight: bold;
  color: #dc3545;
}

.btn-delete {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .budget-grid {
    grid-template-columns: 1fr;
  }
}
EOF

# Frontend App.jsx
cat > frontend/src/App.jsx << 'EOFJS'
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
        <Route 
          path="/dashboard" 
          element={token ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/trip/:tripId" 
          element={token ? <TripPlanner /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/trip/:tripId/budget" 
          element={token ? <BudgetTracker /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
EOFJS

# Frontend index.jsx
cat > frontend/src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Frontend public/index.html
mkdir -p frontend/public
cat > frontend/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PlanTripSave</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
EOF

# README
cat > README.md << 'EOF'
# PlanTripSave

Application de planification et gestion de voyages.

## Installation

### Backend
```bash
cd backend
npm install
npm run dev
