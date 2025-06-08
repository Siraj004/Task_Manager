import { Request, Response } from 'express';
import { Project, Task } from '../models';

export const createProject = async (req: Request, res: Response) => {
  const { name, descripton } = req.body;
  const project = await Project.create({ name, descripton });
  res.status(201).json(project);
};

export const deleteProject = async (req: Request, res: Response) => {
  const id = req.params.id;
  await Project.destroy({ where: { id } });
  res.status(204).send();
};

export const listProjects = async (_req: Request, res: Response) => {
  const projects = await Project.findAll();
  res.json(projects);
};

export const getProjectById = async (req: Request, res: Response) => {
  const project = await Project.findByPk(req.params.id, {
    include: [{ model: Task, include: ['assignee', 'Comments'] }]
  });
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
};
