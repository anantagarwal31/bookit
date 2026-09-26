import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(eventController.list));
router.get('/:id', asyncHandler(eventController.detail));
router.get('/:id/availability', asyncHandler(eventController.availability));

export default router;