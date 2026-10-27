import mongoose, { Document, Schema } from 'mongoose';

export interface ITheatre extends Document {
  name: string;
  chainName: string;
  city: string;
  locality: string;
  address: string;
  lat: number;
  lng: number;
  amenities: string[];
  ownerId?: mongoose.Types.ObjectId;
  isApproved: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  contactPhone: string;
  contactEmail: string;
  cancellationWindowHours: number;
  refundPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const theatreSchema = new Schema<ITheatre>(
  {
    name: { type: String, required: true, trim: true, index: true },
    chainName: { type: String, default: 'Independent', trim: true },
    city: { type: String, required: true, trim: true, index: true },
    locality: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    amenities: [{ type: String }],
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    isApproved: { type: Boolean, default: true },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    cancellationWindowHours: { type: Number, default: 2 },
    refundPercentage: { type: Number, default: 75 },
  },
  { timestamps: true }
);

export const Theatre = mongoose.model<ITheatre>('Theatre', theatreSchema);
