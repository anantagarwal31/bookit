import { Router } from 'express';

import * as controller from '../controllers/booking.controller';

import { requireAuth } from '../middleware/auth';

import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/:eventId', requireAuth, asyncHandler(controller.book));

router.get('/', requireAuth, asyncHandler(controller.myBookings));

router.delete('/:id', requireAuth, asyncHandler(controller.cancel));

export default router;