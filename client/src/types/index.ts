export type UserRole = 'user' | 'organizer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginPayload {
  name: string;
  role: UserRole;
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

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type BookingStatus = 'confirmed' | 'cancelled';

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

export interface OrganizerEvent {
  id: number;
  title: string;
  venue: string;
  starts_at: string;
  capacity: number;
  seats_booked: number;
  seats_remaining: number;
  is_sold_out: boolean;
  price_cents: number;
  revenue_cents: number;
}

export interface EventPayload {
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  capacity: number;
  priceCents: number;
}

export interface OwnedEvent {
  id: number;
  organizer_id: number;
  title: string;
  description: string;
  venue: string;
  starts_at: string;
  capacity: number;
  seats_booked: number;
  price_cents: number;
  created_at: string;
  updated_at: string;
}

export interface Attendee {
  booking_id: number;
  status: BookingStatus;
  booked_at: string;
  user_id: number;
  name: string;
  email: string;
}

export interface EventAnalytics {
  views: number;
  bookingsStarted: number;
  bookingsConfirmed: number;
  bookingsCancelled: number;
  viewToBookingRate: number;
  startToBookingRate: number;
}