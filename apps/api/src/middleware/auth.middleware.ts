import { Request, Response, NextFunction } from 'express';
import { verifyToken, type TokenPayload } from '../utils/jwt';
import { SessionService } from '../services/session.service';
import { logger } from '../config/logger';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization token required' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const session = await SessionService.getSession(decoded.sessionId);
    if (!session) {
      res.status(401).json({ success: false, error: 'Session expired or invalid' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Auth middleware error:', error);
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}