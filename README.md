# PlanTripSave

Application de planification et gestion de voyages avec optimisation d'itineraires.

## Features

- Creer et gerer vos voyages
- Planifier vos destinations
- Suivre vos depenses par categorie
- Optimiser vos itineraires

## Installation

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Configuration

Creer un fichier `.env` dans `backend/` avec:
```
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=plantripave
JWT_SECRET=your_secret_key
NODE_ENV=development
```

## API Endpoints

### Trips
- POST /api/trips - Creer un voyage
- GET /api/trips/user/:userId - Recuperer les voyages
- GET /api/trips/:tripId - Details d'un voyage
- PUT /api/trips/:tripId - Mettre a jour
- DELETE /api/trips/:tripId - Supprimer

### Places
- POST /api/trips/:tripId/places - Ajouter un lieu
- GET /api/trips/:tripId/places - Recuperer les lieux
- DELETE /api/trips/places/:placeId - Supprimer un lieu

### Expenses
- POST /api/trips/:tripId/expenses - Ajouter une depense
- GET /api/trips/:tripId/expenses - Recuperer les depenses
- DELETE /api/trips/expenses/:expenseId - Supprimer une depense

## License

MIT
