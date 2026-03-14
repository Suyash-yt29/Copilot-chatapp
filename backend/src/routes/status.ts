import { Router } from 'express';
import { createStatus, getAllStatus, getUserStatus } from '../controllers/status.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, createStatus);
router.get('/', getAllStatus);
router.get('/:userId', getUserStatus);

export default router;
