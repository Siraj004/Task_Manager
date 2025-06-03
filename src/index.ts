// index.ts placeholder
// src/index.ts
import app from './app';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { redisClient } from './config/redis';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize PostgreSQL and Redis, then start the server
(async () => {
  await connectDB();
  // Redis client is already initialized on import
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
