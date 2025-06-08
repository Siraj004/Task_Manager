import { Request, Response } from 'express';
import { Task } from '../models';

// Create a task – Admin or Project Manager
export const createTask = async (req: Request, res: Response) => {
  const { title, description, status, projectId, assigneeId } = req.body;
  const task = await Task.create({ title, description, status, projectId, assigneeId });
  res.status(201).json(task);
};

// Update a task – roles: Admin, Project Manager, Developer, Tester
export const updateTask = async (req: Request, res: Response) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).send();
  await task.update(req.body);
  res.json(task);
};

// Delete a task – Admin or Project Manager
export const deleteTask = async (req: Request, res: Response) => {
  const id = req.params.id;
  await Task.destroy({ where: { id } });
  res.status(204).send();
};

// List all tasks (all authenticated roles)
export const listTasks = async (_req: Request, res: Response) => {
  const tasks = await Task.findAll();
  res.json(tasks);
};

// Mark a task as tested – roles: Admin or Tester
export const markTested = async (req: Request, res: Response) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).send();
  await task.update({ status: 'tested' });
  res.json(task);
};
