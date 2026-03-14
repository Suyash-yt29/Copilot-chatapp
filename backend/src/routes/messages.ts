import { Router } from 'express';
import * as messagesController from '../controllers/messages.js';
import { authMiddleware } from '../middleware/auth.js';
import { messageLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authMiddleware);
router.use(messageLimiter);

router.get('/conversation/:userId', messagesController.getConversation);
router.get('/conversations', messagesController.getConversationList);
router.post('/mark-read', messagesController.markAsRead);

export default router;
