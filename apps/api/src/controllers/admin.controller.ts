import { Request, Response, NextFunction } from 'express';
import { SessionModel } from '../models/session.model';
import { RoomModel } from '../models/room.model';
import { MessageModel } from '../models/message.model';
import { ReportModel } from '../models/report.model';
import { getRedisClient } from '../config/redis';
import { createError } from '../middleware/error.middleware';
import { logger } from '../config/logger';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalSessions,
      activeSessions,
      totalRooms,
      activeRooms,
      totalMessages,
      pendingReports,
    ] = await Promise.all([
      SessionModel.countDocuments(),
      SessionModel.countDocuments({ isActive: true }),
      RoomModel.countDocuments(),
      RoomModel.countDocuments({ isActive: true }),
      MessageModel.countDocuments(),
      ReportModel.countDocuments({ status: 'pending' }),
    ]);

    const redis = getRedisClient();
    const onlineCount = await redis.hlen('online_users');

    res.json({
      success: true,
      data: {
        totalSessions,
        activeSessions,
        onlineNow: onlineCount,
        totalRooms,
        activeRooms,
        totalMessages,
        pendingReports,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '20', search = '' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const [rooms, total] = await Promise.all([
      RoomModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      RoomModel.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { rooms, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { roomId } = req.params;
    await RoomModel.findOneAndUpdate({ id: roomId }, { isActive: false });
    await MessageModel.deleteMany({ roomId });
    logger.info(`Admin deleted room: ${roomId}`);
    res.json({ success: true, message: 'Room deleted' });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      SessionModel.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      SessionModel.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { users, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } },
    });
  } catch (error) {
    next(error);
  }
}

export async function blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId } = req.params;
    await SessionModel.findOneAndUpdate({ id: sessionId }, { isActive: false });
    logger.info(`Admin blocked user: ${sessionId}`);
    res.json({ success: true, message: 'User blocked' });
  } catch (error) {
    next(error);
  }
}

export async function getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status = 'pending' } = req.query;
    const reports = await ReportModel.find({ status: status as string })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, data: { reports } });
  } catch (error) {
    next(error);
  }
}

export async function resolveReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { reportId } = req.params;
    const { action } = req.body;

    const report = await ReportModel.findOneAndUpdate(
      { id: reportId },
      { status: action === 'dismiss' ? 'dismissed' : 'resolved', resolvedAt: new Date() },
      { new: true }
    );

    if (!report) {
      next(createError('Report not found', 404));
      return;
    }

    if (action === 'block') {
      await SessionModel.findOneAndUpdate({ id: report.reportedId }, { isActive: false });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}

export async function getServerStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const redis = getRedisClient();
    const redisInfo = await redis.info('server');

    res.json({
      success: true,
      data: {
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        platform: process.platform,
        redis: redisInfo.split('\n').slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
}