import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helpers for instant pairing/testing
  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center shadow-glow">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-white">CineNova</span>
          </Link>
          <h2 className="text-xl font-bold text-white">Welcome back</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your digital tickets, rewards, and VIP benefits
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8 rounded-3xl bg-cinema-850/90 border border-white/10 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <span className="text-[11px] text-brand-purple hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-gradient-to-r from-brand-violet to-brand-purple hover:brightness-110 text-white font-bold text-xs shadow-glow transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Logins for Pair Programming Evaluation */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick Test Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => fillCredentials('ayush@cinenova.live', 'Customer@123456')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 border border-white/5 text-center font-semibold"
              >
                Customer (Ayush)
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin@cinenova.live', 'Admin@123456')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 border border-white/5 text-center font-semibold"
              >
                Platform Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('theatre@cinenova.live', 'Theatre@123456')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/5 text-center font-semibold"
              >
                Theatre Owner
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('support@cinenova.live', 'Support@123456')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 border border-white/5 text-center font-semibold"
              >
                Support Agent
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-purple font-bold hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};
