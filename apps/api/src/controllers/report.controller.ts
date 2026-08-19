import { Request, Response, NextFunction } from 'express';
import { ReportModel } from '../models/report.model';
import { generateId } from '../utils/generate-id';
import { createError } from '../middleware/error.middleware';
import { logger } from '../config/logger';

export async function createReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { reportedId, roomId, messageId, reason } = req.body;

    if (!reportedId || !roomId || !reason) {
      next(createError('Missing required fields', 400));
      return;
    }

    const report = await ReportModel.create({
      id: generateId(),
      reporterId: req.user!.userId,
      reportedId,
      roomId,
      messageId: messageId || null,
      reason: reason.substring(0, 500),
      status: 'pending',
      createdAt: new Date(),
    });

    logger.info(`Report created: ${report.id} by ${req.user!.userId} against ${reportedId}`);

    res.status(201).json({
      success: true,
      data: { reportId: report.id, status: report.status },
    });
  } catch (error) {
    next(error);
  }
}