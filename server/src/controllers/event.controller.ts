import type { Request, Response } from 'express';
import * as eventService from '../services/event.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await eventService.listEvents({
    search: req.query.search ? String(req.query.search).trim() : null,
    date: req.query.date ? String(req.query.date) : null,
    page: req.query.page as string | undefined,
    pageSize: req.query.pageSize as string | undefined,
  });

  res.json(result);
}