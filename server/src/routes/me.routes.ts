import { Router } from 'express';

import * as controller from '../controllers/booking.controller';

import { requireAuth } from '../middleware/auth';

import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/bookings', requireAuth, asyncHandler(controller.myBookings));

export default router;