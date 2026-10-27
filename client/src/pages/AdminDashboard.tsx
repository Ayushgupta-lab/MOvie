import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  Ticket,
  Users,
  Building,
  Crown,
  Plus,
  Check,
  X,
  FileText,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'movies' | 'theatres' | 'coupons' | 'audit'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // New Movie Form State
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [newMovieSynopsis, setNewMovieSynopsis] = useState('');
  const [newMovieDuration, setNewMovieDuration] = useState(150);
  const [newMovieCert, setNewMovieCert] = useState('UA');
  const [newMoviePoster, setNewMoviePoster] = useState('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80');
  const [newMovieBanner, setNewMovieBanner] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80');
  const [newMovieTrailer, setNewMovieTrailer] = useState('https://www.youtube.com/watch?v=Way9Dexny3w');
  const [newMovieLangs, setNewMovieLangs] = useState('Hindi, English');
  const [newMovieGenres, setNewMovieGenres] = useState('Action, Sci-Fi');
  const [isAddingMovie, setIsAddingMovie] = useState(false);
  const [movieSuccess, setMovieSuccess] = useState('');

  // New Coupon Form State
  const [couponCode, setCouponCode] = useState('');
  const [couponTitle, setCouponTitle] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [couponValue, setCouponValue] = useState(15);
  const [couponMinSpend, setCouponMinSpend] = useState(300);
  const [couponMaxDiscount, setCouponMaxDiscount] = useState(150);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      alert('Access restricted to Platform Administrators.');
      navigate('/');
      return;
    }

    const loadAdminData = async () => {
      setIsLoading(true);
      try {
        const [overviewRes, auditRes, theatresRes] = await Promise.all([
          api.admin.getOverview(),
          api.admin.getAuditLogs(),
          api.theatres.getAll(),
        ]);

        if (overviewRes.success) {
          setStats(overviewRes.stats);
          setRecentBookings(overviewRes.recentBookings || []);
        }
        if (auditRes.success) {
          setAuditLogs(auditRes.logs || []);
        }
        if (theatresRes.success) {
          setTheatres(theatresRes.theatres || []);
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [isAdmin]);

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingMovie(true);
    setMovieSuccess('');

    try {
      const res = await api.admin.addMovie({
        title: newMovieTitle.trim(),
        synopsis: newMovieSynopsis.trim(),
        durationMinutes: Number(newMovieDuration),
        certification: newMovieCert,
        posterUrl: newMoviePoster.trim(),
        bannerUrl: newMovieBanner.trim(),
        trailerUrl: newMovieTrailer.trim(),
        languages: newMovieLangs.split(',').map((s) => s.trim()),
        genres: newMovieGenres.split(',').map((s) => s.trim()),
        formats: ['2D', 'IMAX 2D', 'Dolby Atmos'],
        releaseDate: new Date(),
        isNowShowing: true,
      });

      if (res.success) {
        setMovieSuccess(`Movie "${res.movie.title}" created successfully!`);
        setNewMovieTitle('');
        setNewMovieSynopsis('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add movie');
    } finally {
      setIsAddingMovie(false);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingCoupon(true);
    setCouponSuccess('');

    try {
      const res = await api.admin.addCoupon({
        code: couponCode.trim().toUpperCase(),
        title: couponTitle.trim(),
        description: couponDesc.trim(),
        discountType: couponType,
        discountValue: Number(couponValue),
        minSpend: Number(couponMinSpend),
        maxDiscount: Number(couponMaxDiscount),
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      });

      if (res.success) {
        setCouponSuccess(`Coupon ${res.coupon.code} activated successfully!`);
        setCouponCode('');
        setCouponTitle('');
        setCouponDesc('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    } finally {
      setIsAddingCoupon(false);
    }
  };

  const handleVerifyTheatre = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await api.admin.verifyTheatre(id, status);
      if (res.success) {
        setTheatres(theatres.map((t) => (t._id === id ? { ...t, verificationStatus: status, isApproved: status === 'approved' } : t)));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to verify theatre');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-purple tracking-widest block">
            Security & Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Platform Administration</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-cinema-850 rounded-full border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-brand-purple text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all ${
              activeTab === 'movies'
                ? 'bg-brand-purple text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Add Movie
          </button>
          <button
            onClick={() => setActiveTab('theatres')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all ${
              activeTab === 'theatres'
                ? 'bg-brand-purple text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Theatres ({theatres.length})
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all ${
              activeTab === 'coupons'
                ? 'bg-brand-purple text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Coupon
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-brand-purple text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-cinema-850/80 border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Bookings</span>
                <Ticket className="w-4 h-4 text-brand-purple" />
              </div>
              <span className="text-2xl font-black text-white">{stats.totalBookings}</span>
              <p className="text-[11px] text-emerald-400 font-medium">
                {stats.confirmedBookings} confirmed
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-cinema-850/80 border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-2xl font-black text-white">₹{stats.totalRevenue}</span>
              <p className="text-[11px] text-slate-400">Authoritative collected amount</p>
            </div>

            <div className="p-5 rounded-3xl bg-cinema-850/80 border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Active Users</span>
                <Users className="w-4 h-4 text-brand-cyan" />
              </div>
              <span className="text-2xl font-black text-white">{stats.totalUsers}</span>
              <p className="text-[11px] text-slate-400">{stats.activeSubscriptions} Plus Members</p>
            </div>

            <div className="p-5 rounded-3xl bg-cinema-850/80 border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Partner Theatres</span>
                <Building className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-2xl font-black text-white">{stats.totalTheatres}</span>
              <p className="text-[11px] text-slate-400">{stats.totalMovies} active movies</p>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="p-6 rounded-3xl bg-cinema-850/80 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-white/5">
                  <tr>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Movie</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Seats</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-brand-purple">
                        {b.bookingReference}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">{b.movieId?.title}</td>
                      <td className="py-3 px-3">{b.userId?.name || b.userId?.email}</td>
                      <td className="py-3 px-3 font-mono text-cyan-300">
                        {b.seats?.map((s: any) => s.seatId).join(', ')}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">₹{b.totalAmount}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add Movie Tab */}
      {activeTab === 'movies' && (
        <div className="max-w-2xl p-8 rounded-3xl bg-cinema-850 border border-white/10 space-y-6">
          <h2 className="text-lg font-bold text-white">Publish New Movie to Catalog</h2>

          {movieSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              {movieSuccess}
            </div>
          )}

          <form onSubmit={handleAddMovie} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Movie Title</label>
              <input
                type="text"
                required
                value={newMovieTitle}
                onChange={(e) => setNewMovieTitle(e.target.value)}
                placeholder="e.g. Gladiator II"
                className="w-full px-4 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Synopsis</label>
              <textarea
                required
                rows={3}
                value={newMovieSynopsis}
                onChange={(e) => setNewMovieSynopsis(e.target.value)}
                placeholder="Storyline and summary..."
                className="w-full p-3 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Duration (mins)</label>
                <input
                  type="number"
                  value={newMovieDuration}
                  onChange={(e) => setNewMovieDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Certification</label>
                <select
                  value={newMovieCert}
                  onChange={(e) => setNewMovieCert(e.target.value)}
                  className="w-full px-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none"
                >
                  <option value="U">U (Universal)</option>
                  <option value="UA">UA (Parental Guidance)</option>
                  <option value="A">A (Adults 18+)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Languages (comma separated)</label>
              <input
                type="text"
                value={newMovieLangs}
                onChange={(e) => setNewMovieLangs(e.target.value)}
                className="w-full px-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Genres (comma separated)</label>
              <input
                type="text"
                value={newMovieGenres}
                onChange={(e) => setNewMovieGenres(e.target.value)}
                className="w-full px-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={isAddingMovie}
              className="w-full py-3 px-4 rounded-full bg-brand-purple hover:brightness-110 text-white font-bold text-xs shadow-glow transition-all"
            >
              {isAddingMovie ? 'Creating...' : 'Publish Movie'}
            </button>
          </form>
        </div>
      )}

      {/* 3. Theatres Verification Tab */}
      {activeTab === 'theatres' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Partner Theatres & Audits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theatres.map((th) => (
              <div
                key={th._id}
                className="p-5 rounded-3xl bg-cinema-850 border border-white/5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">{th.name}</h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        th.verificationStatus === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {th.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{th.address}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                  {th.verificationStatus !== 'approved' && (
                    <button
                      onClick={() => handleVerifyTheatre(th._id, 'approved')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}
                  {th.verificationStatus !== 'rejected' && (
                    <button
                      onClick={() => handleVerifyTheatre(th._id, 'rejected')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-600/30 hover:bg-rose-600 text-rose-300 text-xs font-semibold"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Create Coupon Tab */}
      {activeTab === 'coupons' && (
        <div className="max-w-xl p-8 rounded-3xl bg-cinema-850 border border-white/10 space-y-6">
          <h2 className="text-lg font-bold text-white">Create Promotional Campaign</h2>

          {couponSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              {couponSuccess}
            </div>
          )}

          <form onSubmit={handleAddCoupon} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Promo Code</label>
              <input
                type="text"
                required
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. FESTIVE200"
                className="w-full px-4 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 uppercase tracking-wider focus:outline-none focus:border-brand-purple"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Offer Title</label>
              <input
                type="text"
                required
                value={couponTitle}
                onChange={(e) => setCouponTitle(e.target.value)}
                placeholder="e.g. Festive Holiday Discount"
                className="w-full px-4 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
              <input
                type="text"
                required
                value={couponDesc}
                onChange={(e) => setCouponDesc(e.target.value)}
                placeholder="e.g. Enjoy flat ₹200 off on tickets above ₹600"
                className="w-full px-4 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Type</label>
                <select
                  value={couponType}
                  onChange={(e) => setCouponType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Rupees (₹)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Discount Value</label>
                <input
                  type="number"
                  value={couponValue}
                  onChange={(e) => setCouponValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Min Spend (₹)</label>
                <input
                  type="number"
                  value={couponMinSpend}
                  onChange={(e) => setCouponMinSpend(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Max Discount (₹)</label>
                <input
                  type="number"
                  value={couponMaxDiscount}
                  onChange={(e) => setCouponMaxDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAddingCoupon}
              className="w-full py-3 px-4 rounded-full bg-brand-purple hover:brightness-110 text-white font-bold text-xs shadow-glow transition-all"
            >
              {isAddingCoupon ? 'Creating...' : 'Launch Coupon Campaign'}
            </button>
          </form>
        </div>
      )}

      {/* 5. Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-cinema-850/80 border border-white/5 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-cyan" />
            <span>Immutable Administrative Audit Trail</span>
          </h2>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log._id}
                className="p-3.5 rounded-2xl bg-cinema-900 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{log.action}</span>
                  <span className="text-[11px] text-slate-400">
                    By: {log.performedBy} ({log.role})
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
