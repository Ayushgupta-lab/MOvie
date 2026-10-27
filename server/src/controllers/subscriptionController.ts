import { Request, Response } from 'express';
import { SubscriptionPlan, UserSubscription } from '../models/Subscription.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { createPaymentOrder, verifyPaymentSignature } from '../services/paymentService.js';

export const getSubscriptionPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    res.json({ success: true, plans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSubscriptionOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { planId } = req.body;
    const plan = await SubscriptionPlan.findOne({ planId, isActive: true });

    if (!plan) {
      res.status(404).json({ success: false, message: 'Subscription plan not found' });
      return;
    }

    const orderResult = await createPaymentOrder({
      amountInRupees: plan.price,
      bookingReference: `SUB-${planId.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      notes: {
        userId: req.user.id,
        planId: plan.planId,
      },
    });

    res.json({
      success: true,
      plan,
      orderId: orderResult.orderId,
      amount: orderResult.amount,
      amountInRupees: plan.price,
      currency: orderResult.currency,
      keyId: orderResult.keyId,
      isMock: orderResult.isMock,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifySubscriptionPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { planId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const plan = await SubscriptionPlan.findOne({ planId });
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      res.status(400).json({ success: false, message: 'Payment signature verification failed' });
      return;
    }

    const startDate = new Date();
    const expiresAt = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const subscription = await UserSubscription.create({
      userId: req.user.id,
      planId: plan.planId,
      startDate,
      expiresAt,
      status: 'active',
      amountPaid: plan.price,
      paymentOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

    await User.updateOne(
      { _id: req.user.id },
      {
        $set: {
          isSubscribed: true,
          subscriptionExpiresAt: expiresAt,
          subscriptionPlan: plan.planId,
        },
      }
    );

    res.json({
      success: true,
      message: `Congratulations! You are now a CineNova Plus member until ${expiresAt.toLocaleDateString()}.`,
      subscription,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMySubscriptionStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user.id).select(
      'isSubscribed subscriptionExpiresAt subscriptionPlan'
    );

    const activeSubscription = await UserSubscription.findOne({
      userId: req.user.id,
      status: 'active',
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      isSubscribed: user?.isSubscribed || false,
      subscriptionExpiresAt: user?.subscriptionExpiresAt,
      subscriptionPlan: user?.subscriptionPlan,
      subscription: activeSubscription,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
