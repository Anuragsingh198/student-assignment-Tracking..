import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  getProfile,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/error.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../utils/validation';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

router.get('/profile', authenticate, getProfile);

export default router;
