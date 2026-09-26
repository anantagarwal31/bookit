import { api } from './client';
import type { LoginPayload, SignupPayload, User } from '../types';

export const authApi = {
  signup: (payload: SignupPayload) =>
    api.post<{ user: User }>('/auth/signup', payload),

  login: (payload: LoginPayload) =>
    api.post<{ user: User }>('/auth/login', payload),

  logout: () =>
    api.post<{ message: string }>('/auth/logout'),

  me: () =>
    api.get<{ user: User | null }>('/auth/me'),
};