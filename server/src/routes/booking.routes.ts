import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post(
  '/:eventId',
  requireAuth,
  asyncHandler(bookingController.book)
);

export default router;