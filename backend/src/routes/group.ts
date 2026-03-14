import { Router } from 'express';
import * as groupController from '../controllers/group.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, groupController.createGroup);
router.get('/', authMiddleware, groupController.getGroupsForUser);
router.get('/:id', authMiddleware, groupController.getGroupById);
router.post('/:id/members', authMiddleware, groupController.addGroupMember);
router.get('/:id/members', authMiddleware, groupController.getGroupMembers);

export default router;
