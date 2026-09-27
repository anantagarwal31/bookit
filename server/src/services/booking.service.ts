import * as db from '../db/pool';
import { ApiError } from '../utils/ApiError';
import type { BookingRow, BookingWithEvent } from '../types';
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

export async function cancelBooking(
  bookingId: number,
  userId: number
): Promise<{ id: number; status: 'cancelled' }> {
  return db.withTransaction(async (client) => {
    const { rows: bookingRows } = await client.query<{
      id: number;
      event_id: number;
      user_id: number;
      status: string;
    }>(
      `SELECT id, event_id, user_id, status
         FROM bookings
        WHERE id = $1`,
      [bookingId]
    );

    const booking = bookingRows[0];

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.user_id !== userId) {
      throw new ApiError(403, 'This booking belongs to someone else');
    }

    await client.query(
      `SELECT id
         FROM events
        WHERE id = $1
        FOR UPDATE`,
      [booking.event_id]
    );

    const { rows: lockedRows } = await client.query<{
      status: string;
    }>(
      `SELECT status
         FROM bookings
        WHERE id = $1
        FOR UPDATE`,
      [bookingId]
    );

    if (lockedRows[0]?.status !== 'confirmed') {
      throw new ApiError(409, 'This booking is already cancelled');
    }

    await client.query(
      `UPDATE bookings
          SET status = 'cancelled',
              cancelled_at = now()
        WHERE id = $1`,
      [bookingId]
    );

    await client.query(
      `UPDATE events
          SET seats_booked = seats_booked - 1,
              updated_at = now()
        WHERE id = $1
          AND seats_booked > 0`,
      [booking.event_id]
    );

    return {
      id: bookingId,
      status: 'cancelled',
    };
  });
}

export async function listUserBookings(
  userId: number
): Promise<BookingWithEvent[]> {
  const { rows } = await db.query<BookingWithEvent>(
    `SELECT b.id,
            b.status,
            b.created_at,
            b.cancelled_at,
            e.id AS event_id,
            e.title,
            e.venue,
            e.starts_at,
            e.price_cents,
            (e.capacity - e.seats_booked) AS seats_remaining
       FROM bookings b
       JOIN events e ON e.id = b.event_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC`,
    [userId]
  );

  return rows;
}
