import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Get database connection string from environment variables
const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/stepful';

// Initialize Sequelize with PostgreSQL
export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Function to test database connection
export const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};
