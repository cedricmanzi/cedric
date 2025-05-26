const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./config/db');

// Load environment variables first
dotenv.config();

// Debug: Check if environment variables are loading
console.log('Loaded DB_PASSWORD:', process.env.DB_PASSWORD);

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Models
const User = require('./models/User');
const Service = require('./models/Service');
const Car = require('./models/Car');
const ServiceRecord = require('./models/ServiceRecord');

// Routes
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const carRoutes = require('./routes/carRoutes');
const serviceRecordRoutes = require('./routes/serviceRecordRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/service-records', serviceRecordRoutes);
app.use('/api/reports', reportRoutes);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync models (use { alter: true } or { force: true } in development if needed)
    await sequelize.sync();
    console.log('All models were synchronized successfully.');

    // Start server
    const PORT = process.env.PORT || 6000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1); // Exit with failure
  }
};

// Start the application
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // You might want to exit here in production
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Export app for testing
module.exports = app;
