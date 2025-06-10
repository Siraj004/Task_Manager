// backend/controllers/projectController.ts
import { Request, Response } from 'express';
import { Project, Task, Comment, User } from '../models';
import { cache } from '../utils/cache';

// ✅ Reusable helper to invalidate project-related caches
const invalidateProjectCaches = async (projectId?: string) => {
  await cache.del('projects:all');
  if (projectId) {
    await cache.del(`project:${projectId}`);
  }
};

// ✅ Create a new project
export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({ name, description });

    await invalidateProjectCaches(); // ✅ Clear project list cache

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating project' });
  }
};

// ✅ Delete a project by ID
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Project.destroy({ where: { id } });

    await invalidateProjectCaches(id); // ✅ Clear both list and individual cache

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting project' });
  }
};

// ✅ Get list of all projects (cached)
export const listProjects = async (_req: Request, res: Response) => {
  const cacheKey = 'projects:all';
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);

  const projects = await Project.findAll({
    include: [
      {
        model: Task,
        include: [{ model: User, as: 'assignee', attributes: ['username'] }]
      }
    ]
  });

  await cache.set(cacheKey, projects, 120); // cache for 2 minutes
  res.json(projects);
};

// ✅ Get a specific project by ID (cached)
export const getProjectById = async (req: Request, res: Response) => {
  const cacheKey = `project:${req.params.id}`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'User not found' });

    const roles = await user.getRoles();
    const roleNames = roles.map((r: any) => r.name);

    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: Task,
          include: [
            { model: User, as: 'assignee', attributes: ['id', 'username'] },
            {
              model: Comment,
              include: [{ model: User, attributes: ['username'] }],
              order: [['createdAt', 'DESC']]
            }
          ]
        }
      ]
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const result = {
      ...project.toJSON(),
      role: roleNames[0]
    };

    await cache.set(cacheKey, result, 120); // cache for 2 minutes
    res.json(result);
  } catch (error) {
    console.error('❌ Error in getProjectById:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
