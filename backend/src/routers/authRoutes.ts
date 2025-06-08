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

// ✅ Add this to fix the 404
router.get('/profile', verifyJWT, getProfile);

// Example protected route
router.get('/protected', verifyJWT, (req, res) => {
  res.json({ message: `Hello, ${(req as any).user.username}! This is a protected route.` });
});

export default router;
