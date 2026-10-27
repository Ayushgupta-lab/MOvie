import mongoose, { Document, Schema } from 'mongoose';

export interface IShow extends Document {
  movieId: mongoose.Types.ObjectId;
  theatreId: mongoose.Types.ObjectId;
  screenId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  dateStr: string; // YYYY-MM-DD
  language: string;
  format: string;
  pricing: { category: string; price: number }[];
  status: 'scheduled' | 'cancelled' | 'completed';
  soldSeats: string[]; // Concurrency booked seats
  totalSeats: number;
  availableSeatsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const showSchema = new Schema<IShow>(
  {
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    theatreId: { type: Schema.Types.ObjectId, ref: 'Theatre', required: true, index: true },
    screenId: { type: Schema.Types.ObjectId, ref: 'Screen', required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    dateStr: { type: String, required: true, index: true },
    language: { type: String, required: true },
    format: { type: String, required: true },
    pricing: [
      {
        category: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'cancelled', 'completed'],
      default: 'scheduled',
      index: true,
    },
    soldSeats: [{ type: String }],
    totalSeats: { type: Number, required: true },
    availableSeatsCount: { type: Number, required: true },
  },
  { timestamps: true }
);

// Compound indexes for rapid lookup of available shows
showSchema.index({ movieId: 1, dateStr: 1, status: 1 });
showSchema.index({ theatreId: 1, dateStr: 1 });

export const Show = mongoose.model<IShow>('Show', showSchema);
