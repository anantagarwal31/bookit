export type UserRole = 'user' | 'organizer';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface UserWithPassword extends PublicUser {
  password_hash: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}