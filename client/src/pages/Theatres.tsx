import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, MapPin, Search, Phone, Mail, Navigation, Check } from 'lucide-react';
import { api } from '../services/api.js';
import { useCity } from '../context/CityContext.js';
import { Theatre } from '../types/index.js';

export const Theatres: React.FC = () => {
  const { selectedCity, setIsCityModalOpen } = useCity();
  const navigate = useNavigate();

  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const amenitiesList = [
    'All',
    'IMAX Laser',
    'Dolby Atmos',
    'Recliner Seats',
    '4DX Motion',
    'Wheelchair Accessible',
  ];

  useEffect(() => {
    const fetchTheatres = async () => {
      setIsLoading(true);
      try {
        const query: Record<string, string> = { city: selectedCity };
        if (search) query.search = search;
        if (selectedAmenity && selectedAmenity !== 'All') query.amenity = selectedAmenity;

        const res = await api.theatres.getAll(query);
        if (res.success && res.theatres) {
          setTheatres(res.theatres);
        }
      } catch (err) {
        console.error('Failed to load theatres:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheatres();
  }, [selectedCity, search, selectedAmenity]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Cinemas & Multiplexes in {selectedCity}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Discover premium sound formats, laser projection and luxury auditoriums
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

      {/* Search & Amenities Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search multiplex or area (e.g. Lower Parel, Saket)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-cinema-850 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
          />
        </div>

        {/* Amenity Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {amenitiesList.map((am) => (
            <button
              key={am}
              onClick={() => setSelectedAmenity(am)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedAmenity === am
                  ? 'bg-brand-cyan text-black font-bold shadow-glow-cyan'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {am}
            </button>
          ))}
        </div>
      </div>

      {/* Theatres Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading theatres in {selectedCity}...</p>
        </div>
      ) : theatres.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {theatres.map((th) => (
            <div
              key={th._id}
              className="p-6 rounded-3xl bg-cinema-850/80 border border-white/5 hover:border-brand-purple/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-purple">
                    {th.chainName}
                  </span>
                  <h3 className="text-lg font-black text-white">{th.name}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  Verified Partner
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{th.address}</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-400">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{th.contactPhone}</span>
                </p>
              </div>

              {/* Amenities */}
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1.5">
                  Key Amenities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {th.amenities.map((am) => (
                    <span
                      key={am}
                      className="px-2.5 py-1 rounded-xl bg-cinema-900 border border-white/5 text-[10px] text-slate-300 font-medium"
                    >
                      {am}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-between">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    th.name + ' ' + th.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-brand-cyan hover:underline"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Get Directions</span>
                </a>

                <button
                  onClick={() => navigate(`/movies?city=${selectedCity}`)}
                  className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
                >
                  View Movie Shows →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-cinema-850 rounded-3xl border border-white/5 space-y-2">
          <Building className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Theatres Listed in {selectedCity}</h3>
          <p className="text-xs text-slate-400">
            Please choose another metro like Mumbai, Delhi-NCR, Bengaluru or Hyderabad.
          </p>
        </div>
      )}
    </div>
  );
};
