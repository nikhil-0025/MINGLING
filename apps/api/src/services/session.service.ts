import { SessionModel } from '../models/session.model';
import { getRedisClient } from '../config/redis';
import { config } from '../config/env';
import { logger } from '../config/logger';

const SESSION_TTL_SECONDS = config.SESSION_EXPIRY_HOURS * 3600;

export interface SessionData {
  id: string;
  username: string;
  avatar: string;
  nickname: string | null;
  token: string;
  expiresAt: string;
  isActive: boolean;
  createdAt?: string;
}

export class SessionService {
  private static getKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  static async cacheSession(sessionData: SessionData): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.setex(
        this.getKey(sessionData.id),
        SESSION_TTL_SECONDS,
        JSON.stringify(sessionData)
      );
    } catch (err) {
      logger.warn('Failed to cache session in Redis:', err);
    }
  }

  static async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const redis = getRedisClient();
      const cached = await redis.get(this.getKey(sessionId));
      if (cached) {
        const parsed = JSON.parse(cached) as SessionData;
        if (parsed.isActive && new Date(parsed.expiresAt) > new Date()) {
          return parsed;
        }
      }
    } catch (err) {
      // Fallback to MongoDB on Redis error
    }

    const session = await SessionModel.findOne({ id: sessionId, isActive: true });
    if (!session) return null;

    const expiresAtDate = session.expiresAt ? new Date(session.expiresAt) : new Date();

    if (expiresAtDate <= new Date()) {
      session.isActive = false;
      await session.save();
      return null;
    }

    const sessionData: SessionData = {
      id: session.id,
      username: session.username,
      avatar: session.avatar,
      nickname: session.nickname || null,
      token: session.token,
      expiresAt: expiresAtDate.toISOString(),
      isActive: Boolean(session.isActive),
      createdAt: session.createdAt ? new Date(session.createdAt).toISOString() : undefined,
    };

    await this.cacheSession(sessionData);
    return sessionData;
  }

  static async invalidateSession(sessionId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(this.getKey(sessionId));
    } catch (err) {
      logger.warn('Failed to delete session from Redis:', err);
    }

    await SessionModel.findOneAndUpdate({ id: sessionId }, { isActive: false });
  }

  static async updateNickname(sessionId: string, nickname: string): Promise<SessionData | null> {
    const session = await SessionModel.findOneAndUpdate(
      { id: sessionId, isActive: true },
      { nickname },
      { new: true }
    );

    if (!session) return null;

    const expiresAtDate = session.expiresAt ? new Date(session.expiresAt) : new Date();

    const sessionData: SessionData = {
      id: session.id,
      username: session.username,
      avatar: session.avatar,
      nickname: session.nickname || null,
      token: session.token,
      expiresAt: expiresAtDate.toISOString(),
      isActive: Boolean(session.isActive),
      createdAt: session.createdAt ? new Date(session.createdAt).toISOString() : undefined,
    };

    await this.cacheSession(sessionData);
    return sessionData;
  }
}
