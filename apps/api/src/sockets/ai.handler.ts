import { Server, Socket } from 'socket.io';
import { generateAIResponse, moderateMessage } from '../services/ai.service';
import { logger } from '../config/logger';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@mingling/shared';

type IOServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerAIHandlers(io: IOServer, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
  const { userId, username } = socket.data;

  socket.on('ai:ask', async ({ roomId, question }) => {
    try {
      const response = await generateAIResponse(
        [{ role: 'user', content: question }],
        'chat'
      );

      socket.emit('message:received', {
        message: {
          id: `ai-${Date.now()}`,
          roomId,
          senderId: 'ai-assistant',
          senderName: 'AI Assistant',
          senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI&backgroundColor=ffdfbf',
          type: 'text',
          content: response.content,
          status: 'sent',
          createdAt: new Date(),
        },
        roomId,
      });

      logger.info(`AI response sent to room ${roomId}`);
    } catch (error) {
      logger.error('AI handler error:', error);
      socket.emit('error', { message: 'AI service unavailable' });
    }
  });

  socket.on('ai:moderate', async ({ roomId, messageId, content }) => {
    try {
      const isFlagged = await moderateMessage(content);
      if (isFlagged) {
        io.to(roomId).emit('message:flagged', { messageId, reason: 'Potentially inappropriate content' });
        logger.warn(`Message ${messageId} flagged for moderation in room ${roomId}`);
      }
    } catch (error) {
      logger.error('Moderation error:', error);
    }
  });
}