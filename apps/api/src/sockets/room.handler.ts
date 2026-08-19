import { Server, Socket } from 'socket.io';
import { RoomModel } from '../models/room.model';
import { generateId } from '../utils/generate-id';
import { generateRoomCode } from '../utils/generate-room-code';
import { logger } from '../config/logger';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@mingling/shared';

type IOServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerRoomHandlers(io: IOServer, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
  const { userId } = socket.data;

  socket.on('room:create', async ({ name, isPrivate = false }) => {
    try {
      let code = generateRoomCode();
      while (await RoomModel.exists({ code })) {
        code = generateRoomCode();
      }

      const room = await RoomModel.create({
        id: generateId(),
        name: name.trim(),
        code,
        isPrivate,
        createdBy: userId,
        participants: [userId],
        maxParticipants: 100,
        isActive: true,
      });

      socket.join(room.id);

      socket.emit('room:created', {
        room: {
          id: room.id,
          name: room.name,
          code: room.code,
          isPrivate: room.isPrivate,
          createdBy: room.createdBy,
          createdAt: room.createdAt,
          participants: room.participants,
          maxParticipants: room.maxParticipants,
        },
      });

      logger.info(`Room created via socket: ${room.id} by ${userId}`);
    } catch (error) {
      logger.error('Error creating room via socket:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });
}