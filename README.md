# PlanTripSave - Planifier Voyager Economiser

Plateforme web de planification de road-trip économique et communautaire.

## Installation

### Backend
bash
cd backend
npm install
npm run init-db
npm run dev


### Frontend
bash
cd frontend
npm install
npm run dev


## Base de données

PostgreSQL est utilisée. Configuration dans `.env`

## API Documentation

- GET `/api/trips` - Récupérer tous les voyages
- POST `/api/auth/login` - Connexion
- POST `/api/auth/register` - Inscription

## Technologies

- Backend: Node.js + Express + PostgreSQL
- Frontend: React + Vite
- Auth: JWT

## License

MIT
