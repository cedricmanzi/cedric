const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Validate required environment variables (allow empty DB_PASSWORD)
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_HOST'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Debug: log DB_PASSWORD to verify it's loading (optional)
console.log('Loaded DB_PASSWORD:', process.env.DB_PASSWORD ?? '(empty)');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || '', // Provide empty string if no password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 60000
    },
    retry: {
      match: [
        /ETIMEDOUT/, /EHOSTUNREACH/, /ECONNRESET/, /ECONNREFUSED/,
        /ESOCKETTIMEDOUT/, /EPIPE/, /EAI_AGAIN/,
        /SequelizeConnectionError/, /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/, /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/, /SequelizeConnectionTimedOutError/
      ],
      max: 3
    }
  }
);

// Test the connection on startup
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
})();

module.exports = { sequelize };
