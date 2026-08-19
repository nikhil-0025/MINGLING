import { Server, Socket } from 'socket.io';
import { logger } from '../config/logger';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@mingling/shared';

type IOServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const typingTimeouts = new Map<string, NodeJS.Timeout>();

export function registerTypingHandlers(io: IOServer, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
  const { userId, username } = socket.data;

  socket.on('typing:start', ({ roomId }) => {
    try {
      const key = `${userId}:${roomId}`;
      if (typingTimeouts.has(key)) {
        clearTimeout(typingTimeouts.get(key)!);
      }

      socket.to(roomId).emit('typing:started', { userId, username, roomId });

      const timeout = setTimeout(() => {
        socket.to(roomId).emit('typing:stopped', { userId, roomId });
        typingTimeouts.delete(key);
      }, 3000);

      typingTimeouts.set(key, timeout);
    } catch (error) {
      logger.error('Error handling typing:start:', error);
    }
  });

  socket.on('typing:stop', ({ roomId }) => {
    try {
      const key = `${userId}:${roomId}`;
      if (typingTimeouts.has(key)) {
        clearTimeout(typingTimeouts.get(key)!);
        typingTimeouts.delete(key);
      }

      socket.to(roomId).emit('typing:stopped', { userId, roomId });
    } catch (error) {
      logger.error('Error handling typing:stop:', error);
    }
  });

  socket.on('disconnect', () => {
    for (const [key, timeout] of typingTimeouts.entries()) {
      if (key.startsWith(`${userId}:`)) {
        clearTimeout(timeout);
        typingTimeouts.delete(key);
      }
    }
  });
}