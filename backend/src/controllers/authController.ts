import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { Role } from '../models';

// Environment variables
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_EXP = process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m';
const REFRESH_TOKEN_EXP = process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d';

// Helper to generate access and refresh tokens
const generateTokens = (user: User) => {
  const payload = { id: user.id, username: user.username };

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXP,
  }as SignOptions) 

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXP,
  }as SignOptions);

  return { accessToken, refreshToken };
};

// Register a new user
export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPwd });

    const viewerRole = await Role.findOne({ where: { name: 'Viewer' } });
    if (viewerRole) await newUser.addRole(viewerRole);

    res.status(201).json({ message: 'User registered', username: newUser.username });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

// Login endpoint
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    const user = await User.findOne({ where: { username }, include: [Role] });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // Set true in production with HTTPS
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Get roles and permissions
    const roles = (await user.getRoles()).map((r) => r.name);
    const permissionsSet = new Set<string>();
    for (const role of await user.getRoles()) {
      const perms = await role.getPermissions();
      perms.forEach((p) => permissionsSet.add(p.name));
    }
    const permissions = Array.from(permissionsSet);

    res.json({
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        roles,
        permissions,
      },
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

// Refresh token endpoint
export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'Refresh token not provided' });
  }

  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
      id: number;
      username: string;
    };

    const user = await User.findByPk(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false, // Set true in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// Logout endpoint
export const logout = (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  res.json({ message: 'Logged out' });
};

// Get profile endpoint
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const roles = (await user.getRoles()).map((r: any) => r.name);
    res.json({ username: user.username, roles });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};
