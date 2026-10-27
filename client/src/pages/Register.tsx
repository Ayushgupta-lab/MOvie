import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Lock, Mail, User, Phone, MapPin, ArrowRight, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCity } from '../context/CityContext.js';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { selectedCity } = useCity();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(selectedCity || 'Mumbai');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await register({
        name,
        email,
        password,
        phone,
        city,
        referralCode: referralCode.trim() || undefined,
      });
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center shadow-glow">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-white">CineNova</span>
          </Link>
          <h2 className="text-xl font-bold text-white">Create an Account</h2>
          <p className="text-xs text-slate-400">
            Join CineNova and receive 100 complimentary reward points instantly
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-cinema-850/90 border border-white/10 shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayush Sharma"
                  className="w-full pl-10 pr-4 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765..."
                    className="w-full pl-8 pr-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">City</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <Gift className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="e.g. AYUSH99"
                  className="w-full pl-10 pr-4 py-2 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 uppercase tracking-wider focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-gradient-to-r from-brand-violet to-brand-purple hover:brightness-110 text-white font-bold text-xs shadow-glow transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-purple font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
