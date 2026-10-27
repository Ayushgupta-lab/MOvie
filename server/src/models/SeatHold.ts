import mongoose, { Document, Schema } from 'mongoose';

export interface ISeatHold extends Document {
  showId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  seatIds: string[];
  holdToken: string;
  expiresAt: Date;
  status: 'active' | 'released' | 'converted';
  createdAt: Date;
  updatedAt: Date;
}

const seatHoldSchema = new Schema<ISeatHold>(
  {
    showId: { type: Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seatIds: [{ type: String, required: true }],
    holdToken: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    status: {
      type: String,
      enum: ['active', 'released', 'converted'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index to quickly find all active holds for a show
seatHoldSchema.index({ showId: 1, status: 1, expiresAt: 1 });

export const SeatHold = mongoose.model<ISeatHold>('SeatHold', seatHoldSchema);
