// backend/controllers/projectController.ts
import { Request, Response } from 'express';
import { Project, Task, Comment, User } from '../models';

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({ name, description });
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating project' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await Project.destroy({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting project' });
  }
};

export const listProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: Task,
          include: [{ model: User, as: 'assignee', attributes: ['username'] }]
        }
      ]
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

// backend/controllers/projectController.ts
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'User not found' });

    const roles = await user.getRoles();
    const roleNames = roles.map((r: any) => r.name);

    const project = await Project.findByPk(req.params.id, {
      include: [{
        model: Task,
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'username'] },
          {
            model: Comment,
            include: [{ model: User, attributes: ['username'] }],
            order: [['createdAt', 'DESC']]
          }
        ]
      }]
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.json({
      ...project.toJSON(),
      role: roleNames[0] // 👈 include role for UI
    });
  } catch (error) {
    console.error('❌ Error in getProjectById:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


  

