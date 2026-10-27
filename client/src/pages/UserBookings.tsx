import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Coins,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Booking } from '../types/index.js';

export const UserBookings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Change of schedule');
  const [isProcessingCancel, setIsProcessingCancel] = useState<boolean>(false);
  const [cancelMessage, setCancelMessage] = useState<string>('');
  const [cancelError, setCancelError] = useState<string>('');

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.bookings.getMyBookings();
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated]);

  const now = new Date();

  // Separate upcoming from past
  const upcomingBookings = bookings.filter((b) => {
    const showTime = new Date(b.showId?.startTime || b.createdAt);
    return showTime > now && b.status === 'CONFIRMED';
  });

  const pastBookings = bookings.filter((b) => {
    const showTime = new Date(b.showId?.startTime || b.createdAt);
    return showTime <= now || b.status !== 'CONFIRMED';
  });

  const handleCancelClick = (b: Booking) => {
    setCancellingBooking(b);
    setCancelMessage('');
    setCancelError('');
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setIsProcessingCancel(true);
    setCancelError('');

    try {
      const res = await api.bookings.cancel(cancellingBooking.bookingReference, cancelReason);
      if (res.success) {
        setCancelMessage(res.message);
        await fetchBookings();
        setTimeout(() => {
          setCancellingBooking(null);
          setCancelMessage('');
        }, 2500);
      }
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel booking');
    } finally {
      setIsProcessingCancel(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">My Bookings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your confirmed e-tickets, gate QR passes, and cancellation history
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-cinema-850 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-brand-purple text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'past'
                ? 'bg-brand-purple text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Past & Cancelled ({pastBookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading your tickets...</p>
        </div>
      ) : (activeTab === 'upcoming' ? upcomingBookings : pastBookings).length > 0 ? (
        <div className="space-y-4">
          {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((b) => {
            const showTime = new Date(b.showId?.startTime || b.createdAt);
            const canCancel =
              b.status === 'CONFIRMED' &&
              b.cancellationPolicy?.canCancelUntil &&
              new Date() < new Date(b.cancellationPolicy.canCancelUntil);

            return (
              <div
                key={b._id}
                className="p-6 rounded-3xl bg-cinema-850/80 border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left: Movie poster & basic show info */}
                <div className="flex items-start gap-4">
                  {b.movieId?.posterUrl && (
                    <img
                      src={b.movieId.posterUrl}
                      alt={b.movieId.title}
                      className="w-16 h-24 object-cover rounded-2xl border border-white/10 shrink-0"
                    />
                  )}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-brand-purple font-bold">
                      {b.bookingReference}
                    </span>
                    <h3 className="text-lg font-black text-white">{b.movieId?.title}</h3>
                    <p className="text-xs text-slate-300">
                      {b.theatreId?.name} • {b.screenId?.name || 'Screen 1'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {showTime.toLocaleDateString('en-US', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      at{' '}
                      {showTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-xs font-semibold text-slate-300">Seats:</span>
                      <span className="text-xs font-bold text-brand-cyan">
                        {b.seats.map((s) => s.seatId).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status, Amount, and Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : b.status === 'CANCELLED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="text-base font-black text-white">₹{b.totalAmount}</span>
                  </div>

                  {b.refundDetails && (
                    <span className="text-[11px] text-amber-300">
                      Refund of ₹{b.refundDetails.amount} ({b.refundDetails.status})
                    </span>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to={`/ticket/${b.bookingReference}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/40 text-purple-200 text-xs font-semibold transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Pass</span>
                    </Link>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelClick(b)}
                        className="px-4 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-cinema-850 rounded-3xl border border-white/5 space-y-3">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No {activeTab} bookings</h3>
          <p className="text-xs text-slate-400">
            {activeTab === 'upcoming'
              ? "You don't have any upcoming movies scheduled."
              : 'No past booking records found.'}
          </p>
          <Link
            to="/movies"
            className="inline-block px-5 py-2.5 rounded-full bg-brand-purple text-xs font-bold text-white shadow-glow"
          >
            Explore Movies & Shows
          </Link>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-cinema-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Cancel Booking?</span>
            </h3>

            <div className="p-4 rounded-2xl bg-cinema-850 border border-white/5 space-y-2 text-xs">
              <p className="text-slate-300">
                Movie: <strong className="text-white">{cancellingBooking.movieId?.title}</strong>
              </p>
              <p className="text-slate-300">
                Seats:{' '}
                <strong className="text-white">
                  {cancellingBooking.seats.map((s) => s.seatId).join(', ')}
                </strong>
              </p>
              <p className="text-slate-300">
                Original Ticket Price: <strong>₹{cancellingBooking.baseAmount}</strong>
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between font-bold text-emerald-400">
                <span>Calculated Policy Refund (75%):</span>
                <span>₹{Math.round((cancellingBooking.baseAmount * 75) / 100)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-cinema-850 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="Change of schedule">Change of schedule</option>
                <option value="Booked incorrect seats">Booked incorrect seats / show</option>
                <option value="Found better showtime">Found better showtime</option>
                <option value="Other personal reason">Other personal reason</option>
              </select>
            </div>

            {cancelError && <p className="text-xs text-rose-400">{cancelError}</p>}
            {cancelMessage && <p className="text-xs text-emerald-400">{cancelMessage}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isProcessingCancel}
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-400 hover:text-white"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isProcessingCancel}
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg"
              >
                {isProcessingCancel ? 'Processing Refund...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
