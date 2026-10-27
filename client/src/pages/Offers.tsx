import React, { useState, useEffect } from 'react';
import { Tag, Sparkles } from 'lucide-react';
import { OfferCard } from '../components/OfferCard.js';
import { api } from '../services/api.js';
import { Coupon } from '../types/index.js';

export const Offers: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.coupons.getActive();
        if (res.success && res.coupons) {
          setCoupons(res.coupons);
        }
      } catch (err) {
        console.error('Failed to load coupons:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Tag className="w-3.5 h-3.5" />
          <span>Exclusive Promo Codes</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Movie Offers & Discounts</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Save on your next ticket booking. Copy any code and apply it during checkout.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading active promo codes...</p>
        </div>
      ) : coupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <OfferCard key={coupon._id} coupon={coupon} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-cinema-850 rounded-3xl border border-white/5 space-y-2">
          <p className="text-sm font-semibold text-white">No active promo codes right now</p>
          <p className="text-xs text-slate-400">Check back soon for weekend specials and festive deals!</p>
        </div>
      )}
    </div>
  );
};
