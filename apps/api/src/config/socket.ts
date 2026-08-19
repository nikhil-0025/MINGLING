import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { config } from './env';
import { logger } from './logger';
import { verifySocketToken } from '../utils/jwt';
import { SessionService } from '../services/session.service';
import {
  registerConnectionHandlers,
  registerMessageHandlers,
  registerRoomHandlers,
  registerTypingHandlers,
  registerPresenceHandlers,
  registerFileHandlers,
  registerAIHandlers,
} from '../sockets';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@mingling/shared';

let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

export function initializeSocketIO(httpServer: HttpServer): void {
  io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    connectTimeout: 10000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token as string;
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = verifySocketToken(token);
      const session = await SessionService.getSession(decoded.sessionId);
      if (!session) {
        return next(new Error('Authentication error: Session expired or invalid'));
      }

      socket.data = {
        userId: session.id,
        username: session.nickname || session.username,
        avatar: session.avatar,
        sessionId: session.id,
      };
      next();
    } catch (err) {
      logger.warn('Socket authentication failed:', err);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, username } = socket.data;
    logger.info(`Socket connected: ${userId} (${username})`);

    registerConnectionHandlers(io!, socket);
    registerMessageHandlers(io!, socket);
    registerRoomHandlers(io!, socket);
    registerTypingHandlers(io!, socket);
    registerPresenceHandlers(io!, socket);
    registerFileHandlers(io!, socket);
    registerAIHandlers(io!, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${userId} (${reason})`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error for ${userId}:`, err);
    });
  });

  logger.info('Socket.IO initialized with all handlers');
}

export function getIO(): Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}