import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minSpend: number;
  maxDiscount: number;
  applicableCities: string[];
  isNewUserOnly: boolean;
  isMemberOnly: boolean;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    discountValue: { type: Number, required: true },
    minSpend: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 500 },
    applicableCities: [{ type: String }],
    isNewUserOnly: { type: Boolean, default: false },
    isMemberOnly: { type: Boolean, default: false },
    usageLimit: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
