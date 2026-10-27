import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  planId: 'monthly' | 'annual';
  name: string;
  price: number;
  durationDays: number;
  benefits: string[];
  convenienceFeeWaiver: boolean;
  ticketDiscountPercent: number;
  maxDiscountPerBooking: number;
  isActive: boolean;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    planId: { type: String, enum: ['monthly', 'annual'], required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    benefits: [{ type: String }],
    convenienceFeeWaiver: { type: Boolean, default: true },
    ticketDiscountPercent: { type: Number, default: 15 },
    maxDiscountPerBooking: { type: Number, default: 150 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SubscriptionPlan = mongoose.model<ISubscriptionPlan>(
  'SubscriptionPlan',
  subscriptionPlanSchema
);

export interface IUserSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  planId: 'monthly' | 'annual';
  startDate: Date;
  expiresAt: Date;
  status: 'active' | 'cancelled' | 'expired';
  amountPaid: number;
  paymentOrderId?: string;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSubscriptionSchema = new Schema<IUserSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: String, enum: ['monthly', 'annual'], required: true },
    startDate: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
      index: true,
    },
    amountPaid: { type: Number, required: true },
    paymentOrderId: { type: String },
    paymentId: { type: String },
  },
  { timestamps: true }
);

export const UserSubscription = mongoose.model<IUserSubscription>(
  'UserSubscription',
  userSubscriptionSchema
);
