import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-cinema-950 border-t border-white/10 text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black text-white">CineNova</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Next-generation cinema ticketing platform with live seat selection, IMAX & 4DX format
              discovery, CineNova Plus rewards, and verified bookings.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Authorized & Verified Inventory</span>
            </div>
          </div>

          {/* Movies & Discovery */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore Cinema
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/movies?status=now_showing" className="hover:text-white transition-colors">
                  Now Showing in Theatres
                </Link>
              </li>
              <li>
                <Link to="/movies?status=coming_soon" className="hover:text-white transition-colors">
                  Upcoming Releases
                </Link>
              </li>
              <li>
                <Link to="/theatres" className="hover:text-white transition-colors">
                  Multiplexes & Theatres
                </Link>
              </li>
              <li>
                <Link to="/cinenova-plus" className="hover:text-amber-400 transition-colors">
                  CineNova Plus Membership
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-white transition-colors">
                  Exclusive Offers & Promo Codes
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Help Centre & FAQs
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Privacy Policy & Data Security
                </Link>
              </li>
              <li>
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors text-brand-purple"
                >
                  Developer API Documentation ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Cities Covered */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Metros Covered
            </h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Mumbai • Delhi-NCR • Bengaluru • Hyderabad • Chennai • Pune • Kolkata • Ahmedabad •
              Chandigarh • Jaipur • Kochi
            </p>
            <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs">
              <span className="text-white font-semibold block mb-1">Razorpay Verified</span>
              <span>Secure payments supporting UPI, Cards, Net Banking & Wallets.</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CineNova Entertainment Technologies Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for movie lovers across India <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
