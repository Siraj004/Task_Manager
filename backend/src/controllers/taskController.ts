import { Request, Response } from 'express';
import { Task, Comment, User, Project } from '../models';

// Create a task -- Admin or Project Manager
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, status = 'Pending', projectId, assigneeId } = req.body;
    
    // Validate project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

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

    res.status(201).json(taskWithDetails);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

// Update a task -- roles: Admin, Project Manager, Developer, Tester
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
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

// Delete a task -- Admin or Project Manager
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await Task.destroy({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting task' });
  }
};

// List all tasks (all authenticated roles)
// List all tasks (all authenticated roles)
// List all tasks (all authenticated roles)
export const listTasks = async (_req: Request, res: Response) => {
  try {
    const tasks = await Task.findAll({
      attributes: ['id', 'title', 'description', 'status', 'projectId', 'assigneeId'], // ✅ include projectId!
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'username'] },
        { model: Comment, include: [{ model: User, attributes: ['username'] }] }
      ]
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};


// Get single task with comments
export const getTaskById = async (req: Request, res: Response) => {
  try {
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
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching task' });
  }
};

// Mark a task as tested -- roles: Admin or Tester
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
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking task as tested' });
  }
};

// Add comment to task -- All authenticated users can comment
export const addComment = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const taskId = req.params.id;
    const userId = (req as any).user.id;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await Comment.create({ text, taskId, userId });
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['username'] }]
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding comment' });
  }
};
