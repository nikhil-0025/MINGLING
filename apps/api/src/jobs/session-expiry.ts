/**
 * Session Expiry Job
 * Notifies users before session expires and cleans up
 */
import cron from 'node-cron';
import { SessionModel } from '../models/session.model';
import { getIO } from '../config/socket';
import { logger } from '../config/logger';

export function startSessionExpiryJob() {
  // Check every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const warningTime = new Date(Date.now() + 30 * 60 * 1000); // 30 min before expiry
      const expiringSoon = await SessionModel.find({
        isActive: true,
        expiresAt: { $lte: warningTime, $gt: new Date() },
      }).select('id expiresAt').lean();

      const io = getIO();
      for (const session of expiringSoon) {
        const expiresAt = session.expiresAt instanceof Date ? session.expiresAt : new Date(session.expiresAt);
        io.to(`user:${session.id}`).emit('session:expiring', {
          expiresAt,
          minutesLeft: Math.ceil((expiresAt.getTime() - Date.now()) / 60000),
        });
      }
    } catch (error) {
      logger.error('Session expiry job error:', error);
    }
  });

  logger.info('Session expiry job scheduled');
}