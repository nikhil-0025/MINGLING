import { Request, Response, NextFunction } from 'express';
import { SessionModel } from '../models/session.model';
import { SessionService, SessionData } from '../services/session.service';
import { generateId } from '../utils/generate-id';
import { generateUsername } from '../utils/generate-username';
import { generateAvatar } from '../utils/generate-avatar';
import { generateToken } from '../utils/jwt';
import { createError } from '../middleware/error.middleware';
import { config } from '../config/env';
import { logger } from '../config/logger';

export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nickname } = req.body;
    const sessionId = generateId();
    const username = generateUsername();
    const avatar = generateAvatar(username);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.SESSION_EXPIRY_HOURS);

    const token = generateToken({
      userId: sessionId,
      username,
      avatar,
      sessionId,
    });

    const session = await SessionModel.create({
      id: sessionId,
      username,
      avatar,
      nickname: nickname || null,
      token,
      expiresAt,
      isActive: true,
      lastSeen: new Date(),
      ip: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    });

    const expiresAtStr = new Date(session.expiresAt).toISOString();
    const createdAtStr = session.createdAt ? new Date(session.createdAt).toISOString() : undefined;

    const sessionData: SessionData = {
      id: session.id,
      username: session.username,
      avatar: session.avatar,
      nickname: session.nickname || null,
      token,
      expiresAt: expiresAtStr,
      isActive: true,
      createdAt: createdAtStr,
    };

    await SessionService.cacheSession(sessionData);

    logger.info(`Session created: ${sessionId} (${username})`);

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.id,
        username: session.username,
        avatar: session.avatar,
        nickname: session.nickname,
        token,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = req.user!.sessionId;
    const session = await SessionService.getSession(sessionId);

    if (!session) {
      next(createError('Session not found or expired', 404));
      return;
    }

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        username: session.username,
        avatar: session.avatar,
        nickname: session.nickname,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateNickname(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nickname } = req.body;
    if (!nickname || nickname.length > 30) {
      next(createError('Nickname must be between 1 and 30 characters', 400));
      return;
    }

    const session = await SessionService.updateNickname(req.user!.sessionId, nickname);

    if (!session) {
      next(createError('Session not found', 404));
      return;
    }

    res.json({
      success: true,
      data: { nickname: session.nickname },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await SessionService.invalidateSession(req.user!.sessionId);
    logger.info(`Session deleted: ${req.user!.sessionId}`);
    res.json({ success: true, message: 'Session ended successfully' });
  } catch (error) {
    next(error);
  }
}