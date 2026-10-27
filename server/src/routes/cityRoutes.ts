import { Router } from 'express';
import { getAllCities } from '../controllers/cityController.js';

const router = Router();
router.get('/', getAllCities);

export default router;
