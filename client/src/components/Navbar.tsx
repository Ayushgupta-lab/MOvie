import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film,
  MapPin,
  Search,
  Sparkles,
  User as UserIcon,
  Ticket,
  ShieldCheck,
  Building,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Crown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCity } from '../context/CityContext.js';
import { api } from '../services/api.js';
import { Movie } from '../types/index.js';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isAdmin, isTheatreOwner, isSubscribed } = useAuth();
  const { selectedCity, setIsCityModalOpen } = useCity();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for movies
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.movies.getAll({ search: searchQuery.trim() });
        if (res.success && res.movies) {
          setSearchResults(res.movies.slice(0, 5));
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectMovie = (movie: Movie) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/movie/${movie.slug || movie._id}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#070A13]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-brand-cyan">
                  CineNova
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 font-medium uppercase -mt-1">
                  Cinematic Booking
                </span>
              </div>
            </Link>

            {/* City Selector Button */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-slate-200 transition-colors"
              title="Change your current city"
            >
              <MapPin className="w-4 h-4 text-brand-purple" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-md relative">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search movies, languages, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchDropdown(true)}
                className="w-full pl-10 pr-4 py-2 bg-cinema-900 border border-white/10 rounded-full text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* Search Autocomplete Dropdown */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-cinema-850 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {searchResults.map((m) => (
                      <div
                        key={m._id}
                        onClick={() => handleSelectMovie(m)}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{m.title}</h4>
                          <p className="text-xs text-slate-400 truncate">
                            {m.genres.join(', ')} • {m.languages.join(', ')}
                          </p>
                          <span className="text-[10px] text-brand-purple font-semibold">
                            ★ {m.avgRating} / 10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-400">
                    No movies found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/movies"
              className={`transition-colors hover:text-brand-purple ${
                location.pathname === '/movies' ? 'text-brand-purple' : 'text-slate-300'
              }`}
            >
              Movies
            </Link>
            <Link
              to="/theatres"
              className={`transition-colors hover:text-brand-purple ${
                location.pathname === '/theatres' ? 'text-brand-purple' : 'text-slate-300'
              }`}
            >
              Theatres
            </Link>
            <Link
              to="/offers"
              className={`transition-colors hover:text-brand-purple ${
                location.pathname === '/offers' ? 'text-brand-purple' : 'text-slate-300'
              }`}
            >
              Offers
            </Link>
            <Link
              to="/cinenova-plus"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-600/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 hover:border-amber-400 transition-all font-semibold text-xs shadow-glow-gold"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>CineNova Plus</span>
            </Link>
          </nav>

          {/* User Section & Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-violet flex items-center justify-center font-bold text-sm text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-white truncate max-w-[100px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                      🪙 {user.rewardPoints} pts
                      {isSubscribed && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-cinema-850 border border-white/10 rounded-2xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                      {isSubscribed && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                          <Crown className="w-3 h-3 text-amber-400" /> Plus Member
                        </span>
                      )}
                    </div>

                    <Link
                      to="/my-bookings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-brand-purple" />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      to="/cinenova-plus"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Membership Benefits</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-purple-300 hover:bg-white/5 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-brand-purple" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    {isTheatreOwner && (
                      <Link
                        to="/theatre-portal"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-cyan-300 hover:bg-white/5 transition-colors"
                      >
                        <Building className="w-4 h-4 text-brand-cyan" />
                        <span>Theatre Owner Portal</span>
                      </Link>
                    )}

                    <Link
                      to="/help"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Help & Support</span>
                    </Link>

                    <div className="border-t border-white/5 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-brand-violet to-brand-purple hover:brightness-110 text-white text-sm font-semibold shadow-glow transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 text-slate-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-cinema-900 border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => {
              setIsCityModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 text-sm font-medium text-slate-200"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-purple" />
              <span>City: {selectedCity}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          <Link
            to="/movies"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5"
          >
            Movies
          </Link>
          <Link
            to="/theatres"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5"
          >
            Theatres
          </Link>
          <Link
            to="/offers"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5"
          >
            Offers & Promo Codes
          </Link>
          <Link
            to="/cinenova-plus"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-amber-300 hover:bg-amber-500/10"
          >
            CineNova Plus Membership
          </Link>
          <Link
            to="/help"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5"
          >
            Help & FAQs
          </Link>
        </div>
      )}
    </header>
  );
};
