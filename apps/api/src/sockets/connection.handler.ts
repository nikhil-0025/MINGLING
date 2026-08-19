import { Server, Socket } from 'socket.io';
import { getRedisClient } from '../config/redis';
import { MessageModel } from '../models/message.model';
import { generateId } from '../utils/generate-id';
import { logger } from '../config/logger';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@mingling/shared';

type IOServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerConnectionHandlers(io: IOServer, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
  const { userId, username, avatar } = socket.data;
  const redis = getRedisClient();

  redis.hset('online_users', userId, JSON.stringify({ username, avatar, socketId: socket.id, lastSeen: Date.now() }));

  socket.join(`user:${userId}`);

  socket.on('room:join', async ({ roomId }) => {
    try {
      const wasInRoom = socket.rooms.has(roomId);
      socket.join(roomId);
      await redis.sadd(`room:${roomId}:participants`, userId);

      socket.to(roomId).emit('user:joined', {
        userId,
        username,
        avatar,
        roomId,
      });

      if (!wasInRoom) {
        try {
          const sysMsg = await MessageModel.create({
            id: generateId(),
            roomId,
            senderId: 'system',
            senderName: 'System',
            senderAvatar: '',
            type: 'system',
            content: `${username || 'A user'} joined the room`,
            status: 'sent',
            createdAt: new Date(),
          });

          io.to(roomId).emit('message:received', {
            message: {
              id: sysMsg.id,
              roomId: sysMsg.roomId,
              senderId: sysMsg.senderId,
              senderName: sysMsg.senderName,
              senderAvatar: sysMsg.senderAvatar,
              type: sysMsg.type as any,
              content: sysMsg.content,
              replyTo: sysMsg.replyTo || undefined,
              status: sysMsg.status as any,
              createdAt: sysMsg.createdAt,
            },
            roomId,
          });
        } catch (msgErr) {
          logger.error('Error creating join system message:', msgErr);
        }
      }

      const participantIds = await redis.smembers(`room:${roomId}:participants`);
      const users: any[] = [];
      for (const pid of participantIds) {
        const userData = await redis.hget('online_users', pid);
        if (userData) {
          const parsed = JSON.parse(userData);
          users.push({ userId: pid, username: parsed.username, avatar: parsed.avatar });
        }
      }
      socket.emit('online:users', { roomId, users });

      logger.info(`User ${userId} joined room ${roomId}`);
    } catch (error) {
      logger.error(`Error joining room ${roomId}:`, error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  const sendLeaveAnnouncement = async (targetRoomId: string) => {
    try {
      const sysMsg = await MessageModel.create({
        id: generateId(),
        roomId: targetRoomId,
        senderId: 'system',
        senderName: 'System',
        senderAvatar: '',
        type: 'system',
        content: `${username || 'A user'} left the room`,
        status: 'sent',
        createdAt: new Date(),
      });

      io.to(targetRoomId).emit('message:received', {
        message: {
          id: sysMsg.id,
          roomId: sysMsg.roomId,
          senderId: sysMsg.senderId,
          senderName: sysMsg.senderName,
          senderAvatar: sysMsg.senderAvatar,
          type: sysMsg.type as any,
          content: sysMsg.content,
          replyTo: sysMsg.replyTo || undefined,
          status: sysMsg.status as any,
          createdAt: sysMsg.createdAt,
        },
        roomId: targetRoomId,
      });
    } catch (err) {
      logger.error(`Error creating leave system message for room ${targetRoomId}:`, err);
    }
  };

  socket.on('room:leave', async ({ roomId }) => {
    try {
      socket.leave(roomId);
      await redis.srem(`room:${roomId}:participants`, userId);
      socket.to(roomId).emit('user:left', { userId, roomId });
      await sendLeaveAnnouncement(roomId);
      logger.info(`User ${userId} left room ${roomId}`);
    } catch (error) {
      logger.error(`Error leaving room ${roomId}:`, error);
    }
  });

  socket.on('disconnecting', async () => {
    try {
      await redis.hdel('online_users', userId);
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id && !r.startsWith('user:'));
      for (const roomId of rooms) {
        await redis.srem(`room:${roomId}:participants`, userId);
        socket.to(roomId).emit('user:left', { userId, roomId });
        await sendLeaveAnnouncement(roomId);
      }
      logger.info(`User ${userId} disconnected from rooms: ${rooms.join(', ')}`);
    } catch (error) {
      logger.error('Error during disconnect cleanup:', error);
    }
  });
}