import * as db from '../db/pool';
import { ApiError } from '../utils/ApiError';
import type {
  Availability,
  EventDetail,
  EventSummary,
  ListEventsQuery,
  ListEventsResult,
} from '../types';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

const EVENT_COLUMNS = `
  e.id,
  e.title,
  e.description,
  e.venue,
  e.starts_at,
  e.capacity,
  e.seats_booked,
  (e.capacity - e.seats_booked) AS seats_remaining,
  (e.seats_booked >= e.capacity) AS is_sold_out,
  e.price_cents,
  e.organizer_id,
  u.name AS organizer_name
`;

export async function listEvents({
  search,
  date,
  page,
  pageSize,
}: ListEventsQuery): Promise<ListEventsResult> {
  const conditions: string[] = ['e.starts_at >= now()'];
  const params: unknown[] = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`e.title ILIKE $${params.length}`);
  }

  if (date) {
    params.push(date);
    conditions.push(
      `e.starts_at >= $${params.length}::date
       AND e.starts_at < ($${params.length}::date + INTERVAL '1 day')`
    );
  }

  const safePageSize = Math.min(
    Math.max(Number(pageSize) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );

  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safePageSize;

  params.push(safePageSize, offset);

  type Row = EventSummary & { total_count: string };

  const { rows } = await db.query<Row>(
    `SELECT ${EVENT_COLUMNS}, COUNT(*) OVER() AS total_count
     FROM events e
     JOIN users u ON u.id = e.organizer_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY e.starts_at ASC, e.id ASC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const total = rows[0] ? Number(rows[0].total_count) : 0;

  return {
    events: rows.map(({ total_count: _ignored, ...event }) => event),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages: Math.max(Math.ceil(total / safePageSize), 1),
    },
  };
}

export async function getEventById(
  eventId: number,
  viewerId: number | null = null
): Promise<EventDetail> {
  const { rows } = await db.query<EventDetail>(
    `SELECT ${EVENT_COLUMNS},
            EXISTS (
              SELECT 1
              FROM bookings b
              WHERE b.event_id = e.id
                AND b.user_id = $2
                AND b.status = 'confirmed'
            ) AS has_booked
       FROM events e
       JOIN users u ON u.id = e.organizer_id
      WHERE e.id = $1`,
    [eventId, viewerId]
  );

  const event = rows[0];

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  return event;
}

export async function getAvailability(
  eventId: number
): Promise<Availability> {
  const { rows } = await db.query<Availability>(
    `SELECT id,
            capacity,
            seats_booked,
            (capacity - seats_booked) AS seats_remaining,
            (seats_booked >= capacity) AS is_sold_out
       FROM events
      WHERE id = $1`,
    [eventId]
  );

  const availability = rows[0];

  if (!availability) {
    throw new ApiError(404, 'Event not found');
  }

  return availability;
}