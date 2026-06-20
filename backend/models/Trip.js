const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trip = sequelize.define('Trip', {
  name: { type: DataTypes.STRING, allowNull: false },
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  budget: DataTypes.FLOAT,
  status: { type: DataTypes.STRING, defaultValue: 'planning' }
});

module.exports = Trip;
