import { Router } from 'express';
import {
  getSubscriptionPlans,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getMySubscriptionStatus,
} from '../controllers/subscriptionController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/plans', getSubscriptionPlans);
router.post('/create-order', requireAuth, createSubscriptionOrder);
router.post('/verify', requireAuth, verifySubscriptionPayment);
router.get('/my-status', requireAuth, getMySubscriptionStatus);

export default router;
