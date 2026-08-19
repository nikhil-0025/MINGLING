import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '../config/redis';

export async function healthCheck(req: Request, res: Response): Promise<void> {
  const checks = {
    database: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
    redis: 'unknown',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  try {
    const redis = getRedisClient();
    await redis.ping();
    checks.redis = 'healthy';
  } catch {
    checks.redis = 'unhealthy';
  }

  const isHealthy = checks.database === 'healthy' && checks.redis === 'healthy';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: checks,
  });
}