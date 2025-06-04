import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
// Read env variables, ensure they are defined
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('JWT secrets are not set in environment variables.');
}
const ACCESS_TOKEN_EXP = process.env.JWT_ACCESS_TOKEN_EXPIRATION ?? '15m' as string;
const REFRESH_TOKEN_EXP = process.env.JWT_REFRESH_TOKEN_EXPIRATION ?? '7d' as string;

// Validate env variables at runtime
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('JWT secrets are not defined in environment variables.');
}

// Helper to generate access and refresh tokens
const generateTokens = (user: User) => {
  const payload = { username: user.username };
const accessToken = jwt.sign(
    payload,
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXP } as SignOptions
);

const refreshToken = jwt.sign(
  payload,
  REFRESH_TOKEN_SECRET,
  { expiresIn: REFRESH_TOKEN_EXP as string } as SignOptions
);
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
    // Create user
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
      httpOnly: true,
      secure: false,       // Set to true in production (HTTPS)
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // Send access token in response body
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
    // Generate new tokens (optionally rotate refresh token)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    // Set new refresh token cookie
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
