const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Place = sequelize.define('Place', {
  name: { type: DataTypes.STRING, allowNull: false },
  latitude: { type: DataTypes.FLOAT, allowNull: false },
  longitude: { type: DataTypes.FLOAT, allowNull: false },
  description: DataTypes.TEXT,
  visitDate: DataTypes.DATE,
  estimatedCost: { type: DataTypes.FLOAT, defaultValue: 0 },
  order: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = Place;
