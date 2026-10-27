import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'customer' | 'theatre_owner' | 'admin' | 'support';
  city: string;
  isEmailVerified: boolean;
  isSubscribed: boolean;
  subscriptionExpiresAt?: Date;
  subscriptionPlan?: 'monthly' | 'annual';
  rewardPoints: number;
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['customer', 'theatre_owner', 'admin', 'support'],
      default: 'customer',
      index: true,
    },
    city: { type: String, default: 'Mumbai', trim: true },
    isEmailVerified: { type: Boolean, default: true },
    isSubscribed: { type: Boolean, default: false },
    subscriptionExpiresAt: { type: Date },
    subscriptionPlan: { type: String, enum: ['monthly', 'annual'] },
    rewardPoints: { type: Number, default: 50 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.referralCode) {
    this.referralCode = 'CN' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
