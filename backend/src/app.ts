import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routers/authRouters';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  credentials: true
}));

// Routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

export default app;
