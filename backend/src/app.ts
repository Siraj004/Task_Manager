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
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
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
