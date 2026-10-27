import { Request, Response } from 'express';
import { Theatre } from '../models/Theatre.js';
import { Show } from '../models/Show.js';
import { Screen } from '../models/Screen.js';

export const getTheatres = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, amenity, search } = req.query;
    const filter: any = { isApproved: true };

    if (city && typeof city === 'string' && city !== 'All') {
      filter.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
    }

    if (amenity && typeof amenity === 'string') {
      filter.amenities = amenity;
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { locality: { $regex: search.trim(), $options: 'i' } },
        { chainName: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const theatres = await Theatre.find(filter).sort({ name: 1 });
    res.json({ success: true, count: theatres.length, theatres });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTheatreDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const theatre = await Theatre.findById(id);

    if (!theatre) {
      res.status(404).json({ success: false, message: 'Theatre not found' });
      return;
    }

    const screens = await Screen.find({ theatreId: theatre._id }).select('-seatLayout.seats');

    const todayStr = new Date().toISOString().split('T')[0];
    const todayShows = await Show.find({
      theatreId: theatre._id,
      dateStr: todayStr,
      status: 'scheduled',
    })
      .populate('movieId', 'title posterUrl durationMinutes certification languages')
      .populate('screenId', 'name screenType')
      .sort({ startTime: 1 });

    res.json({
      success: true,
      theatre,
      screens,
      todayShows,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
