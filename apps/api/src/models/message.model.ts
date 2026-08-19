import mongoose, { Schema, Document } from 'mongoose';
import { IMessage, MessageType, MessageStatus } from '@mingling/shared';

export type IMessageDocument = Omit<IMessage, 'id'> & Document;

const MessageSchema = new Schema<IMessageDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    roomId: { type: String, required: true, index: true },
    senderId: { type: String, required: true, index: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'voice', 'system'] as MessageType[],
      default: 'text',
    },
    content: { type: String, required: true, maxlength: 4000 },
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
    fileSize: { type: Number, default: null },
    mimeType: { type: String, default: null },
    replyTo: { type: String, default: null, index: true },
    status: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'seen', 'failed'] as MessageStatus[],
      default: 'sent',
    },
    editedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

MessageSchema.index({ roomId: 1, createdAt: -1 });

export const MessageModel = mongoose.model<IMessageDocument>('Message', MessageSchema);