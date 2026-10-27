import { Router } from 'express';
import {
  getDashboardOverview,
  addMovie,
  updateMovie,
  verifyTheatre,
  addCoupon,
  getAuditLogs,
  getUsersList,
  updateUserRole,
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// Protect all admin routes
router.use(requireAuth);
router.use(requireRole('admin', 'support'));

router.get('/overview', getDashboardOverview);
router.post('/movies', requireRole('admin'), addMovie);
router.put('/movies/:id', requireRole('admin'), updateMovie);
router.patch('/theatres/:id/verify', requireRole('admin'), verifyTheatre);
router.post('/coupons', requireRole('admin'), addCoupon);
router.get('/audit-logs', requireRole('admin'), getAuditLogs);
router.get('/users', requireRole('admin'), getUsersList);
router.patch('/users/:id/role', requireRole('admin'), updateUserRole);

export default router;
