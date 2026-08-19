import mongoose, { Schema, Document } from 'mongoose';
import { IRoom } from '@mingling/shared';

export type IRoomDocument = Omit<IRoom, 'id'> & Document;

const RoomSchema = new Schema<IRoomDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    code: { type: String, required: true, unique: true, index: true },
    isPrivate: { type: Boolean, default: false },
    createdBy: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    participants: [{ type: String, index: true }],
    maxParticipants: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

RoomSchema.index({ isActive: 1, code: 1 });

export const RoomModel = mongoose.model<IRoomDocument>('Room', RoomSchema);