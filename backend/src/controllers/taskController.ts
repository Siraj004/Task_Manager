// backend/controllers/taskController.ts
import { Request, Response } from 'express';
import { Task, Comment, User, Project } from '../models';
import { cache } from '../utils/cache';

// ✅ Helper function to invalidate task-related caches
const invalidateTaskCaches = async (taskId?: string) => {
  await cache.del('tasks:all');
  if (taskId) {
    await cache.del(`task:${taskId}`);
  }
};

// ✅ Create a task
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, status = 'Pending', projectId, assigneeId } = req.body;

    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      title,
      description,
      status,
      projectId: parseInt(projectId),
      assigneeId: assigneeId ? parseInt(assigneeId) : null
    });

    const taskWithDetails = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'username'] },
        {
          model: Comment,
          include: [{ model: User, attributes: ['username'] }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    await invalidateTaskCaches();

    res.status(201).json(taskWithDetails);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

// ✅ Update a task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.update(req.body);

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'username'] },
        { model: Comment, include: [{ model: User, attributes: ['username'] }] }
      ]
    });

    await invalidateTaskCaches(req.params.id);

    const io = req.app.get('io');
    if (io) io.emit('taskUpdated', updatedTask);

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

// ✅ Delete a task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await Task.destroy({ where: { id } });
    await invalidateTaskCaches(id);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting task' });
  }
};

// ✅ List all tasks (cached)
export const listTasks = async (_req: Request, res: Response) => {
  const cacheKey = 'tasks:all';
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);

  const tasks = await Task.findAll({
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'username'] },
      { model: Comment, include: [{ model: User, attributes: ['username'] }] }
    ]
  });

  await cache.set(cacheKey, tasks, 120);
  res.json(tasks);
};

// ✅ Get a single task (cached)
export const getTaskById = async (req: Request, res: Response) => {
  const cacheKey = `task:${req.params.id}`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);

  const task = await Task.findByPk(req.params.id, {
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'username'] },
      {
        model: Comment,
        include: [{ model: User, attributes: ['username'] }]
      }
    ]
  });

  if (!task) return res.status(404).json({ message: 'Task not found' });

  await cache.set(cacheKey, task, 120);
  res.json(task);
};

// ✅ Mark task as tested
export const markTested = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.update({ status: 'tested' });

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'username'] },
        { model: Comment, include: [{ model: User, attributes: ['username'] }] }
      ]
    });

    await invalidateTaskCaches(req.params.id);
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking task as tested' });
  }
};

// ✅ Add comment to a task
export const addComment = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const taskId = req.params.id;
    const userId = (req as any).user.id;

    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await Comment.create({ text, taskId, userId });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['username'] }]
    });

    await invalidateTaskCaches(taskId);
    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding comment' });
  }
};
