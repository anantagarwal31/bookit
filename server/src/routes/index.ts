import { Router } from 'express';

import authRoutes from './auth.routes';
import bookingRoutes from './booking.routes';
import eventRoutes from './event.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);

export default router;