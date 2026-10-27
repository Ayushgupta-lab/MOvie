import { Router } from 'express';
import {
  getMovies,
  getMovieDetails,
  getMovieShowtimes,
  getFeaturedHeroBanners,
} from '../controllers/movieController.js';

const router = Router();

router.get('/', getMovies);
router.get('/featured/banners', getFeaturedHeroBanners);
router.get('/:idOrSlug', getMovieDetails);
router.get('/:id/showtimes', getMovieShowtimes);

export default router;
