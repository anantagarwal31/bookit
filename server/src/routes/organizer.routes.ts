import { Router } from 'express';
import * as controller from '../controllers/organizer.controller';
import { requireOrganizer } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireOrganizer);

router.post('/events', asyncHandler(controller.create));
router.patch('/events/:id', asyncHandler(controller.update));
router.get('/events', asyncHandler(controller.myEvents));
router.get('/events/:id', asyncHandler(controller.getOne));
router.get('/events/:id/attendees', asyncHandler(controller.attendees));
router.get('/events/:id/analytics', asyncHandler(controller.analytics));

export default router;