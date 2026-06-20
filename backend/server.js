const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const tripRoutes = require('./routes/trips');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const User = require('./models/User');
const Trip = require('./models/Trip');
const Place = require('./models/Place');
const Budget = require('./models/Budget');

Trip.hasMany(Place, { as: 'places', foreignKey: 'tripId' });
Place.belongsTo(Trip, { foreignKey: 'tripId' });
Trip.hasMany(Budget, { as: 'budgets', foreignKey: 'tripId' });
Budget.belongsTo(Trip, { foreignKey: 'tripId' });
User.hasMany(Trip, { foreignKey: 'userId' });
Trip.belongsTo(User, { foreignKey: 'userId' });

app.use('/api/trips', tripRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running on port ' + (process.env.PORT || 5000));
  sequelize.sync().then(() => {
    console.log('Database connected');
  }).catch(err => console.error('DB Error:', err));
});
