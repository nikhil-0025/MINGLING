import { Request, Response, NextFunction } from 'express';
import { createError } from './error.middleware';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-change-me';

export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  const adminToken = req.headers['x-admin-token'] as string;

  if (!adminToken || adminToken !== ADMIN_SECRET) {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }

  next();
}