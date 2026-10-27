import { Router } from 'express';
import {
  getShowById,
  getShowSeats,
  holdSeats,
  releaseHold,
} from '../controllers/showController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/:id', getShowById);
router.get('/:id/seats', optionalAuth, getShowSeats);
router.post('/:id/hold-seats', requireAuth, bookingLimiter, holdSeats);
router.post('/:id/release-hold', requireAuth, releaseHold);

export default router;
