import express from 'express';
import { listUsers, updateUserRoles } from '../controllers/adminController';
import { verifyJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { cache } from '../utils/cache';

const router = express.Router();

// Admin: manage users and roles

router.get('/users', verifyJWT, authorizeRoles(['Admin']), cache.cacheMiddleware(120), listUsers);

router.put('/users/:id/roles', verifyJWT, authorizeRoles(['Admin']), updateUserRoles);

export default router;
