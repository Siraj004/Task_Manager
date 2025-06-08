// File: src/middleware/checkRole.ts
import { Request, Response, NextFunction } from 'express';

export type UserRole = 'Admin' | 'Project Manager' | 'Developer' | 'Tester' | 'Viewer';

export const checkRole = (...allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || typeof user.getRoles !== 'function') {
      return res.status(403).json({ message: 'No user or roles found' });
    }

    try {
      const roles = await user.getRoles();
      const roleNames: string[] = Array.isArray(roles) ? roles.map((r: { name: string }) => r.name) : [];

      if (!roleNames.some(role => allowedRoles.includes(role as UserRole))) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next();
    } catch (error) {
      console.error('Error in checkRole middleware:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};