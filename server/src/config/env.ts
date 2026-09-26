import dotenv from 'dotenv';

dotenv.config();

interface Env {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  cookieSameSite: 'lax' | 'strict' | 'none';
  cookieSecure: boolean;
  clientOrigins: string[];
}

function requireVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy server/.env.example to server/.env`
    );
  }

  return value;
}

const sameSite = (process.env.COOKIE_SAME_SITE || 'lax') as Env['cookieSameSite'];
const nodeEnv = process.env.NODE_ENV || 'development';

export const env: Env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv,
  databaseUrl: requireVariable('DATABASE_URL'),
  jwtSecret: requireVariable('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSameSite: sameSite,
  cookieSecure: process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : nodeEnv === 'production',
  clientOrigins: (process.env.CLIENT_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};