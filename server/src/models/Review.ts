import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  movieId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  rating: number; // 1 to 5 or 1 to 10
  comment: string;
  isVerifiedBooking: boolean;
  helpfulCount: number;
  reported: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    comment: { type: String, required: true, maxlength: 1000 },
    isVerifiedBooking: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
    reported: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ movieId: 1, userId: 1 }, { unique: true }); // Prevent duplicate reviews per movie by same user

export const Review = mongoose.model<IReview>('Review', reviewSchema);
