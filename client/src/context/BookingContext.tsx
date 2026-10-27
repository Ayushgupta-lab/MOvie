import React, { createContext, useContext, useState, useEffect } from 'react';
import { Movie, Show } from '../types/index.js';
import { api } from '../services/api.js';

interface PriceBreakdown {
  seats: {
    seatId: string;
    row: string;
    number: number;
    category: string;
    price: number;
  }[];
  baseAmount: number;
  convenienceFee: number;
  gstAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponApplied?: {
    code: string;
    title: string;
    discountAmount: number;
  };
  membershipDiscountApplied?: number;
  convenienceFeeWaived?: boolean;
}

interface BookingContextType {
  movie: Movie | null;
  setMovie: (m: Movie | null) => void;
  show: Show | null;
  setShow: (s: Show | null) => void;
  selectedSeatIds: string[];
  toggleSeat: (seatId: string) => void;
  clearSeats: () => void;
  holdToken: string | null;
  holdExpiresAt: Date | null;
  secondsRemaining: number;
  setSeatHold: (token: string, expiresAt: Date, seats: string[]) => void;
  releaseActiveHold: () => Promise<void>;
  pricing: PriceBreakdown | null;
  setPricing: (p: PriceBreakdown | null) => void;
  couponCode: string;
  setCouponCode: (c: string) => void;
  redeemPoints: number;
  setRedeemPoints: (p: number) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [show, setShow] = useState<Show | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [holdToken, setHoldToken] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [redeemPoints, setRedeemPoints] = useState<number>(0);

  // Countdown timer for seat hold
  useEffect(() => {
    if (!holdExpiresAt) {
      setSecondsRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((holdExpiresAt.getTime() - now) / 1000));
      setSecondsRemaining(diff);

      if (diff === 0) {
        clearInterval(interval);
        setHoldToken(null);
        setHoldExpiresAt(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const toggleSeat = (seatId: string) => {
    setSelectedSeatIds((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      if (prev.length >= 10) {
        alert('You can select a maximum of 10 seats per booking.');
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const clearSeats = () => {
    setSelectedSeatIds([]);
  };

  const setSeatHold = (token: string, expiresAt: Date, seats: string[]) => {
    setHoldToken(token);
    setHoldExpiresAt(new Date(expiresAt));
    setSelectedSeatIds(seats);
  };

  const releaseActiveHold = async () => {
    if (show && holdToken) {
      try {
        await api.shows.releaseHold(show._id, holdToken);
      } catch (err) {
        console.warn('Hold release error:', err);
      }
    }
    setHoldToken(null);
    setHoldExpiresAt(null);
    setSecondsRemaining(0);
  };

  const resetBooking = () => {
    releaseActiveHold();
    setSelectedSeatIds([]);
    setPricing(null);
    setCouponCode('');
    setRedeemPoints(0);
  };

  return (
    <BookingContext.Provider
      value={{
        movie,
        setMovie,
        show,
        setShow,
        selectedSeatIds,
        toggleSeat,
        clearSeats,
        holdToken,
        holdExpiresAt,
        secondsRemaining,
        setSeatHold,
        releaseActiveHold,
        pricing,
        setPricing,
        couponCode,
        setCouponCode,
        redeemPoints,
        setRedeemPoints,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
