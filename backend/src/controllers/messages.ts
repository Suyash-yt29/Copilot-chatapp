import { Request, Response } from 'express';
import { MessageModel } from '../models/index.js';
import { OnlineStatusService, MessageService } from '../services/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/error.js';
import { ValidationUtil } from '../utils/auth.js';
import logger from '../config/logger.js';
import pool from '../config/database.js';

export const getConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId: otherUserId } = req.params;
  const { cursor } = req.query;

  if (!ValidationUtil.isValidUUID(otherUserId)) {
    throw new AppError(400, 'Invalid user ID format');
  }

  if (!req.userId) {
    throw new AppError(401, 'Unauthorized');
  }

  let cursorObj: any = undefined;
  if (cursor && typeof cursor === 'string') {
    try {
      cursorObj = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
    } catch (error) {
      throw new AppError(400, 'Invalid cursor format');
    }
  }

  const messages = await MessageModel.getConversation(
    req.userId,
    otherUserId,
    50,
    cursorObj
  );

  const nextCursor =
    messages.length > 0
      ? Buffer.from(
          JSON.stringify({
            createdAt: messages[messages.length - 1].created_at,
            id: messages[messages.length - 1].id,
          })
        ).toString('base64')
      : null;

  res.status(200).json({
    messages,
    nextCursor,
  });
});

export const getConversationList = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const query = `
    SELECT DISTINCT
      CASE 
        WHEN sender_id = $1 THEN receiver_id
        ELSE sender_id
      END as user_id,
      (SELECT email FROM users WHERE id = CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END) as email,
      MAX(created_at) as last_message_time,
      (SELECT encrypted_message FROM messages m2 
       WHERE ((m2.sender_id = $1 AND m2.receiver_id = m.user_id) 
       OR (m2.sender_id = m.user_id AND m2.receiver_id = $1))
       ORDER BY created_at DESC LIMIT 1) as last_message,
      COALESCE((SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND sender_id = m.user_id AND status != 'seen'), 0) as unread_count
    FROM messages m
    WHERE sender_id = $1 OR receiver_id = $1
    GROUP BY CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END
    ORDER BY last_message_time DESC
  `;

  const result = await pool.query(query, [req.userId]);
  res.status(200).json({ conversations: result.rows });
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { messageIds } = req.body;

  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    throw new AppError(400, 'Message IDs array is required');
  }

  for (const id of messageIds) {
    if (!ValidationUtil.isValidUUID(id)) {
      throw new AppError(400, 'Invalid message ID format');
    }
  }

  const query = `
    UPDATE messages 
    SET status = 'seen' 
    WHERE id = ANY($1) AND receiver_id = $2 AND status != 'seen'
  `;

  await pool.query(query, [messageIds, req.userId]);

  logger.info(`Messages marked as read by user: ${req.userId}`);
  res.status(200).json({ success: true });
});
