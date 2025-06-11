// backend/index.ts
import dotenv from 'dotenv';
import app from './app';
import http from 'http';
import { initializeSocket } from './socket/socketServer'; // ✅ Adjust path if needed
import { connectDB } from './config/database';
import { seedRBAC } from './utils/seedRBAC';
import { seedAllData } from './utils/seedAllData';
import debug from 'debug';
debug.enable('socket.io:*');

dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    await seedRBAC();
    await seedAllData();
     const server = http.createServer(app);              // ✅ Wrap app in HTTP server
    const io = initializeSocket(server);                // ✅ Attach socket server
    app.set('io', io);                                  // ✅ Make available in req.app

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err);
  }
})();
