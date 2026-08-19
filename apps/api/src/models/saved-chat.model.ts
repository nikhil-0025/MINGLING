import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedChatDocument extends Document {
  id: string;
  sessionId: string;
  roomId: string;
  roomName: string;
  savedAt: Date;
  expiresAt: Date;
  messageCount: number;
  lastMessageAt: Date;
}

const SavedChatSchema = new Schema<ISavedChatDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, required: true, index: true },
    roomId: { type: String, required: true, index: true },
    roomName: { type: String, required: true },
    savedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    messageCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

SavedChatSchema.index({ sessionId: 1, roomId: 1 }, { unique: true });
SavedChatSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SavedChatModel = mongoose.model<ISavedChatDocument>('SavedChat', SavedChatSchema);