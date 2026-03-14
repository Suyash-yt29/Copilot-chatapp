import { Router } from 'express';
import * as messageController from '../controllers/message.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Direct messages
router.get('/direct/:userId', authMiddleware, messageController.getDirectConversation);
router.post('/direct/:userId', authMiddleware, messageController.sendDirectMessage);

// Group messages
router.get('/group/:groupId', authMiddleware, messageController.getGroupConversation);
router.post('/group/:groupId', authMiddleware, messageController.sendGroupMessage);

export default router;
