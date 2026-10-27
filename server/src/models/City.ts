import mongoose, { Document, Schema } from 'mongoose';

export interface ICity extends Document {
  name: string;
  state: string;
  code: string;
  lat: number;
  lng: number;
  isPopular: boolean;
  isActive: boolean;
}

const citySchema = new Schema<ICity>(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    state: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const City = mongoose.model<ICity>('City', citySchema);
