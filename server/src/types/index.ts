export type UserRole = 'user' | 'organizer';
export type BookingStatus = 'confirmed' | 'cancelled';

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

export interface EventSummary {
  id: number;
  title: string;
  description: string;
  venue: string;
  starts_at: string;
  capacity: number;
  seats_booked: number;
  seats_remaining: number;
  is_sold_out: boolean;
  price_cents: number;
  organizer_id: number;
  organizer_name: string;
}

export interface ListEventsQuery {
  search?: string | null;
  date?: string | null;
  page?: string;
  pageSize?: string;
}

export interface ListEventsResult {
  events: EventSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
export interface EventDetail extends EventSummary {
  has_booked: boolean;
}
export interface Availability {
  id: number;
  capacity: number;
  seats_booked: number;
  seats_remaining: number;
  is_sold_out: boolean;
}

export interface BookingRow {
  id: number;
  event_id: number;
  user_id: number;
  status: BookingStatus;
  created_at: string;
  cancelled_at: string | null;
}

export interface BookingWithEvent {
  id: number;
  status: BookingStatus;
  created_at: string;
  cancelled_at: string | null;
  event_id: number;
  title: string;
  venue: string;
  starts_at: string;
  price_cents: number;
  seats_remaining: number;
}