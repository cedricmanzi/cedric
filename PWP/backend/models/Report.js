const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Patient = require('./Patient');
const Doctor = require('./Doctor');

const Report = sequelize.define('Report', {
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  findings: { type: DataTypes.TEXT }
});

Report.belongsTo(Patient, { foreignKey: 'patientId' });
Report.belongsTo(Doctor, { foreignKey: 'doctorId' });

module.exports = Report;
