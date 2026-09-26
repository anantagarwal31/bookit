import { Router } from 'express';
import * as eventController from '../controllers/event.controller';

const router = Router();

router.get('/', eventController.list);

export default router;