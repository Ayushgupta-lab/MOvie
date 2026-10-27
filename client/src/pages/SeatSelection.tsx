import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { SeatMap } from '../components/SeatMap.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useBooking } from '../context/BookingContext.js';
import { Show, Seat } from '../types/index.js';

export const SeatSelection: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    show,
    setShow,
    movie,
    selectedSeatIds,
    toggleSeat,
    clearSeats,
    setSeatHold,
    secondsRemaining,
  } = useBooking();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [categories, setCategories] = useState<{ name: string; price: number }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!showId) return;

    const loadSeatData = async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const res = await api.shows.getSeats(showId);
        if (res.success) {
          setSeats(res.seats || []);
          setCategories(res.categories || []);
          if (res.show) {
            setShow(res.show);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load auditorium seating layout');
      } finally {
        setIsLoading(false);
      }
    };

    loadSeatData();
  }, [showId]);

  const handleProceed = async () => {
    if (!showId || selectedSeatIds.length === 0) return;

    if (!isAuthenticated) {
      alert('Please sign in or create an account to reserve seats.');
      navigate('/login');
      return;
    }

    setIsHolding(true);
    setErrorMsg('');

    try {
      const holdRes = await api.shows.holdSeats(showId, selectedSeatIds);
      if (holdRes.success && holdRes.holdToken) {
        setSeatHold(holdRes.holdToken, holdRes.expiresAt, holdRes.seatIds);
        navigate(`/checkout/${showId}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not hold selected seats. Please select different seats.');
      // Refresh seats to reflect latest held/sold states
      const refreshed = await api.shows.getSeats(showId);
      if (refreshed.success) {
        setSeats(refreshed.seats || []);
      }
    } finally {
      setIsHolding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-32">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {movie?.title || 'Auditorium Seat Selection'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Select up to 10 seats • Live availability updated
            </p>
          </div>
        </div>

        {show && (
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="px-2.5 py-1 rounded-full bg-brand-purple/20 text-purple-300 font-bold border border-brand-purple/30 uppercase">
              {show.format}
            </span>
            <span>
              {new Date(show.startTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg('')}
            className="text-xs font-semibold underline text-rose-400"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Seat Map Area */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading auditorium seat layout...</p>
        </div>
      ) : (
        <SeatMap
          seats={seats}
          categories={categories}
          selectedSeatIds={selectedSeatIds}
          onToggleSeat={toggleSeat}
          holdSecondsRemaining={secondsRemaining}
          onProceed={handleProceed}
          isLoading={isHolding}
        />
      )}
    </div>
  );
};
