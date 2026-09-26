import bcrypt from 'bcryptjs';
import * as db from '../db/pool';
import { ApiError } from '../utils/ApiError';
import type { LoginInput, PublicUser, SignUpInput, UserWithPassword } from '../types';

const SALT_ROUNDS = 10;

/** Fields we are happy to send to the browser (never the password hash). */
const PUBLIC_USER_COLUMNS = 'id, name, email, role, created_at';

export async function signUp({ name, email, password, role }: SignUpInput): Promise<PublicUser> {
  const existing = await db.query<{ id: number }>('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount && existing.rowCount > 0) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // bcrypt salts + hashes; the plain password is never stored anywhere.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await db.query<PublicUser>(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_USER_COLUMNS}`,
    [name, email, passwordHash, role]
  );
  return rows[0] as PublicUser;
}

export async function login({ email, password }: LoginInput): Promise<PublicUser> {
  const { rows } = await db.query<UserWithPassword>(
    `SELECT ${PUBLIC_USER_COLUMNS}, password_hash FROM users WHERE email = $1`,
    [email]
  );
  const user = rows[0];

  // Same message for "no such user" and "wrong password" so an attacker
  // cannot discover which emails are registered.
  const invalid = new ApiError(401, 'Invalid email or password');
  if (!user) throw invalid;

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) throw invalid;

  const { password_hash: _removed, ...publicUser } = user;
  return publicUser;
}

export async function findById(id: number): Promise<PublicUser | null> {
  const { rows } = await db.query<PublicUser>(
    `SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}