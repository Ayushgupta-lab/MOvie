import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Ticket, Star, ChevronLeft, ChevronRight, Clock, Shield } from 'lucide-react';
import { Movie } from '../types/index.js';
import { TrailerModal } from './TrailerModal.js';

interface HeroBannerProps {
  movies: Movie[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movies }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [movies.length]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  return (
    <>
      <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] overflow-hidden bg-cinema-950">
        {/* Backdrop Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
          style={{ backgroundImage: `url(${currentMovie.bannerUrl || currentMovie.posterUrl})` }}
        />

        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070A13] via-[#070A13]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] via-transparent to-black/40" />

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl space-y-5 animate-in fade-in duration-500">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-purple/40 text-purple-300 text-xs font-bold tracking-wider uppercase">
                Trending Blockbuster
              </span>

              {currentMovie.avgRating > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{currentMovie.avgRating} / 10</span>
                  <span className="text-slate-400 font-normal">({currentMovie.ratingCount})</span>
                </div>
              )}

              <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-300" />
                {currentMovie.durationMinutes}m
              </span>

              <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3 text-slate-300" />
                {currentMovie.certification}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
              {currentMovie.title}
            </h1>

            {/* Genres & Formats */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300 font-medium">
              <span>{currentMovie.genres.join(' • ')}</span>
              <span className="text-slate-500">•</span>
              <span>{currentMovie.languages.join(', ')}</span>
              <div className="flex gap-1.5 ml-2">
                {currentMovie.formats.map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-brand-cyan tracking-wider"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-xl">
              {currentMovie.synopsis}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate(`/movie/${currentMovie.slug || currentMovie._id}`)}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-brand-violet to-brand-purple hover:brightness-110 text-white font-bold text-sm shadow-glow transition-all"
              >
                <Ticket className="w-4 h-4" />
                <span>Book Tickets</span>
              </button>

              <button
                onClick={() => setIsTrailerOpen(true)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition-colors"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Trailer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        {movies.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white backdrop-blur-md transition-all hidden sm:flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white backdrop-blur-md transition-all hidden sm:flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Carousel Indicator Dots */}
        {movies.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {movies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-8 bg-brand-purple shadow-glow' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={currentMovie.trailerUrl}
        movieTitle={currentMovie.title}
      />
    </>
  );
};
