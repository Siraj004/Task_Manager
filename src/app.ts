// app.ts placeholder
// src/app.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

export default app;
