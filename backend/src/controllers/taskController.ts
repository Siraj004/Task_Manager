import { Request, Response } from 'express';
import { Task, Comment, User, Project } from '../models';
import { cache } from '../utils/cache';
import Notification from '../models/Notification';

// ✅ Helper function to invalidate task-related caches
const invalidateTaskCaches = async (taskId?: string) => {
  await cache.del('tasks:all');
  if (taskId) {
    await cache.del(`task:${taskId}`);
  }
};

// ✅ Create a task with Socket.IO broadcast
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, status = 'Pending', projectId, assigneeId } = req.body;
    const userId = (req as any).user.id;
    const username = (req as any).user.username;

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

    const io = req.app.get('io');
    if (io && typeof io.broadcastTaskCreated === 'function') {
      io.broadcastTaskCreated(
        project.id,
        taskWithDetails,
        username,
        userId
      );
    }

    // Find all users in the project
    if (project) {
      const members = await (project as any).getUsers();
      for (const user of members) {
        if (user.id !== (req as any).user.id) {
          await Notification.create({
            userId: user.id,
            type: 'task_created',
            message: `Task created: ${task.title}`
          });
        }
      }
    }

    res.status(201).json(taskWithDetails);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

// ✅ Update task with broadcast
export const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const username = (req as any).user.username;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const oldStatus = task.status;
    await task.update(req.body);

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'username'] },
        {
          model: Comment,
          include: [{ model: User, attributes: ['username'] }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    await invalidateTaskCaches(req.params.id);

    const io = req.app.get('io');
    if (io && typeof io.broadcastTaskUpdated === 'function') {
      io.broadcastTaskUpdated(
        task.projectId,
        { ...updatedTask?.toJSON(), oldStatus, updatedAt: new Date() },
        username,
        userId
      );
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

// ✅ Delete task
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
export const listTasks = async (req: Request, res: Response) => {
  const projectId = req.query.projectId;
  if (!projectId) {
    return res.status(400).json({ message: 'projectId is required' });
  }

  // Optionally: Check if user is a member of the project here

  const tasks = await Task.findAll({
    where: { projectId: parseInt(projectId as string) },
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'username'] },
      {
        model: Comment,
        include: [{ model: User, attributes: ['username'] }],
        order: [['createdAt', 'DESC']]
      }
    ]
  });

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
        include: [{ model: User, attributes: ['username'] }],
        order: [['createdAt', 'DESC']]
      }
    ]
  });

  if (!task) return res.status(404).json({ message: 'Task not found' });

  await cache.set(cacheKey, task, 120);
  res.json(task);
};

// ✅ Mark task as tested (status = 'tested')
export const markTested = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const username = (req as any).user.username;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const oldStatus = task.status;
    await task.update({ status: 'tested' });

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'username'] },
        {
          model: Comment,
          include: [{ model: User, attributes: ['username'] }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    await invalidateTaskCaches(req.params.id);

    const io = req.app.get('io');
    if (io && typeof io.broadcastTaskUpdated === 'function') {
      io.broadcastTaskUpdated(
        task.projectId,
        { ...updatedTask?.toJSON(), oldStatus, updatedAt: new Date() },
        username,
        userId
      );
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking task as tested' });
  }
};

// ✅ Add comment to task
export const addComment = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const taskId = req.params.id;
    const userId = (req as any).user.id;
    const username = (req as any).user.username;

    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await Comment.create({ text, taskId, userId });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['username'] }]
    });

    await invalidateTaskCaches(taskId);

    const io = req.app.get('io');
    if (io && typeof io.broadcastCommentAdded === 'function') {
      io.broadcastCommentAdded(
        task.projectId,
        {
          comment: commentWithUser,
          taskId,
          taskTitle: task.title,
          userId
        },
        username,
        userId
      );
    }

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding comment' });
  }
};
