import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportTicket extends Document {
  ticketNumber: string;
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  bookingReference?: string;
  category: 'booking' | 'refund' | 'payment' | 'theatre' | 'other';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  responses: {
    senderRole: string;
    senderName: string;
    message: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    bookingReference: { type: String, trim: true },
    category: {
      type: String,
      enum: ['booking', 'refund', 'payment', 'theatre', 'other'],
      default: 'booking',
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    responses: [
      {
        senderRole: { type: String, required: true },
        senderName: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);
