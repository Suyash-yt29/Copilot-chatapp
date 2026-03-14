import { Router } from 'express';
import * as friendController from '../controllers/friend.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, friendController.getFriends);
router.get('/requests', authMiddleware, friendController.getPendingRequests);
router.post('/request', authMiddleware, friendController.sendFriendRequest);
router.post('/accept', authMiddleware, friendController.acceptFriendRequest);

export default router;
