import { createServer } from 'http';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { createApp } from './server';
import { initializeSocketIO } from './config/socket';
import { logger } from './config/logger';
import { startCleanupJobs } from './jobs/cleanup-jobs';
import { startSessionExpiryJob } from './jobs/session-expiry';

async function bootstrap() {
  try {
    await connectDatabase();
    await connectRedis();
    logger.info('Database & Redis connected');

    const app = createApp();
    const httpServer = createServer(app);
    initializeSocketIO(httpServer);

    startCleanupJobs();
    startSessionExpiryJob();

    httpServer.listen(config.PORT, () => {
      logger.info(`Mingling API running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });

    process.on('SIGTERM', () => gracefulShutdown(httpServer));
    process.on('SIGINT', () => gracefulShutdown(httpServer));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

function gracefulShutdown(server: ReturnType<typeof createServer>) {
  logger.info('SIGTERM/SIGINT received. Closing server gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
}

bootstrap();