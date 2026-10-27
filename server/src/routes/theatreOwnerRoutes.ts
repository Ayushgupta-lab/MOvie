import { Router } from 'express';
import {
  getMyTheatres,
  createTheatre,
  createScreen,
  createShow,
  getTheatreBookings,
} from '../controllers/theatreOwnerController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('theatre_owner', 'admin'));

router.get('/theatres', getMyTheatres);
router.post('/theatres', createTheatre);
router.post('/screens', createScreen);
router.post('/shows', createShow);
router.get('/bookings', getTheatreBookings);

export default router;
