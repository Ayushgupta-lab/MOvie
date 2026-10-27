import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon.js';
import { Booking } from '../models/Booking.js';
import { AuthRequest } from '../middleware/auth.js';

export const getActiveCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).sort({ discountValue: -1 });

    res.json({ success: true, coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, amount } = req.body;

    if (!code || typeof amount !== 'number') {
      res.status(400).json({ success: false, message: 'code and booking amount are required' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({
      code: cleanCode,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
      return;
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: 'This coupon has reached its maximum global usage' });
      return;
    }

    if (amount < coupon.minSpend) {
      res.status(400).json({
        success: false,
        message: `This coupon requires a minimum booking amount of ₹${coupon.minSpend}`,
      });
      return;
    }

    if (req.user && coupon.isNewUserOnly) {
      const pastBookings = await Booking.countDocuments({
        userId: req.user.id,
        status: 'CONFIRMED',
      });
      if (pastBookings > 0) {
        res.status(400).json({
          success: false,
          message: 'This coupon is valid only on your first booking with CineNova',
        });
        return;
      }
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((amount * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.discountValue, coupon.maxDiscount || coupon.discountValue);
    }

    res.json({
      success: true,
      message: `Promo code ${coupon.code} applied successfully!`,
      coupon: {
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
