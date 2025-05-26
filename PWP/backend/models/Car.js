const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Car = sequelize.define('Car', {
  plateNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  manufacturingYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1900,
      max: new Date().getFullYear() + 1
    }
  },
  driverPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mechanicName: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Car;
