// ✅ FILE: backend/src/middlewares/permissionMiddleware.ts

import { Request, Response, NextFunction } from 'express';

export const authorizePermissions = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const roles = await user.getRoles({ include: ['Permissions'] });
    const userPermissions = new Set();

    for (const role of roles) {
      const permissions = await role.getPermissions();
      permissions.forEach((p: { name: unknown; }) => userPermissions.add(p.name));
    }

    const hasPermission = requiredPermissions.some(p => userPermissions.has(p));
    if (!hasPermission) return res.status(403).json({ message: 'Forbidden: insufficient permission' });

    next();
  };
};
