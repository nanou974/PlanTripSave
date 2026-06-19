const express = require('express');
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
