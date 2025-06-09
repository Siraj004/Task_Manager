// backend/routers/authRoutes.ts
import express from 'express';
import { register, login, refreshToken, logout, getProfile } from '../controllers/authController';
import { verifyJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Token refresh and logout
router.get('/refresh-token', refreshToken);
router.post('/logout', logout);

// Get profile (requires JWT)
router.get('/profile', verifyJWT, getProfile);

export default router;
