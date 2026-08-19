import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export interface TokenPayload {
  userId: string;
  username: string;
  avatar: string;
  sessionId: string;
}

export function generateToken(payload: TokenPayload): string {
  const secret: Secret = config.JWT_SECRET;
  const options: SignOptions = {
    expiresIn: config.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
}

export function verifySocketToken(token: string): TokenPayload {
  try {
    return verifyToken(token);
  } catch {
    throw new Error('Invalid or expired token');
  }
}