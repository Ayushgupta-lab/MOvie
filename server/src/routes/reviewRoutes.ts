import { Router } from 'express';
import { getMovieReviews, createReview, markHelpful } from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/movie/:movieId', getMovieReviews);
router.post('/', requireAuth, createReview);
router.post('/:id/helpful', markHelpful);

export default router;
