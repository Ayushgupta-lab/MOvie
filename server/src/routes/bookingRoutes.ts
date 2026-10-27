import { Router } from 'express';
import {
  calculatePrice,
  createOrder,
  verifyPayment,
  handlePaymentWebhook,
  getMyBookings,
  getBookingByReference,
  cancelBooking,
  validateTicketQR,
} from '../controllers/bookingController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/calculate-price', optionalAuth, calculatePrice);
router.post('/create-order', requireAuth, bookingLimiter, createOrder);
router.post('/verify-payment', requireAuth, verifyPayment);
router.post('/webhook', handlePaymentWebhook);
router.get('/my-bookings', requireAuth, getMyBookings);
router.get('/validate-ticket/:token', validateTicketQR);
router.get('/:reference', optionalAuth, getBookingByReference);
router.post('/:reference/cancel', requireAuth, cancelBooking);

export default router;
