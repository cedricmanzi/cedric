const { sequelize } = require('../config/db');
const Service = require('../models/Service');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Initialize database with default services and admin user
const initializeDatabase = async () => {
  try {
    // Sync all models with the database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');

    // Check if services already exist
    const servicesCount = await Service.count();
    if (servicesCount === 0) {
      // Create default services
      const defaultServices = [
        {
          serviceCode: 'ENG-REP',
          serviceName: 'Engine repair',
          servicePrice: 150000
        },
        {
          serviceCode: 'TRANS-REP',
          serviceName: 'Transmission repair',
          servicePrice: 80000
        },
        {
          serviceCode: 'OIL-CHG',
          serviceName: 'Oil Change',
          servicePrice: 60000
        },
        {
          serviceCode: 'CHAIN-REP',
          serviceName: 'Chain replacement',
          servicePrice: 40000
        },
        {
          serviceCode: 'DISC-REP',
          serviceName: 'Disc replacement',
          servicePrice: 400000
        },
        {
          serviceCode: 'WHEEL-ALN',
          serviceName: 'Wheel alignment',
          servicePrice: 5000
        }
      ];

      await Service.bulkCreate(defaultServices);
      console.log('Default services created');
    } else {
      console.log('Services already exist, skipping creation');
    }

    // Check if admin user exists
    const adminExists = await User.findOne({
      where: { role: 'Admin' }
    });

    if (!adminExists) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'Admin',
        email: 'admin@smartpark.com',
        fullName: 'System Administrator'
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists, skipping creation');
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
};

// Run the initialization
initializeDatabase();
