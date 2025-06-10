// backend/index.ts
import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/database';
import { seedRBAC } from './utils/seedRBAC';
import { seedAllData } from './utils/seedAllData';

dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    await seedRBAC();
    await seedAllData();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err);
  }
})();
