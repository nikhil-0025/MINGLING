import { Server, Socket } from 'socket.io';
import { getRedisClient } from '../config/redis';
import { logger } from '../config/logger';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@mingling/shared';

type IOServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerPresenceHandlers(io: IOServer, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
  const { userId } = socket.data;
  const redis = getRedisClient();

  const heartbeatInterval = setInterval(async () => {
    try {
      const existing = await redis.hget('online_users', userId);
      if (existing) {
        const parsed = JSON.parse(existing);
        parsed.lastSeen = Date.now();
        await redis.hset('online_users', userId, JSON.stringify(parsed));
      }
    } catch (error) {
      logger.error('Heartbeat error:', error);
    }
  }, 30000);

  socket.on('disconnect', () => {
    clearInterval(heartbeatInterval);
  });
}