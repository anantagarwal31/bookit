import { Router } from 'express';
import {
  login,
  logout,
  me,
  signup,
} from '../controllers/auth.controller';
import { attachUser } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', attachUser, me);

export default router;