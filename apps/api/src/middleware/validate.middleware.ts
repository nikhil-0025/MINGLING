import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { createError } from './error.middleware';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      next(createError(message, 400, 'VALIDATION_ERROR'));
      return;
    }
    req.body = result.data;
    next();
  };
}