import { z } from 'zod';

export const createSessionSchema = z.object({
  nickname: z.string().max(30).optional(),
});

export const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  isPrivate: z.boolean().optional(),
});

export const joinRoomSchema = z.object({
  code: z.string().length(9).regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/),
});

export const sendMessageSchema = z.object({
  roomId: z.string().uuid(),
  content: z.string().min(1).max(4000),
  type: z.enum(['text', 'image', 'file', 'voice']).optional(),
  replyTo: z.string().uuid().optional(),
});