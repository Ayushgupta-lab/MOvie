import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Movie } from '../models/Movie.js';
import { Show } from '../models/Show.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';

export const getMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, language, genre, format, search, city, sort } = req.query;
    const filter: any = {};

    if (status === 'now_showing') {
      filter.isNowShowing = true;
    } else if (status === 'coming_soon') {
      filter.isComingSoon = true;
    } else if (status === 'trending') {
      filter.isTrending = true;
    }

    if (language && typeof language === 'string') {
      filter.languages = language;
    }

    if (genre && typeof genre === 'string') {
      filter.genres = genre;
    }

    if (format && typeof format === 'string') {
      filter.formats = format;
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { synopsis: { $regex: search.trim(), $options: 'i' } },
        { 'cast.name': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // If city is specified, find movies that have scheduled shows in theatres of that city
    if (city && typeof city === 'string' && city !== 'All') {
      const theatresInCity = await Theatre.find({
        city: { $regex: new RegExp(`^${city.trim()}$`, 'i') },
        isApproved: true,
      }).select('_id');

      const theatreIds = theatresInCity.map((t) => t._id);
      const activeShows = await Show.find({
        theatreId: { $in: theatreIds },
        status: 'scheduled',
        startTime: { $gte: new Date(Date.now() - 3 * 3600 * 1000) }, // shows within next few hours/days
      }).distinct('movieId');

      // Intersect with active movies or coming soon
      if (activeShows.length > 0 && status !== 'coming_soon') {
        filter._id = { $in: activeShows };
      }
    }

    let sortOption: any = { isTrending: -1, releaseDate: -1 };
    if (sort === 'rating') {
      sortOption = { avgRating: -1, ratingCount: -1 };
    } else if (sort === 'releaseDate') {
      sortOption = { releaseDate: -1 };
    }

    const movies = await Movie.find(filter).sort(sortOption);
    res.json({ success: true, count: movies.length, movies });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMovieDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const movie = isObjectId
      ? await Movie.findById(idOrSlug)
      : await Movie.findOne({ slug: idOrSlug.toLowerCase() });

    if (!movie) {
      res.status(404).json({ success: false, message: 'Movie not found' });
      return;
    }

    res.json({ success: true, movie });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMovieShowtimes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { city, date } = req.query;

    const movie = await Movie.findById(id);
    if (!movie) {
      res.status(404).json({ success: false, message: 'Movie not found' });
      return;
    }

    const targetDateStr =
      typeof date === 'string' && date ? date : new Date().toISOString().split('T')[0];

    // Find theatres in city
    const theatreFilter: any = { isApproved: true };
    if (city && typeof city === 'string' && city !== 'All') {
      theatreFilter.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
    }

    const theatres = await Theatre.find(theatreFilter);
    const theatreIds = theatres.map((t) => t._id);

    // Find shows for this movie in matching theatres for target date
    const shows = await Show.find({
      movieId: movie._id,
      theatreId: { $in: theatreIds },
      dateStr: targetDateStr,
      status: 'scheduled',
    })
      .populate('screenId', 'name screenType totalSeats')
      .sort({ startTime: 1 });

    // Group shows by Theatre
    const theatreMap = new Map<string, any>();
    theatres.forEach((th) => {
      theatreMap.set(th._id.toString(), {
        theatre: th,
        screens: [],
        shows: [],
      });
    });

    for (const show of shows) {
      const thId = show.theatreId.toString();
      if (theatreMap.has(thId)) {
        theatreMap.get(thId).shows.push(show);
      }
    }

    // Only include theatres that have at least 1 show
    const results = Array.from(theatreMap.values()).filter((item) => item.shows.length > 0);

    res.json({
      success: true,
      date: targetDateStr,
      theatresCount: results.length,
      theatres: results,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeaturedHeroBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const featured = await Movie.find({ isTrending: true })
      .sort({ avgRating: -1 })
      .limit(5);

    res.json({ success: true, banners: featured });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
