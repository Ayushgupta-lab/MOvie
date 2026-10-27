import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Tag,
  Clock,
  Sparkles,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Crown,
  Coins,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useBooking } from '../context/BookingContext.js';
import { PaymentModal } from '../components/PaymentModal.js';
import { Show } from '../types/index.js';

export const Checkout: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isSubscribed } = useAuth();
  const {
    show,
    movie,
    selectedSeatIds,
    holdToken,
    secondsRemaining,
    pricing,
    setPricing,
    couponCode,
    setCouponCode,
    redeemPoints,
    setRedeemPoints,
  } = useBooking();

  const [inputCoupon, setInputCoupon] = useState<string>('');
  const [couponError, setCouponError] = useState<string>('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string>('');

  // Fetch Authoritative Server Pricing whenever seats, coupon, or points change
  const refreshAuthoritativePrice = async (couponToApply?: string, pointsToRedeem = 0) => {
    if (!showId || selectedSeatIds.length === 0) return;

    try {
      const res = await api.bookings.calculatePrice({
        showId,
        seatIds: selectedSeatIds,
        couponCode: couponToApply ?? couponCode,
        redeemPoints: pointsToRedeem,
      });

      if (res.success) {
        setPricing(res);
        setCheckoutError('');
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Error calculating ticket price');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!holdToken || selectedSeatIds.length === 0) {
      navigate(`/movies`);
      return;
    }

    refreshAuthoritativePrice();
  }, [showId, selectedSeatIds, holdToken]);

  // If hold expires, redirect user back to seat selection
  useEffect(() => {
    if (holdToken && secondsRemaining === 0) {
      alert('Your temporary seat hold has expired. Please re-select your seats.');
      navigate(`/seat-selection/${showId}`);
    }
  }, [secondsRemaining, holdToken]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const code = inputCoupon.trim().toUpperCase();
      await refreshAuthoritativePrice(code, redeemPoints);
      setCouponCode(code);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setInputCoupon('');
    setCouponError('');
    refreshAuthoritativePrice('', redeemPoints);
  };

  const handleToggleRedeemPoints = (e: React.ChangeEvent<HTMLInputElement>) => {
    const usePoints = e.target.checked;
    const points = usePoints ? Math.min(user?.rewardPoints || 0, 100) : 0;
    setRedeemPoints(points);
    refreshAuthoritativePrice(couponCode, points);
  };

  const handleInitiatePayment = async () => {
    if (!showId || !holdToken) return;

    setIsCreatingOrder(true);
    setCheckoutError('');

    try {
      const res = await api.bookings.createOrder({
        showId,
        seatIds: selectedSeatIds,
        holdToken,
        couponCode,
        redeemPoints,
      });

      if (res.success && res.orderId) {
        setOrderData(res);
        setIsPaymentModalOpen(true);
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Failed to initialize payment gateway order');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = (confirmedBooking: any) => {
    setIsPaymentModalOpen(false);
    navigate(`/booking-confirmation/${confirmedBooking.bookingReference}`);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24">
      {/* 1. Header & Expiry Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Review & Checkout</h1>
          <p className="text-xs text-slate-400 mt-1">Authoritative pricing & verified order confirmation</p>
        </div>

        {secondsRemaining > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Seats held for {formatTime(secondsRemaining)}</span>
          </div>
        )}
      </div>

      {checkoutError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Booking Details & Offers */}
        <div className="md:col-span-2 space-y-6">
          {/* Movie & Show Overview */}
          <div className="p-6 rounded-3xl bg-cinema-850/80 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-brand-purple" />
              <span>Show Details</span>
            </h3>

            <div className="space-y-1.5 text-sm">
              <h4 className="text-lg font-black text-white">{movie?.title}</h4>
              <p className="text-xs text-slate-300">
                Format: <span className="text-brand-cyan font-bold">{show?.format}</span> • Language:{' '}
                {show?.language}
              </p>
              <p className="text-xs text-slate-400">
                Date:{' '}
                {show &&
                  new Date(show.startTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                at{' '}
                {show &&
                  new Date(show.startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Reserved Seats:</span>
              <span className="font-bold text-brand-purple text-sm">{selectedSeatIds.join(', ')}</span>
            </div>
          </div>

          {/* Promo Code & Offers */}
          <div className="p-6 rounded-3xl bg-cinema-850/80 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>Apply Promo Code</span>
            </h3>

            {couponCode ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-brand-purple/10 border border-brand-purple/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-purple" />
                  <div>
                    <span className="text-xs font-bold text-white block">{couponCode}</span>
                    <span className="text-[11px] text-emerald-400">Discount applied to total</span>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-semibold text-rose-400 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. FIRST50, CINEMAGIC)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 uppercase tracking-wider focus:outline-none focus:border-brand-purple"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !inputCoupon.trim()}
                    className="px-5 py-2.5 rounded-2xl bg-brand-purple hover:brightness-110 text-white font-bold text-xs shadow-glow disabled:opacity-50"
                  >
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-xs text-rose-400">{couponError}</p>}
                <p className="text-[11px] text-slate-500">
                  Tip: Use <span className="text-purple-300 font-mono">FIRST50</span> for flat ₹50
                  off or <span className="text-purple-300 font-mono">CINEMAGIC</span> for 20% off.
                </p>
              </form>
            )}
          </div>

          {/* Loyalty Reward Points */}
          {user && (user.rewardPoints || 0) > 0 && (
            <div className="p-5 rounded-3xl bg-cinema-850/80 border border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Redeem CineNova Reward Points</h4>
                  <p className="text-[11px] text-slate-400">
                    You have <span className="text-amber-400 font-semibold">{user.rewardPoints} points</span>.
                    Redeem up to 100 points (₹100 off).
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={redeemPoints > 0}
                  onChange={handleToggleRedeemPoints}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-cinema-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-purple" />
              </label>
            </div>
          )}
        </div>

        {/* Right Col: Authoritative Price Breakdown */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-cinema-850 border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white pb-3 border-b border-white/5">
              Price Summary
            </h3>

            {pricing ? (
              <div className="space-y-3 text-xs">
                {/* Seats subtotal */}
                <div className="flex items-center justify-between text-slate-300">
                  <span>Tickets ({pricing.seats.length})</span>
                  <span className="font-semibold text-white">₹{pricing.baseAmount}</span>
                </div>

                {/* Convenience Fee */}
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    Convenience Fee
                    {pricing.convenienceFeeWaived && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                        100% WAIVED
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-white">
                    {pricing.convenienceFeeWaived ? (
                      <span className="text-emerald-400">FREE</span>
                    ) : (
                      `₹${pricing.convenienceFee}`
                    )}
                  </span>
                </div>

                {/* GST */}
                <div className="flex items-center justify-between text-slate-300">
                  <span>GST (18% on fees)</span>
                  <span className="font-semibold text-white">₹{pricing.gstAmount}</span>
                </div>

                {/* CineNova Plus Member Discount */}
                {pricing.membershipDiscountApplied ? (
                  <div className="flex items-center justify-between text-amber-300 font-medium">
                    <span className="flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      Plus Member Discount
                    </span>
                    <span>-₹{pricing.membershipDiscountApplied}</span>
                  </div>
                ) : null}

                {/* Coupon Discount */}
                {pricing.couponApplied && (
                  <div className="flex items-center justify-between text-brand-purple font-medium">
                    <span>Coupon ({pricing.couponApplied.code})</span>
                    <span>-₹{pricing.couponApplied.discountAmount}</span>
                  </div>
                )}

                {/* Reward Points */}
                {redeemPoints > 0 && (
                  <div className="flex items-center justify-between text-amber-400 font-medium">
                    <span>Reward Points Redeemed</span>
                    <span>-₹{redeemPoints}</span>
                  </div>
                )}

                {/* Final Total Amount */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white block">Total Amount</span>
                    <span className="text-[10px] text-slate-400">Includes all taxes</span>
                  </div>
                  <span className="text-2xl font-black text-white">₹{pricing.totalAmount}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Calculating authoritative price...
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handleInitiatePayment}
              disabled={isCreatingOrder || !pricing}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-gradient-to-r from-brand-violet to-brand-purple hover:brightness-110 text-white font-bold text-sm shadow-glow transition-all disabled:opacity-50"
            >
              {isCreatingOrder ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparing Gateway...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Proceed to Pay ₹{pricing?.totalAmount || ''}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Razorpay Verified Sandbox • Instant Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {orderData && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          bookingReference={orderData.bookingReference}
          orderId={orderData.orderId}
          amountInRupees={orderData.amountInRupees}
          movieTitle={movie?.title || 'Cinema Ticket'}
          seats={selectedSeatIds}
          isMock={orderData.isMock}
          keyId={orderData.keyId}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
