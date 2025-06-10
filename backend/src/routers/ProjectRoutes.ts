// backend/routers/projectRoutes.ts
import express from 'express';
import {
  createProject,
  deleteProject,
  listProjects,
  getProjectById
} from '../controllers/projectController';
import { verifyJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { cache } from '../utils/cache';

const router = express.Router();

// Project routes
router.get('/', verifyJWT, cache.cacheMiddleware(300), listProjects); // Cache for 5 minutes
router.post('/', verifyJWT, authorizeRoles(['Admin', 'Project Manager']), createProject);
router.get('/:id', verifyJWT, authorizeRoles(['Admin','Project Manager','Developer','Tester','Viewer']), cache.cacheMiddleware(300), getProjectById);
router.delete('/:id', verifyJWT, authorizeRoles(['Admin', 'Project Manager']), deleteProject);

export default router;
