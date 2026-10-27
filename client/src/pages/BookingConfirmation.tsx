import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Printer,
  Calendar,
  MapPin,
  Clock,
  Ticket,
  ShieldCheck,
  ArrowRight,
  Download,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Booking } from '../types/index.js';

export const BookingConfirmation: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    // Trigger celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899'],
    });

    if (!reference) return;

    const loadBooking = async () => {
      setIsLoading(true);
      try {
        const res = await api.bookings.getByReference(reference);
        if (res.success && res.booking) {
          setBooking(res.booking);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Could not fetch booking confirmation');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [reference]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading your digital ticket...</p>
      </div>
    );
  }

  if (errorMsg || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Booking Not Found</h2>
        <p className="text-xs text-slate-400">{errorMsg || 'Unable to locate ticket record.'}</p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-full bg-brand-purple text-xs font-bold text-white shadow-glow"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const showDate = new Date(booking.showId?.startTime || booking.createdAt).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 print:p-0 print:m-0">
      {/* Success Banner */}
      <div className="text-center space-y-2 print:hidden">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Booking Confirmed!</h1>
        <p className="text-xs text-slate-400">
          A confirmation with your digital QR ticket has been sent to your registered email.
        </p>
      </div>

      {/* Digital Cinema Ticket Card */}
      <div className="relative rounded-3xl bg-cinema-850 border border-white/10 overflow-hidden shadow-2xl print:border-black print:text-black print:bg-white">
        {/* Ticket Top: Movie Info & Reference */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-cinema-900 to-cinema-850 border-b border-dashed border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] tracking-widest uppercase font-bold text-brand-purple">
              CineNova E-Ticket
            </span>
            <h2 className="text-2xl font-black text-white">{booking.movieId?.title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="px-2 py-0.5 rounded bg-brand-cyan/20 text-cyan-300 font-bold text-[10px]">
                {booking.showId?.format || '2D'}
              </span>
              <span>{booking.showId?.language}</span>
              <span className="text-slate-500">•</span>
              <span>{booking.movieId?.certification || 'UA'}</span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase text-slate-400 block">Booking Reference</span>
            <span className="text-base font-mono font-black text-white tracking-wider">
              {booking.bookingReference}
            </span>
          </div>
        </div>

        {/* Ticket Body: Schedule, Seats, Theatre & QR Code */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2 space-y-5">
            {/* Theatre & Screen */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Cinema Hall</span>
              <h4 className="text-sm font-bold text-white">{booking.theatreId?.name}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{booking.theatreId?.address}</p>
              <p className="text-xs font-semibold text-brand-cyan pt-0.5">
                {booking.screenId?.name || 'Screen 1'}
              </p>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Show Date</span>
                <p className="text-xs font-bold text-white">{showDate}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Showtime</span>
                <p className="text-xs font-bold text-white">{showTime}</p>
              </div>
            </div>

            {/* Seats */}
            <div className="pt-3 border-t border-white/5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Confirmed Seats ({booking.seats.length})
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {booking.seats.map((s) => (
                  <span
                    key={s.seatId}
                    className="px-3 py-1 rounded-xl bg-brand-purple/20 border border-brand-purple/40 text-purple-200 text-xs font-mono font-bold"
                  >
                    {s.seatId} ({s.category})
                  </span>
                ))}
              </div>
            </div>

            {/* Payment & Amount */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Total Paid: </span>
                <span className="text-sm font-black text-white">₹{booking.totalAmount}</span>
              </div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Paid via Razorpay
              </span>
            </div>
          </div>

          {/* QR Code Validation Column */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-center space-y-2">
            {booking.qrCodeDataUrl ? (
              <img
                src={booking.qrCodeDataUrl}
                alt="Ticket QR Code"
                className="w-36 h-36 object-contain"
              />
            ) : (
              <div className="w-36 h-36 bg-slate-200 flex items-center justify-center text-slate-600 text-xs">
                QR Code
              </div>
            )}
            <span className="text-[10px] font-mono font-bold text-slate-800">
              Scan at Cinema Gate
            </span>
            <span className="text-[9px] text-slate-500 font-mono">
              Token: {booking.qrCodeToken.slice(0, 14)}...
            </span>
          </div>
        </div>

        {/* Cancellation policy banner */}
        <div className="p-4 bg-cinema-900 border-t border-white/5 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Cancellable until{' '}
            <strong className="text-slate-300">
              {new Date(booking.cancellationPolicy.canCancelUntil).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </strong>{' '}
            (75% refund to original payment method).
          </span>
          <span className="text-slate-500 text-[10px]">CineNova Digital Gate Pass</span>
        </div>
      </div>

      {/* Action Buttons (Hidden on Print) */}
      <div className="flex flex-wrap items-center justify-center gap-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Ticket</span>
        </button>

        <Link
          to="/my-bookings"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-purple hover:brightness-110 text-white text-xs font-bold shadow-glow transition-all"
        >
          <span>View All Bookings</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
