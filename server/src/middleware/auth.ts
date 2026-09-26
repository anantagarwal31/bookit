import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import type { AuthTokenPayload, PublicUser } from '../types';

export const COOKIE_NAME = 'bookit_token';

export function createToken(user: PublicUser): string {
  const payload: AuthTokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  return jwt.sign(
    payload,
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
  );
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: env.cookieSameSite,
    secure: env.cookieSecure,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: env.cookieSameSite,
    secure: env.cookieSecure,
  });
}

export function attachUser(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;

  if (token) {
    try {
      req.user = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
    } catch {
      req.user = null;
    }
  }

  next();
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new ApiError(401, 'You must be logged in to do this'));
  }

  next();
}

export function requireOrganizer(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new ApiError(401, 'You must be logged in to do this'));
  }

  if (req.user.role !== 'organizer') {
    return next(new ApiError(403, 'Only organizers can access this resource'));
  }

  next();
}

export function currentUser(req: Request): AuthTokenPayload {
  if (!req.user) {
    throw new ApiError(401, 'You must be logged in to do this');
  }

  return req.user;
}