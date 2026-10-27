import { Request, Response } from 'express';
import { City } from '../models/City.js';

export const getAllCities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    const filter: any = { isActive: true };

    if (search && typeof search === 'string') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    const cities = await City.find(filter).sort({ isPopular: -1, name: 1 });
    res.json({ success: true, cities });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
