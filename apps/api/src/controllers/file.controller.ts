import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary } from '../config/cloudinary';
import { FileModel } from '../models/file.model';
import { generateId } from '../utils/generate-id';
import { createError } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import fs from 'fs';

export async function uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      next(createError('No file provided', 400));
      return;
    }

    const { roomId } = req.body;
    if (!roomId) {
      fs.unlinkSync(req.file.path);
      next(createError('Room ID required', 400));
      return;
    }

    const { url, publicId } = await uploadToCloudinary(req.file.path, `mingling/${roomId}`);

    fs.unlinkSync(req.file.path);

    const fileDoc = await FileModel.create({
      id: generateId(),
      originalName: req.file.originalname,
      url,
      publicId,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user!.userId,
      roomId,
    });

    logger.info(`File uploaded: ${fileDoc.id} by ${req.user!.userId}`);

    res.status(201).json({
      success: true,
      data: {
        id: fileDoc.id,
        url: fileDoc.url,
        originalName: fileDoc.originalName,
        mimeType: fileDoc.mimeType,
        size: fileDoc.size,
      },
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
}