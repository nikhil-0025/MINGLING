import { Server, Socket } from 'socket.io';
import { FileModel } from '../models/file.model';
import { MessageModel } from '../models/message.model';
import { RoomModel } from '../models/room.model';
import { generateId } from '../utils/generate-id';
import { logger } from '../config/logger';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@mingling/shared';

type IOServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerFileHandlers(io: IOServer, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
  const { userId, username, avatar } = socket.data;

  socket.on('file:share', async ({ roomId, fileUrl, fileName, fileSize, mimeType }) => {
    try {
      const room = await RoomModel.findOne({ id: roomId, isActive: true });
      if (!room || !room.participants.includes(userId)) {
        socket.emit('error', { message: 'Cannot share file in this room' });
        return;
      }

      const messageType = mimeType?.startsWith('image/') ? 'image' :
                         mimeType?.startsWith('audio/') ? 'voice' : 'file';

      const message = await MessageModel.create({
        id: generateId(),
        roomId,
        senderId: userId,
        senderName: username,
        senderAvatar: avatar,
        type: messageType,
        content: fileName || 'Shared file',
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        status: 'sent',
        createdAt: new Date(),
      });

      io.to(roomId).emit('message:received', {
        message: {
          id: message.id,
          roomId: message.roomId,
          senderId: message.senderId,
          senderName: message.senderName,
          senderAvatar: message.senderAvatar,
          type: message.type,
          content: message.content,
          fileUrl: message.fileUrl,
          fileName: message.fileName,
          fileSize: message.fileSize,
          mimeType: message.mimeType,
          status: message.status,
          createdAt: message.createdAt,
        },
        roomId,
      });

      logger.info(`File shared in room ${roomId} by ${userId}`);
    } catch (error) {
      logger.error('Error sharing file:', error);
      socket.emit('error', { message: 'Failed to share file' });
    }
  });
}