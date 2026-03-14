import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

export interface ErrorResponse {
  error: string;
  status: number;
  timestamp: string;
}

export class AppError extends Error {
  constructor(
    public status: number,
    public message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[${status}] ${message}`, err);

  const response: ErrorResponse = {
    error: message,
    status,
    timestamp: new Date().toISOString(),
  };

  res.status(status).json(response);
};

export const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
