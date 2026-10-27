import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  Shield,
  Play,
  Calendar,
  MapPin,
  Share2,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useCity } from '../context/CityContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useBooking } from '../context/BookingContext.js';
import { TrailerModal } from '../components/TrailerModal.js';
import { Movie, Show, Review } from '../types/index.js';

export const MovieDetails: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const { selectedCity, setIsCityModalOpen } = useCity();
  const { isAuthenticated, user } = useAuth();
  const { setMovie, setShow } = useBooking();
  const navigate = useNavigate();

  const [movie, setMovieState] = useState<Movie | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [theatreShowtimes, setTheatreShowtimes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  // Review Form State
  const [userRating, setUserRating] = useState<number>(9);
  const [userComment, setUserComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string>('');

  // Generate next 5 dates for the date picker tab
  const dateTabs = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    return { dateStr, dayName, dayNumber, monthName };
  });

  // Fetch movie details
  useEffect(() => {
    if (!idOrSlug) return;
    const fetchMovie = async () => {
      setIsLoading(true);
      try {
        const res = await api.movies.getDetails(idOrSlug);
        if (res.success && res.movie) {
          setMovieState(res.movie);
          setMovie(res.movie);
        }
      } catch (err) {
        console.error('Error fetching movie:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [idOrSlug]);

  // Fetch showtimes for movie + city + date
  useEffect(() => {
    if (!movie) return;
    const fetchShowtimes = async () => {
      try {
        const res = await api.movies.getShowtimes(movie._id, selectedCity, selectedDate);
        if (res.success && res.theatres) {
          setTheatreShowtimes(res.theatres);
        } else {
          setTheatreShowtimes([]);
        }
      } catch (err) {
        console.error('Error fetching showtimes:', err);
      }
    };
    fetchShowtimes();
  }, [movie, selectedCity, selectedDate]);

  // Fetch reviews
  useEffect(() => {
    if (!movie) return;
    const fetchReviews = async () => {
      try {
        const res = await api.reviews.getByMovie(movie._id);
        if (res.success && res.reviews) {
          setReviews(res.reviews);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    fetchReviews();
  }, [movie]);

  const handleSelectShow = (showItem: Show) => {
    setShow(showItem);
    navigate(`/seat-selection/${showItem._id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title,
        text: `Book tickets for ${movie?.title} on CineNova!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Movie link copied to clipboard!');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movie) return;
    setIsSubmittingReview(true);
    setReviewError('');

    try {
      const res = await api.reviews.create({
        movieId: movie._id,
        rating: userRating,
        comment: userComment,
      });

      if (res.success && res.review) {
        setReviews([res.review, ...reviews]);
        setIsReviewModalOpen(false);
        setUserComment('');
      }
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading || !movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading cinematic details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* 1. Backdrop Hero Section */}
      <div className="relative min-h-[480px] bg-cinema-950 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm scale-105"
          style={{ backgroundImage: `url(${movie.bannerUrl || movie.posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] via-[#070A13]/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 flex flex-col md:flex-row gap-8 items-start">
          {/* Poster */}
          <div className="w-48 sm:w-64 aspect-[2/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shrink-0 mx-auto md:mx-0">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/10">
                {movie.certification}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {movie.durationMinutes} mins
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300">
                Released {new Date(movie.releaseDate).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {movie.title}
            </h1>

            {/* Rating Box & Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {movie.avgRating > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{movie.avgRating} / 10</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({movie.ratingCount} reviews)
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                {movie.formats.map((f) => (
                  <span
                    key={f}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-brand-cyan"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages & Genres */}
            <div className="text-xs sm:text-sm text-slate-300 font-medium space-y-1">
              <p>Languages: {movie.languages.join(', ')}</p>
              <p>Genres: {movie.genres.join(', ')}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
              <button
                onClick={() => setIsTrailerOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs backdrop-blur-md transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Trailer</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                title="Share this movie"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* 2. Showtimes & Date Picker */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-black text-white">Book Tickets in {selectedCity}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select your preferred date, auditorium and showtime
              </p>
            </div>

            <button
              onClick={() => setIsCityModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-brand-purple hover:underline"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Change City ({selectedCity})</span>
            </button>
          </div>

          {/* Date Picker Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {dateTabs.map((tab) => {
              const isSelected = selectedDate === tab.dateStr;
              return (
                <button
                  key={tab.dateStr}
                  onClick={() => setSelectedDate(tab.dateStr)}
                  className={`flex flex-col items-center justify-center min-w-[76px] py-2.5 px-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-brand-purple border-brand-purple text-white shadow-glow'
                      : 'bg-cinema-850 border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase">{tab.dayName}</span>
                  <span className="text-lg font-black my-0.5">{tab.dayNumber}</span>
                  <span className="text-[10px] font-medium">{tab.monthName}</span>
                </button>
              );
            })}
          </div>

          {/* Theatres & Shows List */}
          {theatreShowtimes.length > 0 ? (
            <div className="space-y-6">
              {theatreShowtimes.map((item) => (
                <div
                  key={item.theatre._id}
                  className="p-6 rounded-3xl bg-cinema-850/70 border border-white/5 space-y-4 hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {item.theatre.name}
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-semibold text-cyan-300">
                          {item.theatre.chainName}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.theatre.address}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span>Cancellations Allowed (2h prior)</span>
                    </div>
                  </div>

                  {/* Showtime Pills */}
                  <div className="flex flex-wrap items-center gap-3">
                    {item.shows.map((showItem: Show) => {
                      const startTime = new Date(showItem.startTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      });

                      const screenName =
                        typeof showItem.screenId === 'object'
                          ? showItem.screenId.name
                          : 'Standard Screen';

                      return (
                        <button
                          key={showItem._id}
                          onClick={() => handleSelectShow(showItem)}
                          className="group flex flex-col items-center p-3 rounded-2xl bg-cinema-900 border border-white/10 hover:border-brand-purple hover:bg-brand-purple/10 transition-all text-center min-w-[110px]"
                        >
                          <span className="text-sm font-black text-white group-hover:text-brand-purple">
                            {startTime}
                          </span>
                          <span className="text-[10px] font-bold text-brand-cyan uppercase mt-0.5">
                            {showItem.format}
                          </span>
                          <span className="text-[9px] text-slate-400 truncate max-w-[100px] mt-0.5">
                            {screenName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-cinema-850 rounded-3xl border border-white/5 space-y-2">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-white">
                No shows scheduled on {selectedDate} in {selectedCity}
              </p>
              <p className="text-xs text-slate-400">
                Please pick another date or switch to a different metro city.
              </p>
            </div>
          )}
        </section>

        {/* 3. About Movie & Synopsis */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">About the Movie</h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">{movie.synopsis}</p>
        </section>

        {/* 4. Cast and Crew */}
        {movie.cast && movie.cast.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">Top Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {movie.cast.map((actor) => (
                <div key={actor.name} className="flex flex-col items-center text-center space-y-2">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-cinema-850 border border-white/10">
                    <img
                      src={actor.photo}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{actor.name}</h4>
                    <p className="text-[11px] text-slate-400">{actor.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. User Reviews & Verified Bookings */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">User Reviews & Ratings</h2>
              <p className="text-xs text-slate-400">Honest feedback from verified ticket buyers</p>
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                } else {
                  setIsReviewModalOpen(true);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/40 text-purple-200 text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-5 rounded-3xl bg-cinema-850/60 border border-white/5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cinema-700 flex items-center justify-center text-xs font-bold text-white">
                        {rev.userName.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{rev.userName}</span>
                        {rev.isVerifiedBooking && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Verified Ticket Booking
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{rev.rating} / 10</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-cinema-850 rounded-2xl border border-white/5 text-xs text-slate-400">
              No reviews posted yet. Be the first to review after watching!
            </div>
          )}
        </section>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-cinema-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Review {movie.title}</h3>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Rating: {userRating} / 10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={userRating}
                  onChange={(e) => setUserRating(Number(e.target.value))}
                  className="w-full accent-brand-purple"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Your Review Comments
                </label>
                <textarea
                  required
                  rows={4}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Tell others about the performances, sound design, visual effects..."
                  className="w-full p-3 bg-cinema-850 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
                />
              </div>

              {reviewError && (
                <p className="text-xs text-rose-400 font-medium">{reviewError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 rounded-full bg-brand-purple hover:brightness-110 text-white text-xs font-bold shadow-glow"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
