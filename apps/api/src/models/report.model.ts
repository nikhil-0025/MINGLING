import mongoose, { Schema, Document } from 'mongoose';

export interface IReportDocument extends Document {
  id: string;
  reporterId: string;
  reportedId: string;
  roomId: string;
  messageId?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    reporterId: { type: String, required: true, index: true },
    reportedId: { type: String, required: true, index: true },
    roomId: { type: String, required: true, index: true },
    messageId: { type: String, default: null },
    reason: { type: String, required: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: false }
);

export const ReportModel = mongoose.model<IReportDocument>('Report', ReportSchema);