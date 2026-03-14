import { Request, Response } from 'express';
import { StatusModel } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/error.js';

export const createStatus = asyncHandler(async (req: Request, res: Response) => {
  const { media_url, text } = req.body;
  const userId = (req as any).userId;
  if (!userId) throw new AppError(401, 'Unauthorized');
  if (!media_url && !text) throw new AppError(400, 'Status must have media or text');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const status = await StatusModel.create(userId, media_url || null, text || null, expiresAt);
  res.status(201).json({ status });
});

export const getAllStatus = asyncHandler(async (_req: Request, res: Response) => {
  const statuses = await StatusModel.getAllActive();
  res.status(200).json({ statuses });
});

export const getUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const statuses = await StatusModel.getByUser(userId);
  res.status(200).json({ statuses });
});
