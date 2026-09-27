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