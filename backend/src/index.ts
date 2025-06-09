// backend/index.ts
import app from './app';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { seedRBAC } from './utils/seedRBAC';
import { seedAllData } from './utils/seedAllData';

dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  await seedRBAC();
  await seedAllData(); // Seed roles, permissions, and test data
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
