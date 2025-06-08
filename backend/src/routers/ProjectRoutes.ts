import express from 'express';
import { createProject, deleteProject, listProjects, getProjectById } from '../controllers/projectController';
import { verifyJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = express.Router();

router.post('/', verifyJWT, authorizeRoles(['Admin']), createProject);
router.delete('/:id', verifyJWT, authorizeRoles(['Admin']), deleteProject);
router.get('/', verifyJWT, authorizeRoles(['Admin','Project Manager','Developer','Tester','Viewer']), listProjects);
router.get('/:id', verifyJWT, authorizeRoles(['Admin','Project Manager','Developer','Tester','Viewer']), getProjectById);
export default router;