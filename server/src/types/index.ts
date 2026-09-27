export type UserRole = 'user' | 'organizer';
export type BookingStatus = 'confirmed' | 'cancelled';

export type ActivityType =
  | 'event_viewed'
  | 'booking_started'
  | 'booking_confirmed'
  | 'booking_cancelled';

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

export interface EventInput {
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  capacity: number;
  priceCents: number;
}

export type PartialEventInput = Partial<EventInput>;

export interface EventRow {
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