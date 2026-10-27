import mongoose, { Document, Schema } from 'mongoose';

export interface ISeatDefinition {
  id: string;
  row: string;
  number: number;
  category: string;
  type: 'regular' | 'wheelchair' | 'companion' | 'empty';
  price: number;
}

export interface IScreen extends Document {
  theatreId: mongoose.Types.ObjectId;
  name: string;
  screenType: 'IMAX' | '4DX' | 'Dolby Atmos' | 'Standard 2D' | 'RealD 3D';
  totalSeats: number;
  seatLayout: {
    rows: number;
    cols: number;
    categories: {
      name: string;
      basePrice: number;
      rows: string[];
    }[];
    seats: ISeatDefinition[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const screenSchema = new Schema<IScreen>(
  {
    theatreId: { type: Schema.Types.ObjectId, ref: 'Theatre', required: true, index: true },
    name: { type: String, required: true, trim: true },
    screenType: {
      type: String,
      enum: ['IMAX', '4DX', 'Dolby Atmos', 'Standard 2D', 'RealD 3D'],
      default: 'Standard 2D',
    },
    totalSeats: { type: Number, required: true },
    seatLayout: {
      rows: { type: Number, required: true },
      cols: { type: Number, required: true },
      categories: [
        {
          name: { type: String, required: true },
          basePrice: { type: Number, required: true },
          rows: [{ type: String, required: true }],
        },
      ],
      seats: [
        {
          id: { type: String, required: true },
          row: { type: String, required: true },
          number: { type: Number, required: true },
          category: { type: String, required: true },
          type: {
            type: String,
            enum: ['regular', 'wheelchair', 'companion', 'empty'],
            default: 'regular',
          },
          price: { type: Number, required: true },
        },
      ],
    },
  },
  { timestamps: true }
);

export const Screen = mongoose.model<IScreen>('Screen', screenSchema);
