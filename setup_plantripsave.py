import os
import json
import subprocess
from pathlib import Path

# Configuration
REPO_PATH = Path.cwd()
GITHUB_REPO = "https://github.com/nanou974/PlanTripSave----Voyagez-sans-vous-ruiner-comme-vous-tes."

# Structures de fichiers
FILES = {
    "backend/package.json": {
        "name": "plantripsave-backend",
        "version": "1.0.0",
        "description": "Backend API Express + PostgreSQL",
        "main": "src/index.js",
        "scripts": {
            "dev": "nodemon src/index.js",
            "start": "node src/index.js",
            "test": "jest"
        },
        "dependencies": {
            "express": "^4.18.2",
            "pg": "^8.11.0",
            "dotenv": "^16.3.1",
            "jsonwebtoken": "^9.1.0",
            "bcryptjs": "^2.4.3",
            "cors": "^2.8.5"
        },
        "devDependencies": {
            "nodemon": "^3.0.1",
            "jest": "^29.7.0"
        }
    },
    "backend/src/index.js": '''const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const placeRoutes = require('./routes/placeRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
''',
    
    "backend/.env": '''DATABASE_URL=postgresql://user:password@localhost:5432/plantripsave
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
PORT=5000
NODE_ENV=development
''',

    "backend/src/config/database.js": '''const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

module.exports = pool;
''',

    "backend/src/middleware/authMiddleware.js": '''const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token invalide' });
    }
};

module.exports = authMiddleware;
''',

    "backend/src/controllers/authController.js": '''const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'Utilisateur créé', user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ message: 'Connexion réussie', token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = { register, login };
''',

    "backend/src/controllers/tripController.js": '''const pool = require('../config/database');

const createTrip = async (req, res) => {
    try {
        const { title, description, start_location, end_location, travel_mode, budget, start_date, end_date } = req.body;
        const userId = req.userId;

        const result = await pool.query(
            'INSERT INTO trips (user_id, title, description, start_location, end_location, travel_mode, budget, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [userId, title, description, start_location, end_location, travel_mode, budget, start_date, end_date]
        );

        res.status(201).json({ message: 'Trip créé', trip: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const getTrips = async (req, res) => {
    try {
        const { travel_mode, page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = 'SELECT * FROM trips';
        const params = [];

        if (travel_mode) {
            query += ' WHERE travel_mode = $1';
            params.push(travel_mode);
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const getTripById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM trips WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trip non trouvé' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const updateTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, budget } = req.body;
        const userId = req.userId;

        const tripCheck = await pool.query('SELECT * FROM trips WHERE id = $1 AND user_id = $2', [id, userId]);
        if (tripCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        const result = await pool.query(
            'UPDATE trips SET title = $1, description = $2, budget = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [title, description, budget, id]
        );

        res.json({ message: 'Trip mis à jour', trip: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const deleteTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const tripCheck = await pool.query('SELECT * FROM trips WHERE id = $1 AND user_id = $2', [id, userId]);
        if (tripCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        await pool.query('DELETE FROM trips WHERE id = $1', [id]);
        res.json({ message: 'Trip supprimé' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
''',

    "backend/src/controllers/placeController.js": '''const pool = require('../config/database');

const getPlaces = async (req, res) => {
    try {
        const { lat, lon, radius = 50, type, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = 'SELECT * FROM places WHERE is_validated = true';
        const params = [];

        if (type) {
            query += ' AND type = $' + (params.length + 1);
            params.push(type);
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const createPlace = async (req, res) => {
    try {
        const { name, description, type, latitude, longitude } = req.body;

        const result = await pool.query(
            'INSERT INTO places (name, description, type, latitude, longitude, is_validated) VALUES ($1, $2, $3, $4, $5, false) RETURNING *',
            [name, description, type, latitude, longitude]
        );

        res.status(201).json({ message: 'Lieu créé en attente de validation', place: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = { getPlaces, createPlace };
''',

    "backend/src/controllers/userController.js": '''const pool = require('../config/database');

const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const result = await pool.query('SELECT id, username, email, bio, travel_mode, profile_picture_url, created_at FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { username, bio, travel_mode, profile_picture_url } = req.body;
        const userId = req.userId;

        const result = await pool.query(
            'UPDATE users SET username = $1, bio = $2, travel_mode = $3, profile_picture_url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [username, bio, travel_mode, profile_picture_url, userId]
        );

        res.json({ message: 'Profil mis à jour', user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const getUserTrips = async (req, res) => {
    try {
        const userId = req.userId;
        const result = await pool.query('SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = { getProfile, updateProfile, getUserTrips };
''',

    "backend/src/routes/authRoutes.js": '''const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;
''',

    "backend/src/routes/tripRoutes.js": '''const express = require('express');
const { createTrip, getTrips, getTripById, updateTrip, deleteTrip } = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createTrip);
router.get('/', getTrips);
router.get('/:id', getTripById);
router.put('/:id', authMiddleware, updateTrip);
router.delete('/:id', authMiddleware, deleteTrip);

module.exports = router;
''',

    "backend/src/routes/placeRoutes.js": '''const express = require('express');
const { getPlaces, createPlace } = require('../controllers/placeController');

const router = express.Router();

router.get('/', getPlaces);
router.post('/', createPlace);

module.exports = router;
''',

    "backend/src/routes/userRoutes.js": '''const express = require('express');
const { getProfile, updateProfile, getUserTrips } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/trips', authMiddleware, getUserTrips);

module.exports = router;
''',

    "frontend/package.json": {
        "name": "plantripsave-frontend",
        "version": "0.1.0",
        "private": True,
        "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-router-dom": "^6.20.0",
            "axios": "^1.6.0",
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
            "extends": ["react-app"]
        },
        "browserslist": {
            "production": [">0.2%", "not dead", "not op_mini all"],
            "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
        },
        "devDependencies": {
            "react-scripts": "5.0.1"
        }
    },

    "frontend/public/index.html": '''<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="PlanTripSave - Planifier, Voyager, Économiser" />
    <title>PlanTripSave</title>
</head>
<body>
    <noscript>Vous devez activer JavaScript pour utiliser cette application.</noscript>
    <div id="root"></div>
</body>
</html>
''',

    "frontend/src/index.js": '''import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
''',

    "frontend/src/index.css": '''* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Source Sans Pro',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
''',

    "frontend/src/App.js": '''import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
''',

    "frontend/src/App.css": '''body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.navbar {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar a {
  color: white;
  text-decoration: none;
  margin: 0 1rem;
}

.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn:hover {
  background-color: #2980b9;
}
''',

    "frontend/src/pages/Home.js": '''import React from 'react';
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
''',

    "frontend/src/pages/Login.js": '''import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  return (
    <div className="container">
      <h1>Connexion</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn">Connexion</button>
      </form>
    </div>
  );
}

export default Login;
''',

    "frontend/src/pages/Register.js": '''import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password
      });
      navigate('/login');
    } catch (error) {
      alert('Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="container">
      <h1>Inscription</h1>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn">S'inscrire</button>
      </form>
    </div>
  );
}

export default Register;
''',

    "frontend/src/pages/Dashboard.js": '''import React, { useState, useEffect } from 'react';
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
''',

    ".github/workflows/nodejs.yml": '''name: Node.js CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x]

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    - name: Install dependencies
      run: npm run install-all
    - name: Run tests
      run: npm test --if-present
'''
}

def create_directories():
    """Crée tous les répertoires nécessaires"""
    dirs = [
        'backend/src/config',
        'backend/src/controllers',
        'backend/src/middleware',
        'backend/src/routes',
        'frontend/public',
        'frontend/src/pages',
        'frontend/src/components',
        'frontend/src/services',
        '.github/workflows',
        'docs',
        'tests'
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"✅ Dossier créé: {dir_path}")

def create_files():
    """Crée tous les fichiers"""
    for file_path, content in FILES.items():
        file_path = Path(file_path)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        if isinstance(content, dict):
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(content, f, indent=2, ensure_ascii=False)
        else:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
        
        print(f"✅ Fichier créé: {file_path}")

def git_push():
    """Pousse tous les fichiers sur GitHub"""
    try:
        subprocess.run(['git', 'add', '.'], check=True)
        subprocess.run(['git', 'commit', '-m', 'Initial commit: Backend + Frontend structure'], check=True)
        subprocess.run(['git', 'push', 'origin', 'main'], check=True)
        print("✅ Fichiers poussés sur GitHub!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur Git: {e}")

if __name__ == '__main__':
    print("🚀 Création de la structure du projet...")
    create_directories()
    print("\n📝 Création des fichiers...")
    create_files()
    print("\n📤 Envoi vers GitHub...")
    git_push()
    print("\n✨ Projet initialisé avec succès!")
