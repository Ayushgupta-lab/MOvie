import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, Sparkles, ShieldCheck, Zap, Gift, Clock, Star } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { PaymentModal } from '../components/PaymentModal.js';
import { SubscriptionPlan } from '../types/index.js';

export const CineNovaPlus: React.FC = () => {
  const { user, isAuthenticated, isSubscribed, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<'monthly' | 'annual'>('annual');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.subscriptions.getPlans();
        if (res.success && res.plans) {
          setPlans(res.plans);
        }
      } catch (err) {
        console.error('Failed to load membership plans:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (planId: 'monthly' | 'annual') => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await api.subscriptions.createOrder(planId);
      if (res.success && res.orderId) {
        setPaymentData({
          orderId: res.orderId,
          amountInRupees: res.amountInRupees,
          keyId: res.keyId,
          isMock: res.isMock,
          planId,
        });
        setIsPaymentOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initialize subscription payment');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentOpen(false);
    await refreshUser();
    setSuccessMsg('Welcome to CineNova Plus! Your VIP perks are now active.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-24">
      {/* Hero Title */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-glow-gold">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Exclusive VIP Cinema Membership</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          CineNova <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">Plus</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Elevate your cinema journey with waived convenience fees, guaranteed ticket savings,
          priority booking, and complimentary popcorn combos.
        </p>

        {isSubscribed && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>
              Your CineNova Plus membership is active until{' '}
              {user?.subscriptionExpiresAt
                ? new Date(user.subscriptionExpiresAt).toLocaleDateString()
                : 'next year'}
            </span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            {successMsg}
          </div>
        )}
      </div>

      {/* Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const isAnnual = plan.planId === 'annual';
          return (
            <div
              key={plan._id}
              className={`relative rounded-3xl p-8 flex flex-col justify-between space-y-6 transition-all ${
                isAnnual
                  ? 'bg-gradient-to-b from-purple-950/70 to-cinema-900 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/10'
                  : 'bg-cinema-850 border border-white/10'
              }`}
            >
              {isAnnual && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[11px] font-black uppercase tracking-wider shadow-lg">
                  Most Popular • Save 37%
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">₹{plan.price}</span>
                    <span className="text-xs text-slate-400">
                      / {isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3">
                  {plan.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="leading-relaxed">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                disabled={isSubscribing || (isSubscribed && user?.subscriptionPlan === plan.planId)}
                onClick={() => handleSubscribe(plan.planId)}
                className={`w-full py-3.5 px-4 rounded-full font-bold text-sm transition-all ${
                  isAnnual
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black shadow-glow-gold'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                } disabled:opacity-50`}
              >
                {isSubscribed && user?.subscriptionPlan === plan.planId
                  ? 'Current Plan'
                  : `Choose ${plan.name} →`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Perks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-white/10">
        <div className="p-5 rounded-3xl bg-cinema-850/60 border border-white/5 space-y-2">
          <Zap className="w-6 h-6 text-brand-purple" />
          <h4 className="text-sm font-bold text-white">Zero Convenience Fee</h4>
          <p className="text-xs text-slate-400">Save ₹30-₹60 on every single movie ticket.</p>
        </div>

        <div className="p-5 rounded-3xl bg-cinema-850/60 border border-white/5 space-y-2">
          <Clock className="w-6 h-6 text-brand-cyan" />
          <h4 className="text-sm font-bold text-white">24h Advance Booking</h4>
          <p className="text-xs text-slate-400">First pick of IMAX laser and recliner seats.</p>
        </div>

        <div className="p-5 rounded-3xl bg-cinema-850/60 border border-white/5 space-y-2">
          <Gift className="w-6 h-6 text-amber-400" />
          <h4 className="text-sm font-bold text-white">Free Popcorn Combos</h4>
          <p className="text-xs text-slate-400">Complimentary snacks on qualifying bookings.</p>
        </div>

        <div className="p-5 rounded-3xl bg-cinema-850/60 border border-white/5 space-y-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <h4 className="text-sm font-bold text-white">Priority VIP Support</h4>
          <p className="text-xs text-slate-400">Dedicated helpline and instant cancellation.</p>
        </div>
      </div>

      {/* Payment Modal for Membership */}
      {paymentData && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          bookingReference={`SUB-${paymentData.planId.toUpperCase()}`}
          orderId={paymentData.orderId}
          amountInRupees={paymentData.amountInRupees}
          movieTitle={`CineNova Plus ${paymentData.planId === 'annual' ? 'Annual' : 'Monthly'} VIP Membership`}
          seats={['VIP Member Pass']}
          isMock={paymentData.isMock}
          keyId={paymentData.keyId}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
