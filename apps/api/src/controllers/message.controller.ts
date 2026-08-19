import { Request, Response, NextFunction } from 'express';
import { MessageModel } from '../models/message.model';
import { createError } from '../middleware/error.middleware';

export async function getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { roomId } = req.params;
    const { before, limit = '50' } = req.query;

    const query: any = { roomId };
    if (before) {
      query.createdAt = { $lt: new Date(before as string) };
    }

    const limitNum = Math.min(100, parseInt(limit as string, 10));

    const messages = await MessageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: { messages: messages.reverse() },
    });
  } catch (error) {
    next(error);
  }
}

export async function searchMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { roomId } = req.params;
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      next(createError('Search query required', 400));
      return;
    }

    const messages = await MessageModel
      .find({
        roomId,
        content: { $regex: q, $options: 'i' },
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
}