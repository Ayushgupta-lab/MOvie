import { Response } from 'express';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { Booking } from '../models/Booking.js';
import { AuthRequest } from '../middleware/auth.js';

export const getMyTheatres = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const theatres = await Theatre.find({ ownerId: req.user.id });
    res.json({ success: true, count: theatres.length, theatres });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTheatre = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      name,
      chainName,
      city,
      locality,
      address,
      lat,
      lng,
      amenities,
      contactPhone,
      contactEmail,
    } = req.body;

    const theatre = await Theatre.create({
      name,
      chainName: chainName || 'Independent',
      city,
      locality,
      address,
      lat: lat || 19.076,
      lng: lng || 72.8777,
      amenities: amenities || ['Dolby Atmos', 'Recliner Seats', 'Food & Beverage'],
      ownerId: req.user.id,
      isApproved: false, // Requires admin verification
      verificationStatus: 'pending',
      contactPhone: contactPhone || '022-44556677',
      contactEmail: contactEmail || req.user.email,
    });

    res.status(201).json({
      success: true,
      message: 'Theatre profile submitted for admin verification',
      theatre,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createScreen = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { theatreId, name, screenType, rows = 8, cols = 12 } = req.body;

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      res.status(404).json({ success: false, message: 'Theatre not found' });
      return;
    }

    // Build standard seat layout with Recliner, Prime, Classic
    const rowLetters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.slice(0, rows).split('');
    const seats: any[] = [];

    const categories = [
      { name: 'Recliner', basePrice: 450, rows: [rowLetters[0]] },
      {
        name: 'Prime',
        basePrice: 280,
        rows: rowLetters.slice(1, Math.ceil(rows / 2)),
      },
      {
        name: 'Classic',
        basePrice: 180,
        rows: rowLetters.slice(Math.ceil(rows / 2)),
      },
    ];

    for (const r of rowLetters) {
      const cat = categories.find((c) => c.rows.includes(r))?.name || 'Classic';
      const basePrice = categories.find((c) => c.name === cat)?.basePrice || 180;

      for (let c = 1; c <= cols; c++) {
        seats.push({
          id: `${r}${c}`,
          row: r,
          number: c,
          category: cat,
          type: r === rowLetters[rowLetters.length - 1] && c === 1 ? 'wheelchair' : 'regular',
          price: basePrice,
        });
      }
    }

    const screen = await Screen.create({
      theatreId,
      name: name || `Audi 1 - ${screenType || 'Dolby Atmos'}`,
      screenType: screenType || 'Dolby Atmos',
      totalSeats: seats.length,
      seatLayout: {
        rows,
        cols,
        categories,
        seats,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Screen created successfully with default seat layout',
      screen,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createShow = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      movieId,
      theatreId,
      screenId,
      startTime,
      endTime,
      language,
      format,
      pricing,
    } = req.body;

    const screen = await Screen.findById(screenId);
    if (!screen) {
      res.status(404).json({ success: false, message: 'Screen not found' });
      return;
    }

    const startDate = new Date(startTime);
    const dateStr = startDate.toISOString().split('T')[0];

    const showPricing = pricing || [
      { category: 'Recliner', price: 450 },
      { category: 'Prime', price: 280 },
      { category: 'Classic', price: 180 },
    ];

    const show = await Show.create({
      movieId,
      theatreId,
      screenId,
      startTime: startDate,
      endTime: endTime ? new Date(endTime) : new Date(startDate.getTime() + 150 * 60000),
      dateStr,
      language: language || 'Hindi',
      format: format || screen.screenType,
      pricing: showPricing,
      status: 'scheduled',
      soldSeats: [],
      totalSeats: screen.totalSeats,
      availableSeatsCount: screen.totalSeats,
    });

    res.status(201).json({
      success: true,
      message: 'Show created and scheduled successfully',
      show,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTheatreBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { theatreId } = req.query;

    const filter: any = {};
    if (theatreId) {
      filter.theatreId = theatreId;
    }

    const bookings = await Booking.find(filter)
      .populate('movieId', 'title posterUrl')
      .populate('theatreId', 'name locality city')
      .populate('showId', 'startTime format language')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(50);

    const totalRevenue = bookings
      .filter((b) => b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + b.baseAmount, 0);

    res.json({
      success: true,
      count: bookings.length,
      totalRevenue,
      bookings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
