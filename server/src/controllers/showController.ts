import { Request, Response } from 'express';
import { Show } from '../models/Show.js';
import {
  getSeatAvailabilityForShow,
  createSeatHold,
  releaseSeatHold,
} from '../services/seatService.js';
import { AuthRequest } from '../middleware/auth.js';

export const getShowById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const show = await Show.findById(id)
      .populate('movieId')
      .populate('theatreId')
      .populate('screenId');

    if (!show) {
      res.status(404).json({ success: false, message: 'Show not found' });
      return;
    }

    res.json({ success: true, show });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getShowSeats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const data = await getSeatAvailabilityForShow(id, userId);
    res.json({ success: true, ...data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const holdSeats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { seatIds } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Please log in to reserve seats' });
      return;
    }

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      res.status(400).json({ success: false, message: 'seatIds array is required' });
      return;
    }

    const holdData = await createSeatHold(id, req.user.id, seatIds);

    res.json({
      success: true,
      message: `Held ${seatIds.length} seat(s) successfully for ${holdData.holdMinutes} minutes`,
      ...holdData,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const releaseHold = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { holdToken } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!holdToken) {
      res.status(400).json({ success: false, message: 'holdToken is required' });
      return;
    }

    await releaseSeatHold(holdToken, req.user.id);
    res.json({ success: true, message: 'Seat hold released successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
