import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, Filter, Search, RotateCcw } from 'lucide-react';
import { MovieCard } from '../components/MovieCard.js';
import { useCity } from '../context/CityContext.js';
import { api } from '../services/api.js';
import { Movie } from '../types/index.js';

export const Movies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity } = useCity();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentStatus = searchParams.get('status') || '';
  const currentGenre = searchParams.get('genre') || '';
  const currentLang = searchParams.get('language') || '';
  const currentFormat = searchParams.get('format') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || '';

  const genres = ['Action', 'Sci-Fi', 'Adventure', 'Drama', 'Comedy', 'Horror', 'Biography'];
  const languages = ['Hindi', 'English', 'Telugu', 'Tamil', 'Malayalam'];
  const formats = ['IMAX 2D', 'IMAX 3D', '4DX', '3D', '2D', 'Dolby Atmos'];

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'All') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const resetAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const query: Record<string, string> = {};
        if (currentStatus) query.status = currentStatus;
        if (currentGenre) query.genre = currentGenre;
        if (currentLang) query.language = currentLang;
        if (currentFormat) query.format = currentFormat;
        if (currentSearch) query.search = currentSearch;
        if (currentSort) query.sort = currentSort;
        query.city = selectedCity;

        const res = await api.movies.getAll(query);
        if (res.success) {
          setMovies(res.movies || []);
        }
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [searchParams, selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-black text-white">Movie Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore blockbusters playing in {selectedCity}
          </p>
        </div>

        {/* Status Toggle Buttons */}
        <div className="flex items-center gap-2 bg-cinema-850 p-1.5 rounded-full border border-white/10">
          <button
            onClick={() => updateParam('status', '')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              !currentStatus
                ? 'bg-brand-purple text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Movies
          </button>
          <button
            onClick={() => updateParam('status', 'now_showing')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentStatus === 'now_showing'
                ? 'bg-brand-purple text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => updateParam('status', 'coming_soon')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentStatus === 'coming_soon'
                ? 'bg-brand-purple text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search titles..."
            value={currentSearch}
            onChange={(e) => updateParam('search', e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-cinema-850 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
          />
        </div>

        {/* Genre Select */}
        <select
          value={currentGenre}
          onChange={(e) => updateParam('genre', e.target.value)}
          className="px-3 py-2 bg-cinema-850 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* Language Select */}
        <select
          value={currentLang}
          onChange={(e) => updateParam('language', e.target.value)}
          className="px-3 py-2 bg-cinema-850 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
        >
          <option value="">All Languages</option>
          {languages.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        {/* Format Select */}
        <select
          value={currentFormat}
          onChange={(e) => updateParam('format', e.target.value)}
          className="px-3 py-2 bg-cinema-850 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
        >
          <option value="">All Formats</option>
          {formats.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        {/* Reset Filter Button */}
        <button
          onClick={resetAllFilters}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-3xl bg-cinema-850 animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-cinema-850 rounded-3xl border border-white/5 space-y-3">
          <Film className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to explore other blockbusters.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 rounded-full bg-brand-purple text-xs font-semibold text-white hover:brightness-110 shadow-glow"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
