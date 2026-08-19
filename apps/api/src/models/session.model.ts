import mongoose, { Schema, Document } from 'mongoose';
import { ISession } from '@mingling/shared';

export type ISessionDocument = Omit<ISession, 'id'> & Document;

const SessionSchema = new Schema<ISessionDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, index: true },
    avatar: { type: String, required: true },
    nickname: { type: String, default: null },
    token: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    lastSeen: { type: Date, default: Date.now },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel = mongoose.model<ISessionDocument>('Session', SessionSchema);