import { IShow } from '../models/Show.js';
import { IScreen, ISeatDefinition } from '../models/Screen.js';
import { Coupon, ICoupon } from '../models/Coupon.js';
import { Booking } from '../models/Booking.js';
import { IUser } from '../models/User.js';
import { config } from '../config/env.js';

export interface PriceBreakdown {
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

export const calculateAuthoritativePricing = async (params: {
  show: IShow;
  screen: IScreen;
  selectedSeatIds: string[];
  couponCode?: string;
  user?: IUser | null;
  redeemPoints?: number;
}): Promise<PriceBreakdown> => {
  const { show, screen, selectedSeatIds, couponCode, user, redeemPoints = 0 } = params;

  // 1. Build seat details & validate pricing
  const seatMap = new Map<string, ISeatDefinition>();
  for (const s of screen.seatLayout.seats) {
    seatMap.set(s.id, s);
  }

  // Create category to price map from show pricing or screen pricing
  const showCategoryPrices = new Map<string, number>();
  for (const p of show.pricing) {
    showCategoryPrices.set(p.category, p.price);
  }

  const seats: PriceBreakdown['seats'] = [];
  let baseAmount = 0;

  for (const seatId of selectedSeatIds) {
    const seatDef = seatMap.get(seatId);
    if (!seatDef) {
      throw new Error(`Invalid seat identifier: ${seatId}`);
    }

    // Use show pricing if configured for category, else seat default price
    const categoryPrice = showCategoryPrices.get(seatDef.category) ?? seatDef.price;
    seats.push({
      seatId: seatDef.id,
      row: seatDef.row,
      number: seatDef.number,
      category: seatDef.category,
      price: categoryPrice,
    });
    baseAmount += categoryPrice;
  }

  // 2. Convenience fee calculation (e.g. ₹30 base + 5% per ticket)
  const isCineNovaPlus = Boolean(
    user && user.isSubscribed && user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date()
  );

  let convenienceFee = 0;
  let convenienceFeeWaived = false;

  if (isCineNovaPlus) {
    // CineNova Plus benefit: 100% convenience fee waiver
    convenienceFee = 0;
    convenienceFeeWaived = true;
  } else {
    convenienceFee = Math.round(
      config.booking.baseConvenienceFee * selectedSeatIds.length +
        baseAmount * 0.05
    );
  }

  // GST 18% on convenience fee only
  const gstAmount = convenienceFee > 0 ? Math.round(convenienceFee * config.booking.gstPercentage) : 0;

  // 3. Discount calculations
  let discountAmount = 0;
  let couponApplied: PriceBreakdown['couponApplied'] = undefined;
  let membershipDiscountApplied = 0;

  // CineNova Plus member ticket discount (10% up to ₹150)
  if (isCineNovaPlus) {
    membershipDiscountApplied = Math.min(Math.round(baseAmount * 0.1), 150);
    discountAmount += membershipDiscountApplied;
  }

  // 4. Coupon validation and calculation
  if (couponCode && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();
    const coupon: ICoupon | null = await Coupon.findOne({
      code: cleanCode,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      throw new Error(`Invalid or expired promo code: ${cleanCode}`);
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new Error(`Promo code ${cleanCode} has reached its maximum usage limit`);
    }

    if (baseAmount < coupon.minSpend) {
      throw new Error(
        `Promo code ${cleanCode} requires a minimum booking amount of ₹${coupon.minSpend}`
      );
    }

    if (coupon.isMemberOnly && !isCineNovaPlus) {
      throw new Error(`Promo code ${cleanCode} is reserved exclusively for CineNova Plus members`);
    }

    if (user && coupon.isNewUserOnly) {
      const pastBookings = await Booking.countDocuments({
        userId: user._id,
        status: 'CONFIRMED',
      });
      if (pastBookings > 0) {
        throw new Error(`Promo code ${cleanCode} is valid only on your first booking`);
      }
    }

    if (user) {
      const userRedemptions = await Booking.countDocuments({
        userId: user._id,
        couponCode: cleanCode,
        status: { $in: ['CONFIRMED', 'PENDING_PAYMENT'] },
      });
      if (userRedemptions >= coupon.perUserLimit) {
        throw new Error(`You have already used promo code ${cleanCode}`);
      }
    }

    let couponDiscount = 0;
    if (coupon.discountType === 'percentage') {
      couponDiscount = Math.round((baseAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
        couponDiscount = coupon.maxDiscount;
      }
    } else {
      couponDiscount = Math.min(coupon.discountValue, coupon.maxDiscount || coupon.discountValue);
    }

    couponApplied = {
      code: coupon.code,
      title: coupon.title,
      discountAmount: couponDiscount,
    };

    discountAmount += couponDiscount;
  }

  // 5. Reward points redemption (e.g., 1 point = ₹1, up to 20% of base amount)
  if (redeemPoints > 0 && user) {
    const availablePoints = user.rewardPoints || 0;
    const pointsToUse = Math.min(redeemPoints, availablePoints, Math.floor(baseAmount * 0.2));
    discountAmount += pointsToUse;
  }

  // Cap total discount so amount never drops below ₹1
  if (discountAmount > baseAmount) {
    discountAmount = baseAmount - 1;
  }

  const totalAmount = Math.max(1, baseAmount + convenienceFee + gstAmount - discountAmount);

  return {
    seats,
    baseAmount,
    convenienceFee,
    gstAmount,
    discountAmount,
    totalAmount,
    couponApplied,
    membershipDiscountApplied,
    convenienceFeeWaived,
  };
};
