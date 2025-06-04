import app from './app';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { redisClient } from './config/redis';

dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  // Redis client is initialized upon import
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
