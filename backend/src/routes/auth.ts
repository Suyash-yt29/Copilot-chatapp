import { Router } from 'express';
import * as authController from '../controllers/auth.js';
import {
  validateRegister,
  validateLogin,
  validateRefresh,
  handleValidationErrors,
} from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateRegister,
  handleValidationErrors,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validateLogin,
  handleValidationErrors,
  authController.login
);

router.post(
  '/refresh',
  validateRefresh,
  handleValidationErrors,
  authController.refresh
);

router.get('/public-key/:userId', authController.getPublicKey);

export default router;
