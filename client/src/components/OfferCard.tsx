import React, { useState } from 'react';
import { Tag, Copy, Check, Clock } from 'lucide-react';
import { Coupon } from '../types/index.js';

interface OfferCardProps {
  coupon: Coupon;
  onApply?: (code: string) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ coupon, onApply }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onApply) onApply(coupon.code);
  };

  const formattedDate = new Date(coupon.expiresAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="relative flex flex-col justify-between p-5 rounded-3xl bg-cinema-850/90 border border-white/10 hover:border-brand-purple/40 transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple">
              <Tag className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">{coupon.title}</span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-bold">
            {coupon.discountType === 'percentage'
              ? `${coupon.discountValue}% OFF`
              : `₹${coupon.discountValue} OFF`}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{coupon.description}</p>
      </div>

      <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
        <div className="flex flex-col text-[11px] text-slate-400">
          <span>Min Spend: ₹{coupon.minSpend}</span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <Clock className="w-3 h-3" /> Valid till {formattedDate}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-purple-300 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>COPIED!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>{coupon.code}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
