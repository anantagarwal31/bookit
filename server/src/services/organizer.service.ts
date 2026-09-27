import * as db from '../db/pool';
import { ApiError } from '../utils/ApiError';
import type {
  Attendee,
  EventAnalytics,
  EventInput,
  EventRow,
  OrganizerEvent,
  PartialEventInput,
} from '../types';

export interface OwnedEvent {
  id: number;
  organizer_id: number;
  title: string;
  description: string;
  venue: string;
  starts_at: string;
  capacity: number;
  seats_booked: number;
  seats_remaining: number;
  price_cents: number;
}

export async function createEvent(
  organizerId: number,
  data: EventInput
): Promise<EventRow> {
  const { rows } = await db.query<EventRow>(
    `INSERT INTO events (organizer_id, title, description, venue, starts_at, capacity, price_cents)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      organizerId,
      data.title,
      data.description,
      data.venue,
      data.startsAt,
      data.capacity,
      data.priceCents,
    ]
  );

  return rows[0] as EventRow;
}

export async function updateEvent(
  eventId: number,
  organizerId: number,
  data: PartialEventInput
): Promise<EventRow> {
  return db.withTransaction(async (client) => {
    const { rows } = await client.query<{
      id: number;
      organizer_id: number;
      seats_booked: number;
    }>(
      'SELECT id, organizer_id, seats_booked FROM events WHERE id = $1 FOR UPDATE',
      [eventId]
    );

    const event = rows[0];

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    if (event.organizer_id !== organizerId) {
      throw new ApiError(403, 'You can only edit your own events');
    }

    if (
      data.capacity !== undefined &&
      data.capacity < event.seats_booked
    ) {
      throw new ApiError(
        409,
        `Capacity cannot be lower than the ${event.seats_booked} seat(s) already booked`,
        'CAPACITY_BELOW_BOOKED'
      );
    }

    const fieldMap: Record<keyof EventInput, string> = {
      title: 'title',
      description: 'description',
      venue: 'venue',
      startsAt: 'starts_at',
      capacity: 'capacity',
      priceCents: 'price_cents',
    };

    const assignments: string[] = [];
    const params: unknown[] = [];

    (Object.keys(fieldMap) as (keyof EventInput)[]).forEach((key) => {
      const value = data[key];

      if (value !== undefined) {
        params.push(value);
        assignments.push(`${fieldMap[key]} = $${params.length}`);
      }
    });

    if (assignments.length === 0) {
      throw new ApiError(400, 'No fields to update');
    }

    params.push(eventId);

    const { rows: updated } = await client.query<EventRow>(
      `UPDATE events SET ${assignments.join(', ')}, updated_at = now()
       WHERE id = $${params.length}
       RETURNING *`,
      params
    );

    return updated[0] as EventRow;
  });
}

export async function listOrganizerEvents(
  organizerId: number
): Promise<OrganizerEvent[]> {
  const { rows } = await db.query<OrganizerEvent>(
    `SELECT e.id, e.title, e.venue, e.starts_at, e.capacity, e.seats_booked,
            (e.capacity - e.seats_booked) AS seats_remaining,
            (e.seats_booked >= e.capacity) AS is_sold_out,
            e.price_cents,
            (e.seats_booked * e.price_cents) AS revenue_cents
       FROM events e
      WHERE e.organizer_id = $1
      ORDER BY e.starts_at ASC`,
    [organizerId]
  );

  return rows;
}

export async function getOwnedEvent(
  eventId: number,
  organizerId: number
): Promise<OwnedEvent> {
  const { rows } = await db.query<OwnedEvent>(
    `SELECT id, organizer_id, title, description, venue, starts_at, capacity, seats_booked,
            price_cents, (capacity - seats_booked) AS seats_remaining
       FROM events
      WHERE id = $1`,
    [eventId]
  );

  const event = rows[0];

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  if (event.organizer_id !== organizerId) {
    throw new ApiError(403, 'You can only view your own events');
  }

  return event;
}

export async function listAttendees(
  eventId: number,
  organizerId: number
): Promise<{ event: OwnedEvent; attendees: Attendee[] }> {
  const event = await getOwnedEvent(eventId, organizerId);

  const { rows } = await db.query<Attendee>(
    `SELECT b.id AS booking_id, b.status, b.created_at AS booked_at,
            u.id AS user_id, u.name, u.email
       FROM bookings b
       JOIN users u ON u.id = b.user_id
      WHERE b.event_id = $1
      ORDER BY (b.status = 'confirmed') DESC, b.created_at ASC`,
    [eventId]
  );

  return { event, attendees: rows };
}

export async function getEventAnalytics(
  eventId: number,
  organizerId: number
): Promise<{ event: OwnedEvent; analytics: EventAnalytics }> {
  const event = await getOwnedEvent(eventId, organizerId);

  const { rows } = await db.query<{
    views: string;
    bookings_started: string;
    bookings_confirmed: string;
    bookings_cancelled: string;
  }>(
    `SELECT
       COUNT(*) FILTER (WHERE type = 'event_viewed') AS views,
       COUNT(*) FILTER (WHERE type = 'booking_started') AS bookings_started,
       COUNT(*) FILTER (WHERE type = 'booking_confirmed') AS bookings_confirmed,
       COUNT(*) FILTER (WHERE type = 'booking_cancelled') AS bookings_cancelled
     FROM activity_log
     WHERE event_id = $1`,
    [eventId]
  );

  const counts = rows[0];

  const views = Number(counts?.views ?? 0);
  const bookingsStarted = Number(counts?.bookings_started ?? 0);
  const bookingsConfirmed = Number(counts?.bookings_confirmed ?? 0);
  const bookingsCancelled = Number(counts?.bookings_cancelled ?? 0);

  const percent = (part: number, whole: number): number =>
    whole > 0 ? Number(((part / whole) * 100).toFixed(1)) : 0;

  return {
    event,
    analytics: {
      views,
      bookingsStarted,
      bookingsConfirmed,
      bookingsCancelled,
      viewToBookingRate: percent(bookingsConfirmed, views),
      startToBookingRate: percent(bookingsConfirmed, bookingsStarted),
    },
  };
}