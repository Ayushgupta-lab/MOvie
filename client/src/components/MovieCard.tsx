import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, Sparkles } from 'lucide-react';
import { Movie } from '../types/index.js';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/movie/${movie.slug || movie._id}`)}
      className="group flex flex-col bg-cinema-850/80 hover:bg-cinema-800 border border-white/5 hover:border-brand-purple/40 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-purple/20"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-cinema-900">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 uppercase tracking-wider">
            {movie.certification}
          </span>

          {movie.avgRating > 0 ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30 text-xs font-bold shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{movie.avgRating}</span>
            </div>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-cyan/20 backdrop-blur-md text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
              <Sparkles className="w-3 h-3" /> Upcoming
            </span>
          )}
        </div>

        {/* Formats Pills on Bottom of Poster */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
          {movie.formats.slice(0, 3).map((f) => (
            <span
              key={f}
              className="px-2 py-0.5 rounded-md bg-cinema-950/85 backdrop-blur-md text-[10px] font-semibold text-slate-200 border border-white/10 uppercase"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-brand-purple transition-colors line-clamp-1">
            {movie.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{movie.genres.join(' • ')}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
          <span className="truncate max-w-[120px]">{movie.languages.join(', ')}</span>
          {movie.isComingSoon ? (
            <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
              <Calendar className="w-3 h-3" /> Releasing Soon
            </span>
          ) : (
            <span className="text-brand-purple font-semibold group-hover:underline">Book Now →</span>
          )}
        </div>
      </div>
    </div>
  );
};
