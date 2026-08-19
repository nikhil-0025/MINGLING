import mongoose, { Schema, Document } from 'mongoose';

export interface IFileDocument extends Document {
  id: string;
  originalName: string;
  url: string;
  publicId: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  roomId: string;
  createdAt: Date;
}

const FileSchema = new Schema<IFileDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: String, required: true, index: true },
    roomId: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const FileModel = mongoose.model<IFileDocument>('File', FileSchema);