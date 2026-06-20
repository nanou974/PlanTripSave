const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define('Budget', {
  category: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  description: DataTypes.TEXT,
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = Budget;
