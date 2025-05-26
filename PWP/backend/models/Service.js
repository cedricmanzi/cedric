const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Service = sequelize.define('Service', {
  serviceCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  serviceName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  servicePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

module.exports = Service;
