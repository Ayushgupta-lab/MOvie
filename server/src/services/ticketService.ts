import QRCode from 'qrcode';
import crypto from 'crypto';
import { Booking, IBooking } from '../models/Booking.js';

export const generateBookingReference = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars like 0, O, 1, I
  let ref = '';
  for (let i = 0; i < 7; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CN-${new Date().getFullYear()}-${ref}`;
};

export const generateTicketQR = async (
  bookingReference: string,
  qrCodeToken: string
): Promise<string> => {
  const payload = JSON.stringify({
    platform: 'CineNova',
    bookingReference,
    validationToken: qrCodeToken,
    generatedAt: new Date().toISOString(),
  });

  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#1E1B4B',
      light: '#FFFFFF',
    },
    width: 320,
  });
};

export const verifyTicketToken = async (
  token: string
): Promise<{
  valid: boolean;
  booking?: IBooking;
  message: string;
}> => {
  const booking = await Booking.findOne({ qrCodeToken: token })
    .populate('movieId', 'title posterUrl durationMinutes certification')
    .populate('theatreId', 'name address locality city')
    .populate('showId', 'startTime format language')
    .populate('userId', 'name email phone');

  if (!booking) {
    return { valid: false, message: 'Invalid or fraudulent ticket token' };
  }

  if (booking.status !== 'CONFIRMED') {
    return {
      valid: false,
      booking,
      message: `Ticket is not valid. Status is ${booking.status}`,
    };
  }

  return {
    valid: true,
    booking,
    message: 'Ticket verified successfully',
  };
};
