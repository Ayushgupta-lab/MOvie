import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, Calendar, Armchair, DollarSign, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const TheatreOwnerPortal: React.FC = () => {
  const { user, isTheatreOwner } = useAuth();
  const navigate = useNavigate();

  const [theatres, setTheatres] = useState<any[]>([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState<string>('');
  const [movies, setMovies] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // New Screen Form State
  const [screenName, setScreenName] = useState('Audi 1 - Dolby Atmos');
  const [screenType, setScreenType] = useState('Dolby Atmos');
  const [screenRows, setScreenRows] = useState(8);
  const [screenCols, setScreenCols] = useState(12);
  const [isCreatingScreen, setIsCreatingScreen] = useState(false);
  const [screenMsg, setScreenMsg] = useState('');

  // New Show Form State
  const [showMovieId, setShowMovieId] = useState('');
  const [showScreenId, setShowScreenId] = useState('');
  const [showDate, setShowDate] = useState(new Date().toISOString().split('T')[0]);
  const [showTime, setShowTime] = useState('18:00');
  const [showFormat, setShowFormat] = useState('IMAX 2D');
  const [reclinerPrice, setReclinerPrice] = useState(480);
  const [primePrice, setPrimePrice] = useState(290);
  const [classicPrice, setClassicPrice] = useState(190);
  const [isCreatingShow, setIsCreatingShow] = useState(false);
  const [showMsg, setShowMsg] = useState('');

  useEffect(() => {
    if (!isTheatreOwner) {
      alert('Access restricted to verified Theatre Owners & Managers.');
      navigate('/');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [thRes, movRes, bookRes] = await Promise.all([
          api.theatreOwner.getMyTheatres(),
          api.movies.getAll(),
          api.theatreOwner.getBookings(),
        ]);

        if (thRes.success && thRes.theatres) {
          setTheatres(thRes.theatres);
          if (thRes.theatres.length > 0) {
            setSelectedTheatreId(thRes.theatres[0]._id);
          }
        }
        if (movRes.success) setMovies(movRes.movies || []);
        if (bookRes.success) {
          setBookings(bookRes.bookings || []);
          setRevenue(bookRes.totalRevenue || 0);
        }
      } catch (err) {
        console.error('Failed to load portal data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isTheatreOwner]);

  const handleCreateScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTheatreId) return;

    setIsCreatingScreen(true);
    setScreenMsg('');
    try {
      const res = await api.theatreOwner.createScreen({
        theatreId: selectedTheatreId,
        name: screenName,
        screenType,
        rows: Number(screenRows),
        cols: Number(screenCols),
      });

      if (res.success) {
        setScreenMsg(`Auditorium "${res.screen.name}" (${res.screen.totalSeats} seats) created!`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create screen');
    } finally {
      setIsCreatingScreen(false);
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTheatreId || !showMovieId) return;

    setIsCreatingShow(true);
    setShowMsg('');

    try {
      const startDateTime = new Date(`${showDate}T${showTime}:00`);

      const res = await api.theatreOwner.createShow({
        movieId: showMovieId,
        theatreId: selectedTheatreId,
        screenId: showScreenId || undefined,
        startTime: startDateTime,
        format: showFormat,
        pricing: [
          { category: 'Recliner', price: Number(reclinerPrice) },
          { category: 'Prime', price: Number(primePrice) },
          { category: 'Classic', price: Number(classicPrice) },
        ],
      });

      if (res.success) {
        setShowMsg('Show scheduled and published to CineNova ticket inventory!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create show');
    } finally {
      setIsCreatingShow(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-cyan tracking-widest block">
            Authorized Inventory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Theatre Operator Portal</h1>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-2xl bg-cinema-850 border border-white/5 text-xs">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Total Box Office Settlement:</span>
          <span className="font-bold text-white text-sm">₹{revenue}</span>
        </div>
      </div>

      {/* Grid: 1. Screen Builder | 2. Show Scheduler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Auditorium / Screen Builder */}
        <div className="p-8 rounded-3xl bg-cinema-850 border border-white/10 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
              <Armchair className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create Auditorium Screen</h2>
              <p className="text-[11px] text-slate-400">Configure seating categories & rows</p>
            </div>
          </div>

          {screenMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              {screenMsg}
            </div>
          )}

          <form onSubmit={handleCreateScreen} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Auditorium Name
              </label>
              <input
                type="text"
                required
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                className="w-full px-3.5 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Screen Format
                </label>
                <select
                  value={screenType}
                  onChange={(e) => setScreenType(e.target.value)}
                  className="w-full px-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200"
                >
                  <option value="IMAX">IMAX with Laser</option>
                  <option value="4DX">4DX Motion</option>
                  <option value="Dolby Atmos">Dolby Atmos 2D</option>
                  <option value="RealD 3D">RealD 3D</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Layout</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={4}
                    max={15}
                    value={screenRows}
                    onChange={(e) => setScreenRows(Number(e.target.value))}
                    className="w-1/2 px-2.5 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 text-center"
                    placeholder="Rows"
                  />
                  <input
                    type="number"
                    min={6}
                    max={20}
                    value={screenCols}
                    onChange={(e) => setScreenCols(Number(e.target.value))}
                    className="w-1/2 px-2.5 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 text-center"
                    placeholder="Cols"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Auto-configures: Row A as <strong className="text-amber-400">Recliner</strong>, Rows B-D as{' '}
              <strong className="text-cyan-400">Prime</strong>, and remaining rows as{' '}
              <strong className="text-purple-300">Classic</strong>.
            </p>

            <button
              type="submit"
              disabled={isCreatingScreen}
              className="w-full py-2.5 px-4 rounded-full bg-brand-cyan hover:brightness-110 text-black font-bold text-xs shadow-glow-cyan transition-all"
            >
              {isCreatingScreen ? 'Creating Screen...' : 'Save Auditorium Screen'}
            </button>
          </form>
        </div>

        {/* 2. Showtimes Scheduler */}
        <div className="p-8 rounded-3xl bg-cinema-850 border border-white/10 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Schedule Show & Set Prices</h2>
              <p className="text-[11px] text-slate-400">Publish live booking showtimes</p>
            </div>
          </div>

          {showMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              {showMsg}
            </div>
          )}

          <form onSubmit={handleCreateShow} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Select Movie</label>
              <select
                required
                value={showMovieId}
                onChange={(e) => setShowMovieId(e.target.value)}
                className="w-full px-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200"
              >
                <option value="">-- Choose Movie --</option>
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title} ({m.certification})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={showDate}
                  onChange={(e) => setShowDate(e.target.value)}
                  className="w-full px-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={showTime}
                  onChange={(e) => setShowTime(e.target.value)}
                  className="w-full px-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tier Pricing (₹)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Recliner</span>
                  <input
                    type="number"
                    value={reclinerPrice}
                    onChange={(e) => setReclinerPrice(Number(e.target.value))}
                    className="w-full p-2 bg-cinema-900 border border-white/10 rounded-xl text-xs text-slate-200 text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Prime</span>
                  <input
                    type="number"
                    value={primePrice}
                    onChange={(e) => setPrimePrice(Number(e.target.value))}
                    className="w-full p-2 bg-cinema-900 border border-white/10 rounded-xl text-xs text-slate-200 text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Classic</span>
                  <input
                    type="number"
                    value={classicPrice}
                    onChange={(e) => setClassicPrice(Number(e.target.value))}
                    className="w-full p-2 bg-cinema-900 border border-white/10 rounded-xl text-xs text-slate-200 text-center"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreatingShow || !showMovieId}
              className="w-full py-2.5 px-4 rounded-full bg-brand-purple hover:brightness-110 text-white font-bold text-xs shadow-glow transition-all disabled:opacity-50"
            >
              {isCreatingShow ? 'Publishing Show...' : 'Schedule & Publish Show'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
