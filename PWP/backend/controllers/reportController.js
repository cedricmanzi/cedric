const { Op } = require('sequelize');
const ServiceRecord = require('../models/ServiceRecord');
const Car = require('../models/Car');
const Service = require('../models/Service');
const User = require('../models/User');

// Generate daily report
exports.generateDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    let reportDate;

    if (date) {
      reportDate = new Date(date);
    } else {
      reportDate = new Date();
    }

    // Set time to beginning of day
    reportDate.setHours(0, 0, 0, 0);

    // Set end date to end of the same day
    const endDate = new Date(reportDate);
    endDate.setHours(23, 59, 59, 999);

    // Find all service records for the specified day
    const serviceRecords = await ServiceRecord.findAll({
      where: {
        paymentDate: {
          [Op.between]: [reportDate, endDate]
        }
      },
      include: [
        { model: Car },
        { model: Service },
        { model: User, attributes: ['id', 'username', 'fullName'] }
      ],
      order: [['paymentDate', 'ASC']]
    });

    // Calculate total amount
    const totalAmount = serviceRecords.reduce((sum, record) => sum + parseFloat(record.amountPaid), 0);

    // Group by service
    const serviceGroups = {};
    serviceRecords.forEach(record => {
      const serviceName = record.Service.serviceName;
      if (!serviceGroups[serviceName]) {
        serviceGroups[serviceName] = {
          count: 0,
          total: 0,
          records: []
        };
      }

      serviceGroups[serviceName].count += 1;
      serviceGroups[serviceName].total += parseFloat(record.amountPaid);
      serviceGroups[serviceName].records.push({
        recordNumber: record.recordNumber,
        plateNumber: record.Car.plateNumber,
        amountPaid: record.amountPaid,
        paymentDate: record.paymentDate,
        receivedBy: record.receivedBy
      });
    });

    // Format the report
    const report = {
      date: reportDate.toISOString().split('T')[0],
      totalRecords: serviceRecords.length,
      totalAmount,
      services: Object.keys(serviceGroups).map(serviceName => ({
        serviceName,
        count: serviceGroups[serviceName].count,
        totalAmount: serviceGroups[serviceName].total,
        records: serviceGroups[serviceName].records
      }))
    };

    res.status(200).json(report);
  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Generate monthly report
exports.generateMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Default to current month and year if not provided
    const reportMonth = month ? parseInt(month) - 1 : new Date().getMonth();
    const reportYear = year ? parseInt(year) : new Date().getFullYear();

    // Create date range for the month
    const startDate = new Date(reportYear, reportMonth, 1);
    const endDate = new Date(reportYear, reportMonth + 1, 0, 23, 59, 59, 999);

    // Find all service records for the specified month
    const serviceRecords = await ServiceRecord.findAll({
      where: {
        paymentDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        { model: Car },
        { model: Service },
        { model: User, attributes: ['id', 'username', 'fullName'] }
      ],
      order: [['paymentDate', 'ASC']]
    });

    // Calculate total amount
    const totalAmount = serviceRecords.reduce((sum, record) => sum + parseFloat(record.amountPaid), 0);

    // Group by day
    const dailyGroups = {};
    serviceRecords.forEach(record => {
      const day = record.paymentDate.toISOString().split('T')[0];
      if (!dailyGroups[day]) {
        dailyGroups[day] = {
          count: 0,
          total: 0,
          services: {}
        };
      }

      dailyGroups[day].count += 1;
      dailyGroups[day].total += parseFloat(record.amountPaid);

      const serviceName = record.Service.serviceName;
      if (!dailyGroups[day].services[serviceName]) {
        dailyGroups[day].services[serviceName] = {
          count: 0,
          total: 0
        };
      }

      dailyGroups[day].services[serviceName].count += 1;
      dailyGroups[day].services[serviceName].total += parseFloat(record.amountPaid);
    });

    // Format the report
    const report = {
      month: reportMonth + 1,
      year: reportYear,
      totalRecords: serviceRecords.length,
      totalAmount,
      days: Object.keys(dailyGroups).map(day => ({
        date: day,
        count: dailyGroups[day].count,
        totalAmount: dailyGroups[day].total,
        services: Object.keys(dailyGroups[day].services).map(serviceName => ({
          serviceName,
          count: dailyGroups[day].services[serviceName].count,
          totalAmount: dailyGroups[day].services[serviceName].total
        }))
      }))
    };

    res.status(200).json(report);
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
