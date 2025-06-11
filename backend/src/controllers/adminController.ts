import { Request, Response } from 'express';
import { User, Role } from '../models';
import { cache } from '../utils/cache';
import Notification from '../models/Notification';

// List all users (with roles) – Admin only
export const listUsers = async (_req: Request, res: Response) => {
  const cacheKey = 'admin:all_users';
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached); // ✅ Return cached response

  // ❌ No cache? Fetch from DB
  const users = await User.findAll({ include: [Role] });

  await cache.set(cacheKey, users, 120); // ✅ Cache for 2 minutes
  res.json(users);
};


// Update user roles – Admin only
export const updateUserRoles = async (req: Request, res: Response) => {
  const user = await User.findByPk(req.params.id);
  const { roles } = req.body; // e.g. ["Admin", "Developer"]
  if (!user) return res.status(404).send();
  const roleInstances = await Role.findAll({ where: { name: roles } });
  await user.setRoles(roleInstances);
  await cache.del('admin:all_users'); 
  res.json({ message: 'User roles updated' });
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};
