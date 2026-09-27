import type { Request, Response } from 'express';
import * as bookingService from '../services/booking.service';
import { currentUser } from '../middleware/auth';
import * as v from '../utils/validate';

export async function book(
  req: Request,
  res: Response
): Promise<void> {
  const user = currentUser(req);
  const eventId = v.requireId(req.params.eventId, 'event id');

  const result = await bookingService.bookSeat(
    eventId,
    user.id
  );

  res.status(201).json(result);
}

export async function cancel(
  req: Request,
  res: Response
): Promise<void> {
  const bookingId = v.requireId(req.params.id, 'booking id');

  const booking = await bookingService.cancelBooking(
    bookingId,
    currentUser(req).id
  );

  res.json({ booking });
}

export async function myBookings(
  req: Request,
  res: Response
): Promise<void> {
  res.json({
    bookings: await bookingService.listUserBookings(
      currentUser(req).id
    ),
  });
}