import { Request, Response } from 'express';
import crypto from 'crypto';
import { Booking } from '../models/Booking.js';
import { Show } from '../models/Show.js';
import { Screen } from '../models/Screen.js';
import { User } from '../models/User.js';
import { SeatHold } from '../models/SeatHold.js';
import { Coupon } from '../models/Coupon.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateAuthoritativePricing } from '../services/pricingService.js';
import {
  createPaymentOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  processRefund,
} from '../services/paymentService.js';
import {
  generateBookingReference,
  generateTicketQR,
  verifyTicketToken,
} from '../services/ticketService.js';
import { convertHoldToSold, releaseSoldSeats } from '../services/seatService.js';

export const calculatePrice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { showId, seatIds, couponCode, redeemPoints } = req.body;

    if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      res.status(400).json({ success: false, message: 'showId and seatIds are required' });
      return;
    }

    const show = await Show.findById(showId);
    if (!show) {
      res.status(404).json({ success: false, message: 'Show not found' });
      return;
    }

    const screen = await Screen.findById(show.screenId);
    if (!screen) {
      res.status(404).json({ success: false, message: 'Screen not found' });
      return;
    }

    const user = req.user ? await User.findById(req.user.id) : null;

    const breakdown = await calculateAuthoritativePricing({
      show,
      screen,
      selectedSeatIds: seatIds,
      couponCode,
      user,
      redeemPoints: typeof redeemPoints === 'number' ? redeemPoints : 0,
    });

    res.json({ success: true, ...breakdown });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { showId, seatIds, holdToken, couponCode, redeemPoints } = req.body;

    if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0 || !holdToken) {
      res.status(400).json({ success: false, message: 'showId, seatIds, and holdToken are required' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // 1. Verify that seat hold is valid and belongs to this user
    const seatHold = await SeatHold.findOne({
      holdToken,
      showId,
      userId: user._id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    if (!seatHold) {
      res.status(400).json({
        success: false,
        message: 'Your seat hold has expired or is invalid. Please select your seats again.',
      });
      return;
    }

    // 2. Fetch show and screen
    const show = await Show.findById(showId);
    if (!show) {
      res.status(404).json({ success: false, message: 'Show not found' });
      return;
    }

    const screen = await Screen.findById(show.screenId);
    if (!screen) {
      res.status(404).json({ success: false, message: 'Screen not found' });
      return;
    }

    // 3. Compute authoritative server pricing
    const pricing = await calculateAuthoritativePricing({
      show,
      screen,
      selectedSeatIds: seatIds,
      couponCode,
      user,
      redeemPoints: typeof redeemPoints === 'number' ? redeemPoints : 0,
    });

    // 4. Generate reference and QR validation token
    const bookingReference = generateBookingReference();
    const qrCodeToken = 'TKT_' + crypto.randomBytes(24).toString('hex');

    // 5. Create payment order
    const orderResult = await createPaymentOrder({
      amountInRupees: pricing.totalAmount,
      bookingReference,
      notes: {
        userId: user._id.toString(),
        movieId: show.movieId.toString(),
        seats: seatIds.join(','),
      },
    });

    // 6. Cancellation policy: Cancellable up to 2 hours before showtime
    const showStartTime = new Date(show.startTime);
    const canCancelUntil = new Date(showStartTime.getTime() - 2 * 60 * 60 * 1000);

    // 7. Create booking in PENDING_PAYMENT state
    const booking = await Booking.create({
      bookingReference,
      userId: user._id,
      showId: show._id,
      movieId: show.movieId,
      theatreId: show.theatreId,
      screenId: show.screenId,
      seats: pricing.seats,
      baseAmount: pricing.baseAmount,
      convenienceFee: pricing.convenienceFee,
      gstAmount: pricing.gstAmount,
      discountAmount: pricing.discountAmount,
      totalAmount: pricing.totalAmount,
      couponCode: pricing.couponApplied?.code,
      holdToken,
      holdExpiresAt: seatHold.expiresAt,
      status: 'PENDING_PAYMENT',
      paymentProvider: 'razorpay',
      paymentOrderId: orderResult.orderId,
      qrCodeToken,
      cancellationPolicy: {
        canCancelUntil,
        refundPercentage: 75,
      },
    });

    res.status(201).json({
      success: true,
      bookingReference: booking.bookingReference,
      orderId: orderResult.orderId,
      amount: orderResult.amount, // in paise
      amountInRupees: pricing.totalAmount,
      currency: orderResult.currency,
      keyId: orderResult.keyId,
      isMock: orderResult.isMock,
      pricing,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { bookingReference, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!bookingReference || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters',
      });
      return;
    }

    const booking = await Booking.findOne({ bookingReference, userId: req.user.id });
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Already confirmed? Idempotent response
    if (booking.status === 'CONFIRMED') {
      res.json({
        success: true,
        message: 'Payment already confirmed',
        booking,
      });
      return;
    }

    // Verify cryptographic signature
    const isValidSignature = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      booking.status = 'PAYMENT_FAILED';
      await booking.save();
      res.status(400).json({
        success: false,
        message: 'Cryptographic payment signature verification failed. Forged request detected.',
      });
      return;
    }

    // Concurrency safe: Convert held seats to permanently sold
    const seatIds = booking.seats.map((s) => s.seatId);
    await convertHoldToSold(booking.showId.toString(), seatIds, booking.holdToken);

    // Generate QR Code with digital ticket
    const qrDataUrl = await generateTicketQR(booking.bookingReference, booking.qrCodeToken);

    // Update coupon usage count if coupon was used
    if (booking.couponCode) {
      await Coupon.updateOne({ code: booking.couponCode }, { $inc: { usedCount: 1 } });
    }

    // Award loyalty reward points (10% of base amount)
    const pointsEarned = Math.round(booking.baseAmount * 0.1);
    await User.updateOne(
      { _id: req.user.id },
      { $inc: { rewardPoints: pointsEarned } }
    );

    // Authoritative confirmation
    booking.status = 'CONFIRMED';
    booking.paymentId = razorpay_payment_id;
    booking.paymentSignature = razorpay_signature;
    booking.paidAt = new Date();
    booking.qrCodeDataUrl = qrDataUrl;
    booking.rewardPointsEarned = pointsEarned;
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movieId')
      .populate('theatreId')
      .populate('showId')
      .populate('screenId');

    res.json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: populatedBooking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handlePaymentWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const bodyStr = JSON.stringify(req.body);

    const isValid = verifyWebhookSignature(bodyStr, signature);
    if (!isValid && process.env.NODE_ENV === 'production') {
      res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      return;
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        const booking = await Booking.findOne({ paymentOrderId: orderId });
        if (booking && booking.status === 'PENDING_PAYMENT') {
          const seatIds = booking.seats.map((s) => s.seatId);
          await convertHoldToSold(booking.showId.toString(), seatIds, booking.holdToken);

          const qrDataUrl = await generateTicketQR(
            booking.bookingReference,
            booking.qrCodeToken
          );

          booking.status = 'CONFIRMED';
          booking.paymentId = paymentEntity.id;
          booking.paidAt = new Date();
          booking.qrCodeDataUrl = qrDataUrl;
          await booking.save();
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const bookings = await Booking.find({ userId: req.user.id })
      .populate('movieId', 'title posterUrl durationMinutes certification languages')
      .populate('theatreId', 'name address locality city')
      .populate('showId', 'startTime endTime language format')
      .populate('screenId', 'name screenType')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingByReference = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reference } = req.params;

    const booking = await Booking.findOne({
      bookingReference: reference.toUpperCase().trim(),
    })
      .populate('movieId')
      .populate('theatreId')
      .populate('showId')
      .populate('screenId')
      .populate('userId', 'name email phone');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Ensure non-admin users can only view their own bookings
    if (
      req.user &&
      req.user.role === 'customer' &&
      booking.userId._id.toString() !== req.user.id
    ) {
      res.status(403).json({ success: false, message: 'Unauthorized access to this booking' });
      return;
    }

    res.json({ success: true, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { reference } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findOne({
      bookingReference: reference.toUpperCase().trim(),
      userId: req.user.id,
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (booking.status !== 'CONFIRMED') {
      res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled because its status is ${booking.status}`,
      });
      return;
    }

    const now = new Date();
    if (now > booking.cancellationPolicy.canCancelUntil) {
      res.status(400).json({
        success: false,
        message: 'The cancellation deadline (2 hours prior to showtime) has passed for this booking',
      });
      return;
    }

    // Calculate policy refund (75% of base ticket price)
    const refundPercentage = booking.cancellationPolicy.refundPercentage || 75;
    const refundAmount = Math.round((booking.baseAmount * refundPercentage) / 100);

    // Initiate refund via Payment Service
    let refundResult: { refundId: string; status: 'completed' | 'processing' | 'failed'; amount: number } = {
      refundId: 'simulated_refund',
      status: 'completed',
      amount: refundAmount,
    };
    if (booking.paymentId) {
      refundResult = await processRefund({
        paymentId: booking.paymentId,
        amountInRupees: refundAmount,
        reason: reason || 'Customer requested cancellation',
      });
    }

    // Release seats back to Show
    const seatIds = booking.seats.map((s) => s.seatId);
    await releaseSoldSeats(booking.showId.toString(), seatIds);

    booking.status = 'CANCELLED';
    booking.refundDetails = {
      refundId: refundResult.refundId,
      amount: refundAmount,
      reason: reason || 'Customer cancellation',
      processedAt: new Date(),
      status: refundResult.status === 'completed' ? 'completed' : 'pending',
    };

    await booking.save();

    res.json({
      success: true,
      message: `Booking cancelled successfully. Refund of ₹${refundAmount} has been initiated to your original payment method.`,
      booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validateTicketQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const result = await verifyTicketToken(token);

    if (!result.valid) {
      res.status(400).json({ success: false, message: result.message, booking: result.booking });
      return;
    }

    res.json({ success: true, message: result.message, booking: result.booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
