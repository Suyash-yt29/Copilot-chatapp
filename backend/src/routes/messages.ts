import { Router } from 'express';
import * as messagesController from '../controllers/messages';
import { authMiddleware } from '../middleware/auth';
import { messageLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authMiddleware);
router.use(messageLimiter);

router.get('/conversation/:userId', messagesController.getConversation);
router.get('/conversations', messagesController.getConversationList);
router.post('/mark-read', messagesController.markAsRead);

export default router;
