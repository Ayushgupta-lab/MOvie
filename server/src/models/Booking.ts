import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export interface IBookedSeat {
  seatId: string;
  row: string;
  number: number;
  category: string;
  price: number;
}

export interface IBooking extends Document {
  bookingReference: string;
  userId: mongoose.Types.ObjectId;
  showId: mongoose.Types.ObjectId;
  movieId: mongoose.Types.ObjectId;
  theatreId: mongoose.Types.ObjectId;
  screenId: mongoose.Types.ObjectId;
  seats: IBookedSeat[];
  baseAmount: number;
  convenienceFee: number;
  gstAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  holdToken?: string;
  holdExpiresAt?: Date;
  status: BookingStatus;
  paymentProvider: string;
  paymentOrderId?: string;
  paymentId?: string;
  paymentSignature?: string;
  paidAt?: Date;
  qrCodeToken: string;
  qrCodeDataUrl?: string;
  cancellationPolicy: {
    canCancelUntil: Date;
    refundPercentage: number;
  };
  refundDetails?: {
    refundId?: string;
    amount?: number;
    reason?: string;
    processedAt?: Date;
    status?: 'pending' | 'completed' | 'failed';
  };
  rewardPointsEarned: number;
  rewardPointsRedeemed: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    showId: { type: Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    theatreId: { type: Schema.Types.ObjectId, ref: 'Theatre', required: true, index: true },
    screenId: { type: Schema.Types.ObjectId, ref: 'Screen', required: true },
    seats: [
      {
        seatId: { type: String, required: true },
        row: { type: String, required: true },
        number: { type: Number, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    baseAmount: { type: Number, required: true },
    convenienceFee: { type: Number, required: true, default: 0 },
    gstAmount: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    couponCode: { type: String, uppercase: true, trim: true },
    holdToken: { type: String },
    holdExpiresAt: { type: Date },
    status: {
      type: String,
      enum: [
        'PENDING_PAYMENT',
        'CONFIRMED',
        'PAYMENT_FAILED',
        'EXPIRED',
        'CANCELLED',
        'REFUND_PENDING',
        'REFUNDED',
      ],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    paymentProvider: { type: String, default: 'razorpay' },
    paymentOrderId: { type: String, index: true },
    paymentId: { type: String, index: true },
    paymentSignature: { type: String },
    paidAt: { type: Date },
    qrCodeToken: { type: String, required: true, unique: true },
    qrCodeDataUrl: { type: String },
    cancellationPolicy: {
      canCancelUntil: { type: Date, required: true },
      refundPercentage: { type: Number, default: 75 },
    },
    refundDetails: {
      refundId: { type: String },
      amount: { type: Number },
      reason: { type: String },
      processedAt: { type: Date },
      status: { type: String, enum: ['pending', 'completed', 'failed'] },
    },
    rewardPointsEarned: { type: Number, default: 0 },
    rewardPointsRedeemed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, createdAt: -1 });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
