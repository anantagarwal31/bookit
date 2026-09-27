import * as db from '../db/pool';
import { ApiError } from '../utils/ApiError';
import type { BookingRow } from '../types';

export interface BookSeatResult {
  booking: BookingRow;
  event: {
    id: number;
    title: string;
    seats_booked: number;
    capacity: number;
    seats_remaining: number;
  };
}

export async function bookSeat(
  eventId: number,
  userId: number
): Promise<BookSeatResult> {
  return db.withTransaction(async (client) => {
    const { rows: eventRows } = await client.query<{
      id: number;
      title: string;
      capacity: number;
      seats_booked: number;
      starts_at: string;
    }>(
      `SELECT id, title, capacity, seats_booked, starts_at
         FROM events
        WHERE id = $1
        FOR UPDATE`,
      [eventId]
    );

    const event = eventRows[0];

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    if (new Date(event.starts_at).getTime() <= Date.now()) {
      throw new ApiError(400, 'This event has already started');
    }

    const { rows: existingRows } = await client.query<{ id: number }>(
      `SELECT id FROM bookings
        WHERE event_id = $1
          AND user_id = $2
          AND status = 'confirmed'`,
      [eventId, userId]
    );

    if (existingRows.length > 0) {
      throw new ApiError(
        409,
        'You have already booked a seat for this event',
        'ALREADY_BOOKED'
      );
    }

    if (event.seats_booked >= event.capacity) {
      throw new ApiError(
        409,
        'Sorry, this event is sold out',
        'SOLD_OUT'
      );
    }

    const { rows: bookingRows } = await client.query<BookingRow>(
      `INSERT INTO bookings (event_id, user_id, status)
       VALUES ($1, $2, 'confirmed')
       RETURNING id, event_id, user_id, status, created_at, cancelled_at`,
      [eventId, userId]
    );

    const { rows: updatedRows } = await client.query<{
      seats_booked: number;
      capacity: number;
      seats_remaining: number;
    }>(
      `UPDATE events
          SET seats_booked = seats_booked + 1, updated_at = now()
        WHERE id = $1
          AND seats_booked < capacity
        RETURNING seats_booked, capacity,
                  (capacity - seats_booked) AS seats_remaining`,
      [eventId]
    );

    const updated = updatedRows[0];

    if (!updated) {
      throw new ApiError(
        409,
        'Sorry, this event is sold out',
        'SOLD_OUT'
      );
    }

    return {
      booking: bookingRows[0] as BookingRow,
      event: {
        id: event.id,
        title: event.title,
        ...updated,
      },
    };
  });
}