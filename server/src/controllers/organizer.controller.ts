import type { Request, Response } from 'express';
import * as organizerService from '../services/organizer.service';
import { currentUser } from '../middleware/auth';
import * as v from '../utils/validate';
import type { EventInput, PartialEventInput } from '../types';

function readEventBody(body: Record<string, unknown>): EventInput {
  return {
    title: v.requireString(body.title, 'Title', { min: 3, max: 180 }),
    description: v.requireString(body.description, 'Description', {
      min: 10,
      max: 5000,
    }),
    venue: v.requireString(body.venue, 'Venue', { min: 2, max: 180 }),
    startsAt: v.requireFutureDate(body.startsAt, 'Date & time'),
    capacity: v.requireInteger(body.capacity, 'Capacity', {
      min: 1,
      max: 1_000_000,
    }),
    priceCents: v.requireInteger(body.priceCents ?? 0, 'Price', {
      min: 0,
    }),
  };
}

function readPartialEventBody(
  body: Record<string, unknown>
): PartialEventInput {
  const data: PartialEventInput = {};

  const sent = (field: string): boolean =>
    body[field] !== undefined &&
    body[field] !== null &&
    body[field] !== '';

  if (sent('title')) {
    data.title = v.requireString(body.title, 'Title', {
      min: 3,
      max: 180,
    });
  }

  if (sent('description')) {
    data.description = v.requireString(body.description, 'Description', {
      min: 10,
      max: 5000,
    });
  }

  if (sent('venue')) {
    data.venue = v.requireString(body.venue, 'Venue', {
      min: 2,
      max: 180,
    });
  }

  if (sent('startsAt')) {
    data.startsAt = v.requireFutureDate(body.startsAt, 'Date & time');
  }

  if (sent('capacity')) {
    data.capacity = v.requireInteger(body.capacity, 'Capacity', {
      min: 1,
      max: 1_000_000,
    });
  }

  if (sent('priceCents')) {
    data.priceCents = v.requireInteger(body.priceCents, 'Price', {
      min: 0,
    });
  }

  return data;
}

export async function create(req: Request, res: Response): Promise<void> {
  const event = await organizerService.createEvent(
    currentUser(req).id,
    readEventBody(req.body)
  );

  res.status(201).json({ event });
}

export async function update(req: Request, res: Response): Promise<void> {
  const eventId = v.requireId(req.params.id, 'event id');

  const event = await organizerService.updateEvent(
    eventId,
    currentUser(req).id,
    readPartialEventBody(req.body)
  );

  res.json({ event });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const eventId = v.requireId(req.params.id, 'event id');

  res.json({
    event: await organizerService.getOwnedEvent(
      eventId,
      currentUser(req).id
    ),
  });
}

export async function myEvents(
  req: Request,
  res: Response
): Promise<void> {
  res.json({
    events: await organizerService.listOrganizerEvents(
      currentUser(req).id
    ),
  });
}

export async function attendees(
  req: Request,
  res: Response
): Promise<void> {
  const eventId = v.requireId(req.params.id, 'event id');

  res.json(
    await organizerService.listAttendees(
      eventId,
      currentUser(req).id
    )
  );
}

export async function analytics(
  req: Request,
  res: Response
): Promise<void> {
  const eventId = v.requireId(req.params.id, 'event id');

  res.json(
    await organizerService.getEventAnalytics(
      eventId,
      currentUser(req).id
    )
  );
}