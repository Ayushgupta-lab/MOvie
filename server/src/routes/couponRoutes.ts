import { Router } from 'express';
import { getActiveCoupons, validateCoupon } from '../controllers/couponController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getActiveCoupons);
router.post('/validate', optionalAuth, validateCoupon);

export default router;
