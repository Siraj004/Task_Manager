// authController.ts placeholder\
// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET as string;
const ACCESS_TOKEN_EXP = process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m';
const REFRESH_TOKEN_EXP = process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d';

// Helper to generate tokens
const generateTokens = (user: User) => {
  const payload = { username: user.username };
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXP });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXP });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  try {
    // Check if user exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10);
    // Save new user
    const newUser = await User.create({ username, password: hashedPwd });
    res.status(201).json({ message: 'User registered', username: newUser.username });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  try {
    // Find user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    // Send refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,          // prevent JS access to cookie (security best practice:contentReference[oaicite:4]{index=4})
      secure: false,           // set to true in production (HTTPS) 
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // Send access token in response
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'Refresh token not provided' });
  }
  try {
    // Verify refresh token
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as { username: string };
    const user = await User.findOne({ where: { username: payload.username } });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    // Generate new tokens (we could rotate refresh tokens here if desired)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    // Optionally set new refresh token (token rotation)
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

export const logout = (req: Request, res: Response) => {
  // Clear the refresh token cookie
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  res.json({ message: 'Logged out' });
};
