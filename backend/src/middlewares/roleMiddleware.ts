// backend/middlewares/roleMiddleware.ts
import { Request, Response, NextFunction } from 'express';

// Middleware factory: allows access only if user has any of the allowed roles
export const authorizeRoles = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const roles = await user.getRoles();
    const roleNames = roles.map((r: any) => r.name);
    // Check if any of user's roles match the allowed list
    if (allowedRoles.some(role => roleNames.includes(role))) {
      return next();
    }
    return res.status(403).json({ message: 'Forbidden' });
  };
};
