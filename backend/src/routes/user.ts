import { Router } from 'express';
import * as userController from '../controllers/user.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/me', authMiddleware, userController.getMe);
router.get('/:id', authMiddleware, userController.getUserById);
router.get('/', authMiddleware, userController.searchUsers);

export default router;
