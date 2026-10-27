import { Router } from 'express';
import { getTheatres, getTheatreDetails } from '../controllers/theatreController.js';

const router = Router();

router.get('/', getTheatres);
router.get('/:id', getTheatreDetails);

export default router;
