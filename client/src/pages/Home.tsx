import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame,
  Film,
  Calendar,
  Sparkles,
  ArrowRight,
  Crown,
  Building,
  Tag,
  Star,
  MapPin,
} from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner.js';
import { MovieCard } from '../components/MovieCard.js';
import { OfferCard } from '../components/OfferCard.js';
import { useCity } from '../context/CityContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Movie, Theatre, Coupon } from '../types/index.js';

export const Home: React.FC = () => {
  const { selectedCity, setIsCityModalOpen } = useCity();
  const { user, isSubscribed } = useAuth();
  const navigate = useNavigate();

  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [nowShowing, setNowShowing] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const genres = ['All', 'Action', 'Sci-Fi', 'Comedy', 'Drama', 'Adventure', 'Horror'];
  const languages = ['All', 'Hindi', 'English', 'Telugu', 'Tamil'];

  useEffect(() => {
    const loadHomeData = async () => {
      setIsLoading(true);
      try {
        const [trendingRes, nowRes, comingRes, theatresRes, couponsRes] = await Promise.all([
          api.movies.getAll({ status: 'trending' }),
          api.movies.getAll({ status: 'now_showing', city: selectedCity }),
          api.movies.getAll({ status: 'coming_soon' }),
          api.theatres.getAll({ city: selectedCity }),
          api.coupons.getActive(),
        ]);

        if (trendingRes.success) setTrendingMovies(trendingRes.movies || []);
        if (nowRes.success) setNowShowing(nowRes.movies || []);
        if (comingRes.success) setComingSoon(comingRes.movies || []);
        if (theatresRes.success) setTheatres(theatresRes.theatres || []);
        if (couponsRes.success) setCoupons(couponsRes.coupons || []);
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, [selectedCity]);

  // Filter now showing movies by genre and language
  const filteredNowShowing = nowShowing.filter((m) => {
    const matchesGenre = selectedGenre === 'All' || m.genres.includes(selectedGenre);
    const matchesLang = selectedLanguage === 'All' || m.languages.includes(selectedLanguage);
    return matchesGenre && matchesLang;
  });

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Banner Carousel */}
      <HeroBanner movies={trendingMovies} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 2. City & Quick Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-cinema-850/80 border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-purple" />
            <span className="text-xs text-slate-400">Current City:</span>
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="text-sm font-bold text-white hover:text-brand-purple transition-colors underline underline-offset-4 decoration-brand-purple"
            >
              {selectedCity}
            </button>
          </div>

          {/* Genre Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedGenre === g
                    ? 'bg-brand-purple text-white shadow-glow'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Now Showing in Selected City */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Now Showing</h2>
                <p className="text-xs text-slate-400">
                  Live shows & available seats in {selectedCity}
                </p>
              </div>
            </div>

            <Link
              to={`/movies?city=${selectedCity}`}
              className="flex items-center gap-1 text-xs font-bold text-brand-purple hover:underline"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {filteredNowShowing.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredNowShowing.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-cinema-850/50 rounded-3xl border border-white/5 space-y-3">
              <p className="text-sm text-slate-400">
                No scheduled shows currently match your selected filters in {selectedCity}.
              </p>
              <button
                onClick={() => {
                  setSelectedGenre('All');
                  setSelectedLanguage('All');
                }}
                className="px-4 py-2 rounded-full bg-white/10 text-xs font-semibold text-white hover:bg-white/20"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* 4. CineNova Plus Membership Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-cinema-900 to-indigo-950 border border-amber-500/30 p-8 sm:p-10 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                CineNova Plus Membership
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Zero Convenience Fees & 15% Off Every Movie
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Unlock 24-hr advance booking for blockbusters, 100% convenience fee waiver, free
                popcorn combos, and birthday ticket vouchers.
              </p>
            </div>

            <button
              onClick={() => navigate('/cinenova-plus')}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-sm shadow-glow-gold hover:scale-105 transition-all shrink-0"
            >
              {isSubscribed ? 'View Your VIP Benefits' : 'Join Plus from ₹199/mo →'}
            </button>
          </div>
        </section>

        {/* 5. Trending Blockbusters */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Trending Blockbusters</h2>
                <p className="text-xs text-slate-400">Most booked films this week across India</p>
              </div>
            </div>

            <Link
              to="/movies?status=trending"
              className="flex items-center gap-1 text-xs font-bold text-brand-purple hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingMovies.slice(0, 4).map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>

        {/* 6. Promotional Offers & Coupons */}
        {coupons.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Exclusive Offers & Discounts
                  </h2>
                  <p className="text-xs text-slate-400">
                    Apply promo codes during checkout for instant savings
                  </p>
                </div>
              </div>

              <Link
                to="/offers"
                className="flex items-center gap-1 text-xs font-bold text-brand-purple hover:underline"
              >
                <span>All Offers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.slice(0, 3).map((coupon) => (
                <OfferCard key={coupon._id} coupon={coupon} />
              ))}
            </div>
          </section>
        )}

        {/* 7. Popular Multiplexes in Selected City */}
        {theatres.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Popular Multiplexes in {selectedCity}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Premium cinema halls featuring IMAX Laser, 4DX & Dolby Atmos
                  </p>
                </div>
              </div>

              <Link
                to={`/theatres?city=${selectedCity}`}
                className="flex items-center gap-1 text-xs font-bold text-brand-purple hover:underline"
              >
                <span>View Theatres</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {theatres.map((th) => (
                <div
                  key={th._id}
                  onClick={() => navigate(`/theatres`)}
                  className="p-5 rounded-3xl bg-cinema-850/80 border border-white/5 hover:border-brand-cyan/40 transition-all hover:-translate-y-1 cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-bold text-white leading-snug">{th.name}</h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-cyan-300 uppercase shrink-0">
                      {th.chainName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{th.address}</p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {th.amenities.slice(0, 3).map((am) => (
                      <span
                        key={am}
                        className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300 font-medium"
                      >
                        {am}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Coming Soon / Releasing Soon */}
        {comingSoon.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Coming Soon</h2>
                  <p className="text-xs text-slate-400">Watch trailers and advance ticket booking</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {comingSoon.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
