import { Request, Response } from 'express';
import { MessageModel } from '../models/index.js';
import { asyncHandler } from '../middleware/error.js';

export const getDirectConversation = asyncHandler(async (req: any, res: Response) => {
  const { userId } = req.params;
  const { cursor } = req.query;
  let cursorObj: any = undefined;
  if (cursor && typeof cursor === 'string') {
    try {
      cursorObj = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
    } catch (error) {}
  }
  const messages = await MessageModel.getDirectConversation(req.userId, userId, 50, cursorObj);
  res.json(messages);
});

export const sendDirectMessage = asyncHandler(async (req: any, res: Response) => {
  const { userId } = req.params;
  const { content, iv, media_url } = req.body;
  const message = await MessageModel.createDirect(req.userId, userId, content, iv, media_url);
  res.json(message);
});

export const getGroupConversation = asyncHandler(async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { cursor } = req.query;
  let cursorObj: any = undefined;
  if (cursor && typeof cursor === 'string') {
    try {
      cursorObj = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
    } catch (error) {}
  }
  const messages = await MessageModel.getGroupConversation(groupId, 50, cursorObj);
  res.json(messages);
});

export const sendGroupMessage = asyncHandler(async (req: any, res: Response) => {
  const { groupId } = req.params;
  const { content, iv, media_url } = req.body;
  const message = await MessageModel.createGroup(req.userId, groupId, content, iv, media_url);
  res.json(message);
});
