import { Router } from 'express';
import {
  createTicket,
  getMyTickets,
  getTicketDetails,
  replyToTicket,
} from '../controllers/supportController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/tickets', optionalAuth, createTicket);
router.get('/my-tickets', requireAuth, getMyTickets);
router.get('/tickets/:ticketNumber', getTicketDetails);
router.post('/tickets/:ticketNumber/reply', optionalAuth, replyToTicket);

export default router;
