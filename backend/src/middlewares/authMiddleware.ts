import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

// Verify JWT from Authorization header; attach user to request
export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET!;
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { username: string };
    // Fetch user from DB including roles
    const user = await User.findOne({
      where: { username: decoded.username },
      include: [ { model: (await import('../models')).Role, as: 'Roles' } ]
    });
    if (!user) return res.status(401).json({ message: 'User not found' });
    // Attach user instance to request
    (req as any).user = user;
    next();
  } catch (err) {
    return res.sendStatus(403); // Invalid token
  }
};
