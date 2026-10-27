import { Request, Response } from 'express';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { Movie } from '../models/Movie.js';
import { AuthRequest } from '../middleware/auth.js';

export const getMovieReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ movieId, isApproved: true }).sort({
      isVerifiedBooking: -1,
      createdAt: -1,
    });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { movieId, rating, comment } = req.body;

    if (!movieId || !rating || !comment) {
      res.status(400).json({ success: false, message: 'movieId, rating, and comment are required' });
      return;
    }

    if (rating < 1 || rating > 10) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 10' });
      return;
    }

    // Check duplicate
    const existing = await Review.findOne({ movieId, userId: req.user.id });
    if (existing) {
      res.status(400).json({ success: false, message: 'You have already reviewed this movie' });
      return;
    }

    // Check if user has an authorized, confirmed booking for this movie
    const verifiedBooking = await Booking.findOne({
      movieId,
      userId: req.user.id,
      status: 'CONFIRMED',
    });

    const isVerifiedBooking = Boolean(verifiedBooking);

    const review = await Review.create({
      movieId,
      userId: req.user.id,
      userName: req.user.name || 'CineNova User',
      rating,
      comment: comment.trim(),
      isVerifiedBooking,
    });

    // Update movie average rating
    const allReviews = await Review.find({ movieId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / allReviews.length).toFixed(1));

    await Movie.updateOne(
      { _id: movieId },
      { $set: { avgRating, ratingCount: allReviews.length } }
    );

    res.status(201).json({
      success: true,
      message: 'Review posted successfully!',
      review,
      avgRating,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markHelpful = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    res.json({ success: true, helpfulCount: review.helpfulCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
