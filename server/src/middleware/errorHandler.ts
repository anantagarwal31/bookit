import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

interface DatabaseError extends Error {
  code?: string;
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let status = 500;
  let message = 'Something went wrong. Please try again.';
  let code: string | undefined;

  if (error instanceof ApiError) {
    status = error.status;
    message = error.message;
    code = error.code;
  } else {
    const databaseError = error as DatabaseError;

    if (databaseError.code === '23505') {
      status = 409;
      message = 'This record already exists';
      code = 'DUPLICATE';
    }
  }

  if (status >= 500) {
    console.error(error);
  }

  const detail =
    env.nodeEnv === 'development' &&
    status >= 500 &&
    error instanceof Error
      ? { detail: error.message }
      : {};

  res.status(status).json({
    error: {
      message,
      code,
      ...detail,
    },
  });
}