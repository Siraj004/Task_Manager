import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
const {
  DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
} = process.env;

// Configure Sequelize to connect to PostgreSQL
export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: DB_HOST,
  port: DB_PORT ? Number(DB_PORT) : 5432,
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database');
    // Sync all models (alter in dev; use migrations for prod)
    await sequelize.sync();
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
};
