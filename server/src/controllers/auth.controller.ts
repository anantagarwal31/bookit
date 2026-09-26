import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import {
  clearAuthCookie,
  createToken,
  setAuthCookie,
} from '../middleware/auth';
import * as v from '../utils/validate';

export async function signup(req: Request, res: Response): Promise<void> {
  const user = await authService.signUp({
    name: v.requireString(req.body.name, 'Name', { min: 2, max: 120 }),
    email: v.requireEmail(req.body.email),
    password: v.requirePassword(req.body.password),
    role: v.requireRole(req.body.role),
  });

  setAuthCookie(res, createToken(user));
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const user = await authService.login({
    email: v.requireEmail(req.body.email),
    password: v.requireString(req.body.password, 'Password'),
  });

  setAuthCookie(res, createToken(user));
  res.json({ user });
}

export async function logout(
  _req: Request,
  res: Response
): Promise<void> {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.json({ user: null });
    return;
  }

  res.json({
    user: await authService.findById(req.user.id),
  });
}