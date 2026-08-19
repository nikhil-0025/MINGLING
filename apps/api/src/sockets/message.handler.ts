import { Server, Socket } from 'socket.io';
import { MessageModel } from '../models/message.model';
import { RoomModel } from '../models/room.model';
import { generateId } from '../utils/generate-id';
import { getRedisClient } from '../config/redis';
import { logger } from '../config/logger';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@mingling/shared';

type IOServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerMessageHandlers(io: IOServer, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
  const { userId, username, avatar } = socket.data;
  const redis = getRedisClient();

  socket.on('message:send', async ({ roomId, content, type = 'text', replyTo }) => {
    try {
      const rateKey = `ratelimit:msg:${userId}`;
      const msgCount = await redis.incr(rateKey);
      if (msgCount === 1) await redis.expire(rateKey, 60);
      if (msgCount > 60) {
        socket.emit('error', { message: 'Rate limit exceeded. Slow down.' });
        return;
      }

      const room = await RoomModel.findOne({ id: roomId, isActive: true });
      if (!room) {
        socket.emit('error', { message: 'Room not found or inactive' });
        return;
      }

      if (!room.participants.includes(userId)) {
        socket.emit('error', { message: 'Not a member of this room' });
        return;
      }

      const sanitizedContent = content.trim().substring(0, 4000);
      if (!sanitizedContent) {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      const message = await MessageModel.create({
        id: generateId(),
        roomId,
        senderId: userId,
        senderName: username,
        senderAvatar: avatar,
        type,
        content: sanitizedContent,
        replyTo: replyTo || null,
        status: 'sent',
        createdAt: new Date(),
      });

      const messageData = {
        id: message.id,
        roomId: message.roomId,
        senderId: message.senderId,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar,
        type: message.type,
        content: message.content,
        replyTo: message.replyTo,
        status: message.status,
        createdAt: message.createdAt,
      };

      io.to(roomId).emit('message:received', { message: messageData, roomId });

      logger.debug(`Message sent in room ${roomId} by ${userId}`);
    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('message:seen', async ({ messageId, roomId }) => {
    try {
      await MessageModel.findOneAndUpdate(
        { id: messageId },
        { status: 'seen' }
      );

      socket.to(roomId).emit('message:updated', { messageId, status: 'seen' });
    } catch (error) {
      logger.error('Error updating message status:', error);
    }
  });
}