import { Request, Response, NextFunction } from 'express';
import { AuthUtil } from '../utils/auth.js';
import logger from '../config/logger.js';

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const payload = AuthUtil.verifyAccessToken(token);
    req.userId = payload.userId;
    req.email = payload.email;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = AuthUtil.verifyAccessToken(token);
      req.userId = payload.userId;
      req.email = payload.email;
    }
    next();
  } catch (error) {
    next();
  }
};
