import type { Request, Response } from 'express';
import * as eventService from '../services/event.service';
import * as v from '../utils/validate';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await eventService.listEvents({
    search: req.query.search ? String(req.query.search).trim() : null,
    date: req.query.date ? String(req.query.date) : null,
    page: req.query.page as string | undefined,
    pageSize: req.query.pageSize as string | undefined,
  });

  res.json(result);
}

export async function detail(req: Request, res: Response): Promise<void> {
  const eventId = v.requireId(req.params.id, 'event id');
  const event = await eventService.getEventById(
    eventId,
    req.user?.id ?? null
  );

  res.json({ event });
}

export async function availability(
  req: Request,
  res: Response
): Promise<void> {
  const eventId = v.requireId(req.params.id, 'event id');

  res.json({
    availability: await eventService.getAvailability(eventId),
  });
}