import { Request, Response } from 'express';
import { UserModel } from '../models/index.js';
import { asyncHandler } from '../middleware/error.js';

export const getMe = asyncHandler(async (req: any, res: Response) => {
  const user = await UserModel.findById(req.userId);
  res.json(user);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.params.id);
  res.json(user);
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  // Simple search by username or email
  const result = await UserModel.search(q as string);
  res.json(result);
});
