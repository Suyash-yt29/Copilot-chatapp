import { Server, Socket } from 'socket.io';
import { AuthUtil } from '../utils/auth.js';
import { OnlineStatusService, MessageService } from '../services/index.js';
import { MessageModel } from '../models/index.js';
import logger from '../config/logger.js';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
}

export const setupSocketIO = (io: Server) => {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const payload = AuthUtil.verifyAccessToken(token);
      socket.userId = payload.userId;
      socket.email = payload.email;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    if (!socket.userId) return;

    logger.info(`User ${socket.userId} connected with socket ${socket.id}`);

    await OnlineStatusService.addOnlineUser(socket.userId, socket.id);
    socket.join(`user:${socket.userId}`);

    const undeliveredMessages = await MessageService.getUndeliveredMessages(socket.userId);
    if (undeliveredMessages.length > 0) {
      socket.emit('undelivered_messages', undeliveredMessages);
    }

    io.emit('user_online', { userId: socket.userId });

    socket.on('send_message', async (data: any) => {
      try {
        const {
          receiver_id,
          encrypted_message,
          iv,
          media_url,
        } = data;

        const message = await MessageModel.create(
          socket.userId!,
          receiver_id,
          encrypted_message,
          iv,
          media_url
        );

        const receiverSocketId = await OnlineStatusService.getSocketId(receiver_id);

        if (receiverSocketId) {
          await MessageModel.updateStatus(message.id, 'delivered');
          io.to(`user:${receiver_id}`).emit('message_received', {
            ...message,
            status: 'delivered',
          });
        } else {
          await MessageService.storeUndeliveredMessage(message.id, receiver_id, message);
        }

        socket.emit('message_sent', message);
        logger.info(`Message sent from ${socket.userId} to ${receiver_id}`);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('message_delivered', async (data: any) => {
      try {
        const { messageId } = data;
        await MessageModel.updateStatus(messageId, 'delivered');
        socket.emit('delivery_confirmed', { messageId });
      } catch (error) {
        logger.error('Error marking message as delivered:', error);
      }
    });

    socket.on('message_seen', async (data: any) => {
      try {
        const { receiver_id, messageIds } = data;
        for (const messageId of messageIds) {
          await MessageModel.updateStatus(messageId, 'seen');
        }
        io.to(`user:${receiver_id}`).emit('message_seen_notification', {
          messageIds,
          userId: socket.userId,
        });
      } catch (error) {
        logger.error('Error marking message as seen:', error);
      }
    });

    socket.on('typing_start', async (data: any) => {
      try {
        const { receiver_id } = data;
        await MessageService.setTypingIndicator(socket.userId!, receiver_id);
        io.to(`user:${receiver_id}`).emit('user_typing', {
          userId: socket.userId,
        });
      } catch (error) {
        logger.error('Error setting typing indicator:', error);
      }
    });

    socket.on('typing_stop', async (data: any) => {
      try {
        const { receiver_id } = data;
        await MessageService.clearTypingIndicator(socket.userId!, receiver_id);
        io.to(`user:${receiver_id}`).emit('user_stopped_typing', {
          userId: socket.userId,
        });
      } catch (error) {
        logger.error('Error clearing typing indicator:', error);
      }
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        await OnlineStatusService.removeOnlineUser(socket.userId);
        io.emit('user_offline', { userId: socket.userId });
        logger.info(`User ${socket.userId} disconnected`);
      }
    });

    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });
};
