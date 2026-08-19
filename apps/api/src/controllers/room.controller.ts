import { Request, Response, NextFunction } from 'express';
import { RoomModel } from '../models/room.model';
import { MessageModel } from '../models/message.model';
import { generateId } from '../utils/generate-id';
import { generateRoomCode } from '../utils/generate-room-code';
import { createError } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import QRCode from 'qrcode';

export async function createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, isPrivate = false } = req.body;
    const userId = req.user!.userId;

    let code = generateRoomCode();
    while (await RoomModel.exists({ code })) {
      code = generateRoomCode();
    }

    const room = await RoomModel.create({
      id: generateId(),
      name: name.trim(),
      code,
      isPrivate,
      createdBy: userId,
      participants: [userId],
      maxParticipants: 100,
      isActive: true,
    });

    logger.info(`Room created: ${room.id} (${room.code}) by ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        id: room.id,
        name: room.name,
        code: room.code,
        isPrivate: room.isPrivate,
        createdAt: room.createdAt,
        participantCount: room.participants.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function joinRoomByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code } = req.params;
    const userId = req.user!.userId;

    const rawCode = (code || '').trim();
    const cleanCode = rawCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const formattedCode = cleanCode.length === 8 ? `${cleanCode.slice(0, 4)}-${cleanCode.slice(4)}` : cleanCode;

    const room = await RoomModel.findOne({
      $or: [
        { code: formattedCode },
        { code: cleanCode },
        { code: rawCode.toUpperCase() },
        { id: rawCode },
        { id: cleanCode },
      ],
      isActive: true,
    });

    if (!room) {
      next(createError('Room not found or inactive', 404));
      return;
    }

    if (room.participants.length >= room.maxParticipants) {
      next(createError('Room is full', 403));
      return;
    }

    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
      await room.save();
    }

    res.json({
      success: true,
      data: {
        id: room.id,
        name: room.name,
        code: room.code,
        isPrivate: room.isPrivate,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
        participantCount: room.participants.length,
        participants: room.participants,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { roomId } = req.params;
    const room = await RoomModel.findOne({ id: roomId, isActive: true });

    if (!room) {
      next(createError('Room not found', 404));
      return;
    }

    res.json({
      success: true,
      data: {
        id: room.id,
        name: room.name,
        code: room.code,
        isPrivate: room.isPrivate,
        createdBy: room.createdBy,
        participants: room.participants.length,
        maxParticipants: room.maxParticipants,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRoomMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { roomId } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const messages = await MessageModel
      .find({ roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await MessageModel.countDocuments({ roomId });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function generateRoomQR(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { roomId } = req.params;
    const room = await RoomModel.findOne({ id: roomId, isActive: true });

    if (!room) {
      next(createError('Room not found', 404));
      return;
    }

    const joinUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/chat?code=${room.code}`;
    const qrDataUrl = await QRCode.toDataURL(joinUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    res.json({
      success: true,
      data: { qrCode: qrDataUrl, joinUrl },
    });
  } catch (error) {
    next(error);
  }
}

export async function leaveRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { roomId } = req.params;
    const userId = req.user!.userId;

    const room = await RoomModel.findOne({ id: roomId });
    if (!room) {
      next(createError('Room not found', 404));
      return;
    }

    room.participants = room.participants.filter((id) => id !== userId);
    await room.save();

    res.json({ success: true, message: 'Left room successfully' });
  } catch (error) {
    next(error);
  }
}