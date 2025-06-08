// === BACKEND ===




// File: src/routers/taskRoutes.ts (RBAC middleware usage example)
import express from 'express';
import {
  createTask,
  updateTask,
  deleteTask,
  listTasks,
  markTested
} from '../controllers/taskController';
import { verifyJWT } from '../middlewares/authMiddleware';
import { checkRole } from '../middlewares/checkRole';

const router = express.Router();

router.post('/', verifyJWT, checkRole('Admin', 'Project Manager'), createTask);
router.put('/:id', verifyJWT, checkRole('Admin', 'Project Manager', 'Developer'), updateTask);
router.delete('/:id', verifyJWT, checkRole('Admin', 'Project Manager'), deleteTask);
router.get('/', verifyJWT, checkRole('Admin', 'Project Manager', 'Developer', 'Tester', 'Viewer'), listTasks);
router.post('/:id/tested', verifyJWT, checkRole('Tester'), markTested);

export default router;