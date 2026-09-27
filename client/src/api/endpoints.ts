import { api } from './client';
import type {
  Availability,
  EventDetail,
  EventSummary,
  LoginPayload,
  PaginationInfo,
  SignupPayload,
  User,
  BookingWithEvent,
} from '../types';

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

interface ListEventsParams {
  search?: string;
  date?: string;
  page?: number;
}

export const eventsApi = {
  list: ({ search = '', date = '', page = 1 }: ListEventsParams = {}) => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (date) params.set('date', date);

    params.set('page', String(page));

    return api.get<{
      events: EventSummary[];
      pagination: PaginationInfo;
    }>(`/events?${params.toString()}`);
  },

  detail: (id: number | string) =>
    api.get<{ event: EventDetail }>(`/events/${id}`),

  availability: (id: number | string) =>
    api.get<{ availability: Availability }>(
      `/events/${id}/availability`
    ),

  book: (id: number | string) =>
    api.post<{
      booking: { id: number };
      event: {
        id: number;
        title: string;
        seats_booked: number;
        capacity: number;
        seats_remaining: number;
      };
    }>(`/bookings/${id}`),
};

export const bookingsApi = {
  mine: () =>
    api.get<{ bookings: BookingWithEvent[] }>('/bookings'),

  cancel: (id: number | string) =>
    api.delete<{
      booking: {
        id: number;
        status: 'cancelled';
      };
    }>(`/bookings/${id}`),
};