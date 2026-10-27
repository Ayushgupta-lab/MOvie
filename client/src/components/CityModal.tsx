import React, { useState } from 'react';
import { X, Search, Navigation, Check } from 'lucide-react';
import { useCity } from '../context/CityContext.js';

export const CityModal: React.FC = () => {
  const {
    selectedCity,
    setSelectedCity,
    cities,
    isCityModalOpen,
    setIsCityModalOpen,
    detectLocation,
    isDetectingLocation,
  } = useCity();

  const [search, setSearch] = useState('');

  if (!isCityModalOpen) return null;

  const popularCities = cities.filter((c) => c.isPopular);
  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-cinema-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white">Select Your City</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Discover theatres, formats, and showtimes near you
            </p>
          </div>
          <button
            onClick={() => setIsCityModalOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & GPS Location Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search for your city (e.g. Mumbai, Delhi, Bengaluru)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-cinema-850 border border-white/10 rounded-2xl text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-purple"
            />
          </div>
          <button
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-purple/20 hover:bg-brand-purple/30 text-purple-300 border border-brand-purple/30 text-sm font-semibold transition-all"
          >
            <Navigation className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span>{isDetectingLocation ? 'Locating...' : 'Detect GPS'}</span>
          </button>
        </div>

        {/* Popular Metros */}
        <div className="mt-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Popular Metros
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
            {popularCities.map((c) => {
              const isSelected = selectedCity.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c._id}
                  onClick={() => setSelectedCity(c.name)}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-brand-purple/20 border-brand-purple text-purple-200 shadow-glow'
                      : 'bg-cinema-850 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <span>{c.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-brand-purple" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* All / Search Filtered Cities */}
        <div className="mt-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {search ? 'Search Results' : 'Other Cities'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 max-h-48 overflow-y-auto pr-1">
            {filteredCities.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedCity(c.name)}
                className={`text-left px-3 py-2 rounded-xl text-xs transition-colors truncate ${
                  selectedCity.toLowerCase() === c.name.toLowerCase()
                    ? 'text-brand-purple font-bold bg-brand-purple/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {c.name}, {c.state}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
