// backend/app.ts
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routers/authRoutes';
import ProjectRoutes from './routers/ProjectRoutes';
import taskRoutes from './routers/taskRoutes';
import adminRoutes from './routers/adminRoutes';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
   'http://localhost:3000',
   'https://task-manager-ehbh.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', ProjectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (_req, res) => {
  res.send('API is running');
});

export default app;
