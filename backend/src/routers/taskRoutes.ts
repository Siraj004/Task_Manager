// ✅ FILE: src/routers/taskRoutes.ts

import express from 'express';
import {
  createTask,
  updateTask,
  deleteTask,
  listTasks,
  getTaskById,
  markTested,
  addComment,
} from '../controllers/taskController';

import { verifyJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { cache } from '../utils/cache';

const router = express.Router();

/**
 * Task Routes – Role-Based Access Control (RBAC)
 */

// List All Tasks → Roles: Admin, Project Manager, Developer, Tester, Viewer
router.get(
  '/',
  verifyJWT,
  authorizeRoles(['Admin', 'Project Manager', 'Developer', 'Tester', 'Viewer']),
  cache.cacheMiddleware(300), // Cache for 5 minutes
  listTasks
);

// Get Task by ID → Roles: Admin, Project Manager, Developer, Tester, Viewer
router.get(
  '/:id',
  verifyJWT,
  authorizeRoles(['Admin', 'Project Manager', 'Developer', 'Tester', 'Viewer']),
  cache.cacheMiddleware(300), // Cache for 5 minutes
  getTaskById
);

// Create Task → Roles: Admin, Project Manager
router.post(
  '/',
  verifyJWT,
  authorizeRoles(['Admin', 'Project Manager']),
  createTask
);

// Delete Task → Roles: Admin, Project Manager
router.delete(
  '/:id',
  verifyJWT,
  authorizeRoles(['Admin', 'Project Manager']),
  deleteTask
);

// Update Task → Roles: Admin, Project Manager, Developer, Tester
router.put(
  '/:id',
  verifyJWT,
  authorizeRoles(['Admin', 'Project Manager', 'Developer', 'Tester']),
  updateTask
);

// Mark Task as Tested → Roles: Admin, Tester
router.post(
  '/:id/tested',
  verifyJWT,
  authorizeRoles(['Admin', 'Tester']),
  markTested
);

// Add Comment → Roles: Admin, Project Manager, Developer, Tester
router.post(
  '/:id/comments',
  verifyJWT,
  authorizeRoles(['Admin', 'Project Manager', 'Developer', 'Tester']),
  addComment
);

export default router;
