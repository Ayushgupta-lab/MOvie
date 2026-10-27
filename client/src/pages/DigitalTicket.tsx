import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Ticket, Clock, MapPin, ShieldCheck, Printer, ArrowLeft } from 'lucide-react';
import { api } from '../services/api.js';
import { Booking } from '../types/index.js';

export const DigitalTicket: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!reference) return;
    const fetchBooking = async () => {
      try {
        const res = await api.bookings.getByReference(reference);
        if (res.success && res.booking) {
          setBooking(res.booking);
        }
      } catch (err) {
        console.error('Failed to load digital ticket:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [reference]);

  if (isLoading || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading digital pass...</p>
      </div>
    );
  }

  const showDate = new Date(booking.showId?.startTime || booking.createdAt).toLocaleDateString(
    'en-US',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );

  const showTime = new Date(booking.showId?.startTime || booking.createdAt).toLocaleTimeString(
    'en-US',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }
  );

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <Link
        to="/my-bookings"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Bookings</span>
      </Link>

      <div className="rounded-3xl bg-cinema-850 border border-white/10 overflow-hidden shadow-2xl space-y-6">
        {/* Header */}
        <div className="p-6 bg-cinema-900 border-b border-dashed border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">
              CineNova Gate Pass
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {booking.bookingReference}
            </span>
          </div>

          <h2 className="text-xl font-black text-white">{booking.movieId?.title}</h2>
          <p className="text-xs text-slate-400">
            {booking.theatreId?.name} • {booking.screenId?.name || 'Screen 1'}
          </p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-6 bg-white text-slate-900 mx-6 rounded-2xl space-y-2">
          {booking.qrCodeDataUrl && (
            <img src={booking.qrCodeDataUrl} alt="Gate QR" className="w-44 h-44 object-contain" />
          )}
          <span className="text-[11px] font-mono font-bold text-slate-800">
            Show this QR at the cinema entrance
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Auth Token: {booking.qrCodeToken.slice(0, 16)}...
          </span>
        </div>

        {/* Show Details */}
        <div className="p-6 pt-0 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-white/5">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Show Date</span>
              <span className="font-bold text-white">{showDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Time</span>
              <span className="font-bold text-white">{showTime}</span>
            </div>
          </div>

          <div className="pb-3 border-b border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase mb-1">Seats</span>
            <div className="flex flex-wrap gap-1.5">
              {booking.seats.map((s) => (
                <span
                  key={s.seatId}
                  className="px-2.5 py-0.5 rounded-lg bg-brand-purple/20 border border-brand-purple/30 text-purple-200 font-bold"
                >
                  {s.seatId}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Status</span>
            <span
              className={`font-bold uppercase ${
                booking.status === 'CONFIRMED' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {booking.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
