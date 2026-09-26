import { Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);

export default router;