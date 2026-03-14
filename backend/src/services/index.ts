import pool from '../config/database.js';
import redis from '../config/redis.js';
import logger from '../config/logger.js';

export class OnlineStatusService {
  static async addOnlineUser(userId: string, socketId: string): Promise<void> {
    try {
      await redis.set(`user:${userId}:socket`, socketId, { EX: 86400 });
      await redis.sAdd('online_users', userId);
      logger.info(`User ${userId} marked as online`);
    } catch (error) {
      logger.error('Error adding online user:', error);
    }
  }

  static async removeOnlineUser(userId: string): Promise<void> {
    try {
      await redis.del(`user:${userId}:socket`);
      await redis.sRem('online_users', userId);
      logger.info(`User ${userId} marked as offline`);
    } catch (error) {
      logger.error('Error removing online user:', error);
    }
  }

  static async getSocketId(userId: string): Promise<string | null> {
    try {
      return await redis.get(`user:${userId}:socket`);
    } catch (error) {
      logger.error('Error getting socket id:', error);
      return null;
    }
  }

  static async isUserOnline(userId: string): Promise<boolean> {
    try {
      const socketId = await redis.get(`user:${userId}:socket`);
      return !!socketId;
    } catch (error) {
      logger.error('Error checking user online status:', error);
      return false;
    }
  }

  static async getAllOnlineUsers(): Promise<string[]> {
    try {
      return await redis.sMembers('online_users');
    } catch (error) {
      logger.error('Error getting all online users:', error);
      return [];
    }
  }
}

export class MessageService {
  static async storeUndeliveredMessage(
    messageId: string,
    receiverId: string,
    message: any
  ): Promise<void> {
    try {
      const key = `undelivered:${receiverId}`;
      await redis.lPush(key, JSON.stringify({ messageId, ...message }));
      await redis.expire(key, 86400); // 24 hours
    } catch (error) {
      logger.error('Error storing undelivered message:', error);
    }
  }

  static async getUndeliveredMessages(userId: string): Promise<any[]> {
    try {
      const key = `undelivered:${userId}`;
      const messages = await redis.lRange(key, 0, -1);
      await redis.del(key);
      return (messages as string[]).map((msg: string) => JSON.parse(msg));
    } catch (error) {
      logger.error('Error getting undelivered messages:', error);
      return [];
    }
  }

  static async setTypingIndicator(userId: string, recipientId: string): Promise<void> {
    try {
      const key = `typing:${recipientId}:${userId}`;
      await redis.set(key, '1', { EX: 3 });
    } catch (error) {
      logger.error('Error setting typing indicator:', error);
    }
  }

  static async isUserTyping(userId: string, recipientId: string): Promise<boolean> {
    try {
      const key = `typing:${recipientId}:${userId}`;
      const result = await redis.get(key);
      return !!result;
    } catch (error) {
      logger.error('Error checking typing indicator:', error);
      return false;
    }
  }

  static async clearTypingIndicator(userId: string, recipientId: string): Promise<void> {
    try {
      const key = `typing:${recipientId}:${userId}`;
      await redis.del(key);
    } catch (error) {
      logger.error('Error clearing typing indicator:', error);
    }
  }
}
