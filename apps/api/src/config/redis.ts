import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { config } from './env';
import { logger } from './logger';

let redisClient: Redis | null = null;
let isMockRedis = false;

export async function connectRedis(): Promise<Redis> {
  if (redisClient) return redisClient;

  const realClient = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  realClient.on('connect', () => logger.info('Redis connecting...'));
  realClient.on('ready', () => logger.info('Redis ready'));
  realClient.on('error', (err) => logger.error('Redis error:', err));
  realClient.on('close', () => logger.warn('Redis connection closed'));

  try {
    await realClient.connect();
    redisClient = realClient;
    return redisClient;
  } catch (error) {
    logger.warn('Primary Redis connection failed, falling back to in-memory Redis', {
      error: (error as Error).message,
    });

    try {
      await realClient.disconnect();
    } catch {
      // Ignore disconnect failures when the primary client already failed.
    }
  }

  redisClient = new RedisMock() as unknown as Redis;
  isMockRedis = true;
  logger.info('Using in-memory Redis fallback');
  return redisClient;
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    if (!isMockRedis) {
      await redisClient.quit();
    }
    redisClient = null;
    isMockRedis = false;
  }
}
