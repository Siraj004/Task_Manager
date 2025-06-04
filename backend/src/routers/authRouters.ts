import express from 'express';
import { register, login, refreshToken, logout } from '../controllers/authController';
import { verifyJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// Registration and login routes
router.post('/register', register);
router.post('/login', login);

// Token refresh and logout
router.get('/refresh-token', refreshToken);
router.post('/logout', logout);

// Example protected route
router.get('/protected', verifyJWT, (req, res) => {
  res.json({ message: `Hello, ${(req as any).user}! This is protected.` });
});

export default router;
