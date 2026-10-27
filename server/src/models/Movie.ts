import mongoose, { Document, Schema } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  slug: string;
  synopsis: string;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
  durationMinutes: number;
  certification: 'U' | 'UA' | 'A' | 'S';
  languages: string[];
  genres: string[];
  formats: string[];
  releaseDate: Date;
  isTrending: boolean;
  isNowShowing: boolean;
  isComingSoon: boolean;
  avgRating: number;
  ratingCount: number;
  cast: { name: string; role: string; photo: string }[];
  crew: { name: string; role: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovie>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    synopsis: { type: String, required: true },
    posterUrl: { type: String, required: true },
    bannerUrl: { type: String, required: true },
    trailerUrl: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    certification: { type: String, enum: ['U', 'UA', 'A', 'S'], default: 'UA' },
    languages: [{ type: String, required: true, index: true }],
    genres: [{ type: String, required: true, index: true }],
    formats: [{ type: String, default: ['2D'] }],
    releaseDate: { type: Date, required: true, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    isNowShowing: { type: Boolean, default: true, index: true },
    isComingSoon: { type: Boolean, default: false, index: true },
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    cast: [
      {
        name: { type: String, required: true },
        role: { type: String, required: true },
        photo: { type: String, required: true },
      },
    ],
    crew: [
      {
        name: { type: String, required: true },
        role: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Movie = mongoose.model<IMovie>('Movie', movieSchema);
