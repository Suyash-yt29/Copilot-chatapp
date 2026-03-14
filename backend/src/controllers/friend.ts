import { Request, Response } from 'express';
import { FriendModel } from '../models/index.js';
import { asyncHandler } from '../middleware/error.js';

export const getFriends = asyncHandler(async (req: any, res: Response) => {
  const friends = await FriendModel.getFriends(req.userId);
  res.json(friends);
});

export const getPendingRequests = asyncHandler(async (req: any, res: Response) => {
  const requests = await FriendModel.getPendingRequests(req.userId);
  res.json(requests);
});

export const sendFriendRequest = asyncHandler(async (req: any, res: Response) => {
  const { friendId } = req.body;
  const request = await FriendModel.addFriend(req.userId, friendId);
  res.json(request);
});

export const acceptFriendRequest = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.body;
  await FriendModel.acceptFriendRequest(id);
  res.json({ success: true });
});
