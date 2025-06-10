// backend/app.ts
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routers/authRoutes';
import ProjectRoutes from './routers/ProjectRoutes';
import taskRoutes from './routers/taskRoutes';
import adminRoutes from './routers/adminRoutes';

const app = express();

// ✅ Detect origin dynamically based on environment
const allowedOrigins = [
  'http://localhost:3000', // local dev
  'https://task-manager-ehbh.onrender.com', // replace with your frontend Render URL
  'https://larklabs-ai.onrender.com'   // optional, if calling from backend
];

// ✅ Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow no origin (Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', ProjectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Health check
app.get('/', (_req, res) => res.send('API is running'));
app.get('/api/ping', (_req, res) => res.json({ message: 'pong' }));

export default app;
