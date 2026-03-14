import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import logger from '../config/logger.js';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateRegister = [
  body('username')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Username is required and must be at least 3 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('public_key')
    .isString()
    .notEmpty()
    .withMessage('Public key is required'),
  body('country')
    .isString()
    .notEmpty()
    .withMessage('Country/Region is required'),
  body('language')
    .isString()
    .notEmpty()
    .withMessage('Language preference is required'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateRefresh = [
  body('refreshToken')
    .isString()
    .notEmpty()
    .withMessage('Refresh token is required'),
];

export const validateMessage = [
  body('receiver_id')
    .isUUID()
    .withMessage('Invalid receiver ID'),
  body('encrypted_message')
    .isString()
    .notEmpty()
    .withMessage('Message is required'),
  body('iv')
    .isString()
    .notEmpty()
    .withMessage('IV is required'),
];
