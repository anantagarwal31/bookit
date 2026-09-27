import { ApiError } from './ApiError';
import type { UserRole } from '../types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface StringOptions {
  min?: number;
  max?: number;
}

export function requireString(
  value: unknown,
  field: string,
  { min = 1, max = 255 }: StringOptions = {}
): string {
  const text = typeof value === 'string' ? value.trim() : '';

  if (text.length < min) {
    throw new ApiError(400, `${field} is required`);
  }

  if (text.length > max) {
    throw new ApiError(400, `${field} must be at most ${max} characters`);
  }

  return text;
}

export function requireEmail(value: unknown): string {
  const email = requireString(value, 'Email', { max: 160 }).toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    throw new ApiError(400, 'Please enter a valid email address');
  }

  return email;
}

export function requirePassword(value: unknown): string {
  if (typeof value !== 'string' || value.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  return value;
}

export function requireRole(value: unknown): UserRole {
  const role = (value as UserRole) || 'user';

  if (role !== 'user' && role !== 'organizer') {
    throw new ApiError(400, "Role must be either 'user' or 'organizer'");
  }

  return role;
}

export function requireId(value: unknown, field: string): number {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, `Invalid ${field}`);
  }

  return id;
}

interface NumberOptions {
  min?: number;
  max?: number;
}

export function requireInteger(
  value: unknown,
  field: string,
  { min = 0, max = Number.MAX_SAFE_INTEGER }: NumberOptions = {}
): number {
  const number = Number(value);

  if (!Number.isInteger(number)) {
    throw new ApiError(400, `${field} must be a whole number`);
  }

  if (number < min) {
    throw new ApiError(400, `${field} must be at least ${min}`);
  }

  if (number > max) {
    throw new ApiError(400, `${field} must be at most ${max}`);
  }

  return number;
}

export function requireFutureDate(
  value: unknown,
  field: string
): string {
  const date = new Date(value as string);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${field} must be a valid date`);
  }

  if (date.getTime() <= Date.now()) {
    throw new ApiError(400, `${field} must be in the future`);
  }

  return date.toISOString();
}