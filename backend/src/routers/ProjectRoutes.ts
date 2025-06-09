// backend/routers/taskRoutes.ts
import express from 'express';
import {
  createTask, updateTask, deleteTask,
  listTasks, getTaskById, markTested, addComment
} from '../controllers/taskController';
import { verifyJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { getProjectById } from '../controllers/projectController';

const router = express.Router();

// Tasks: list (with optional project filter) and create
router.get('/', verifyJWT, listTasks);
router.post('/', verifyJWT, authorizeRoles(['Admin', 'Project Manager']), createTask);

// Task detail, update, delete
// In projectRoutes.ts:
router.get('/:id', verifyJWT, authorizeRoles(['Admin','Project Manager','Developer','Tester','Viewer']), getProjectById);
router.put('/:id', verifyJWT, authorizeRoles(['Admin', 'Project Manager', 'Developer', 'Tester']), updateTask);
router.delete('/:id', verifyJWT, authorizeRoles(['Admin', 'Project Manager']), deleteTask);

// Mark as tested
router.post('/:id/test', verifyJWT, authorizeRoles(['Admin', 'Tester']), markTested);

// Add comment
router.post('/:id/comments', verifyJWT, addComment);

export default router;
