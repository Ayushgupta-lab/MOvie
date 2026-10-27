import { Response } from 'express';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Coupon } from '../models/Coupon.js';
import { AuditLog } from '../models/AuditLog.js';
import { UserSubscription } from '../models/Subscription.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDashboardOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTheatres = await Theatre.countDocuments({ isApproved: true });
    const pendingTheatres = await Theatre.countDocuments({ verificationStatus: 'pending' });
    const totalMovies = await Movie.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'CONFIRMED' });
    const activeSubscriptions = await UserSubscription.countDocuments({ status: 'active' });

    // Revenue aggregation
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'CONFIRMED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, ticketRevenue: { $sum: '$baseAmount' } } },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const ticketRevenue = revenueAgg[0]?.ticketRevenue || 0;

    // Recent 10 bookings
    const recentBookings = await Booking.find()
      .populate('movieId', 'title posterUrl')
      .populate('theatreId', 'name city')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTheatres,
        pendingTheatres,
        totalMovies,
        totalBookings,
        confirmedBookings,
        activeSubscriptions,
        totalRevenue,
        ticketRevenue,
      },
      recentBookings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const movieData = req.body;
    if (!movieData.title || !movieData.synopsis) {
      res.status(400).json({ success: false, message: 'Movie title and synopsis are required' });
      return;
    }

    if (!movieData.slug) {
      movieData.slug = movieData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    const movie = await Movie.create(movieData);

    await AuditLog.create({
      action: 'MOVIE_CREATED',
      performedBy: req.user?.email || 'admin',
      role: req.user?.role || 'admin',
      targetResource: 'Movie',
      targetId: movie._id.toString(),
      details: { title: movie.title },
    });

    res.status(201).json({ success: true, message: 'Movie created successfully', movie });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    if (!movie) {
      res.status(404).json({ success: false, message: 'Movie not found' });
      return;
    }

    await AuditLog.create({
      action: 'MOVIE_UPDATED',
      performedBy: req.user?.email || 'admin',
      role: req.user?.role || 'admin',
      targetResource: 'Movie',
      targetId: id,
      details: req.body,
    });

    res.json({ success: true, message: 'Movie updated', movie });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyTheatre = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
      return;
    }

    const isApproved = status === 'approved';
    const theatre = await Theatre.findByIdAndUpdate(
      id,
      {
        $set: {
          verificationStatus: status,
          isApproved,
        },
      },
      { new: true }
    );

    if (!theatre) {
      res.status(404).json({ success: false, message: 'Theatre not found' });
      return;
    }

    await AuditLog.create({
      action: isApproved ? 'THEATRE_APPROVED' : 'THEATRE_REJECTED',
      performedBy: req.user?.email || 'admin',
      role: req.user?.role || 'admin',
      targetResource: 'Theatre',
      targetId: id,
      details: { theatreName: theatre.name, status },
    });

    res.json({ success: true, message: `Theatre ${status} successfully`, theatre });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const couponData = req.body;
    couponData.code = couponData.code.trim().toUpperCase();

    const coupon = await Coupon.create(couponData);

    await AuditLog.create({
      action: 'COUPON_CREATED',
      performedBy: req.user?.email || 'admin',
      role: req.user?.role || 'admin',
      targetResource: 'Coupon',
      targetId: coupon._id.toString(),
      details: { code: coupon.code, discountValue: coupon.discountValue },
    });

    res.status(201).json({ success: true, message: 'Coupon campaign created', coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsersList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['customer', 'theatre_owner', 'admin', 'support'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role specified' });
      return;
    }

    const user = await User.findByIdAndUpdate(id, { $set: { role } }, { new: true }).select(
      '-password'
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    await AuditLog.create({
      action: 'USER_ROLE_UPDATED',
      performedBy: req.user?.email || 'admin',
      role: req.user?.role || 'admin',
      targetResource: 'User',
      targetId: id,
      details: { email: user.email, newRole: role },
    });

    res.json({ success: true, message: `User role updated to ${role}`, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
