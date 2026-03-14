import { Router } from 'express';
import multer from 'multer';
import { uploadMedia } from '../controllers/media.js';
import { authMiddleware } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/upload', authMiddleware as any, (upload.single('file') as any), uploadMedia);

export default router;
