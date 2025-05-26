const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Car = require('./Car');
const Service = require('./Service');
const User = require('./User');

const ServiceRecord = sequelize.define('ServiceRecord', {
  recordNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  receivedBy: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Define relationships
ServiceRecord.belongsTo(Car, { foreignKey: 'plateNumber' });
ServiceRecord.belongsTo(Service, { foreignKey: 'serviceCode' });
ServiceRecord.belongsTo(User, { foreignKey: 'userId' });

module.exports = ServiceRecord;
