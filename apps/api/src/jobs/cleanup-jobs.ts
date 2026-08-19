/**
 * Cleanup Jobs
 * Automatically deletes unsaved chats and expired sessions
 */
import cron from 'node-cron';
import { MessageModel } from '../models/message.model';
import { RoomModel } from '../models/room.model';
import { SavedChatModel } from '../models/saved-chat.model';
import { logger } from '../config/logger';

export function startCleanupJobs() {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running cleanup job...');
    try {
      // Delete messages from rooms that are not saved and inactive for 24h
      const expiredRooms = await RoomModel.find({
        isActive: true,
        updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      for (const room of expiredRooms) {
        const isSaved = await SavedChatModel.exists({ roomId: room.id });
        if (!isSaved) {
          await MessageModel.deleteMany({ roomId: room.id });
          await RoomModel.findOneAndUpdate({ id: room.id }, { isActive: false });
          logger.info(`Cleaned up unsaved room: ${room.id}`);
        }
      }

      // Delete expired saved chats
      const deletedSaved = await SavedChatModel.deleteMany({
        expiresAt: { $lt: new Date() },
      });
      if (deletedSaved.deletedCount > 0) {
        logger.info(`Deleted ${deletedSaved.deletedCount} expired saved chats`);
      }
    } catch (error) {
      logger.error('Cleanup job error:', error);
    }
  });

  logger.info('Cleanup jobs scheduled');
}