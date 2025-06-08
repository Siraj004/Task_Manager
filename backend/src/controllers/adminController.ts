import { Request, Response } from 'express';
import { User, Role } from '../models';

// List all users (with roles) – Admin only
export const listUsers = async (_req: Request, res: Response) => {
  const users = await User.findAll({ include: [Role] });
  res.json(users);
};

// Update user roles – Admin only
export const updateUserRoles = async (req: Request, res: Response) => {
  const user = await User.findByPk(req.params.id);
  const { roles } = req.body; // e.g. ["Admin", "Developer"]
  if (!user) return res.status(404).send();
  const roleInstances = await Role.findAll({ where: { name: roles } });
  await user.setRoles(roleInstances);
  res.json({ message: 'User roles updated' });
};
