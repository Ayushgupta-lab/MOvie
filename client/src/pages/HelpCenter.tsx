import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  MessageSquare,
  ShieldCheck,
  Send,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const HelpCenter: React.FC = () => {
  const { user } = useAuth();

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Ticket Form State
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [bookingRef, setBookingRef] = useState<string>('');
  const [category, setCategory] = useState<string>('booking');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTicket, setSubmittedTicket] = useState<any>(null);

  // Ticket Lookup State
  const [lookupNumber, setLookupNumber] = useState<string>('');
  const [lookedUpTicket, setLookedUpTicket] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string>('');

  const faqs = [
    {
      q: 'How does the cancellation and refund policy work?',
      a: 'Tickets can be cancelled up to 2 hours before the scheduled showtime. According to our policy, you will receive a 75% refund of the base ticket price initiated immediately to your original payment method via Razorpay. Convenience fees are non-refundable.',
    },
    {
      q: 'What is CineNova Plus and how does it save money?',
      a: 'CineNova Plus is our premium membership that waives 100% of convenience fees on unlimited movie bookings throughout the year, gives an instant 10%-15% ticket discount on every show, free popcorn combos, and 24-hr advance booking access for IMAX blockbusters.',
    },
    {
      q: 'How do I use my digital ticket at the cinema gate?',
      a: 'Once your payment is verified, you receive a digital ticket pass containing a high-resolution QR code and validation token. Simply show this QR code at the cinema entrance scanner or display it directly on your mobile device.',
    },
    {
      q: 'What should I do if money was deducted but booking is pending?',
      a: 'In rare cases of bank network delays, Razorpay automatically reconciles the transaction within 15 minutes. If your payment went through, your ticket will be confirmed automatically via webhook, or you can submit a support ticket below with your reference ID.',
    },
    {
      q: 'Are seat holds guaranteed while completing payment?',
      a: 'Yes! When you click proceed, CineNova creates an atomic server-side hold on your chosen seats for 10 minutes. During this time, no other customer can book those seats, preventing double-booking.',
    },
  ];

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.support.createTicket({
        name,
        email,
        bookingReference: bookingRef,
        category,
        subject,
        message,
      });

      if (res.success && res.ticket) {
        setSubmittedTicket(res.ticket);
        setSubject('');
        setMessage('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupNumber.trim()) return;

    setIsLookingUp(true);
    setLookupError('');
    setLookedUpTicket(null);

    try {
      const res = await api.support.getTicket(lookupNumber.trim());
      if (res.success && res.ticket) {
        setLookedUpTicket(res.ticket);
      }
    } catch (err: any) {
      setLookupError(err.message || 'No support ticket found with this number');
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-24">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-purple/20 border border-brand-purple/30 text-purple-300 text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>CineNova Help Desk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">How Can We Help You?</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Find instant answers to common questions or submit a support inquiry to our care team.
        </p>
      </div>

      {/* FAQs Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-cinema-850/80 border border-white/5 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold text-white hover:text-brand-purple transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-white/5 bg-cinema-900/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket Status Lookup */}
      <div className="p-6 rounded-3xl bg-cinema-850/80 border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-brand-cyan" />
          <span>Track Existing Support Ticket</span>
        </h3>

        <form onSubmit={handleLookup} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Ticket Number (e.g. TKT-B94A)"
            value={lookupNumber}
            onChange={(e) => setLookupNumber(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 uppercase tracking-wider focus:outline-none focus:border-brand-purple"
          />
          <button
            type="submit"
            disabled={isLookingUp || !lookupNumber.trim()}
            className="px-5 py-2.5 rounded-2xl bg-brand-cyan hover:brightness-110 text-black font-bold text-xs shadow-glow-cyan disabled:opacity-50"
          >
            {isLookingUp ? 'Searching...' : 'Track Ticket'}
          </button>
        </form>

        {lookupError && <p className="text-xs text-rose-400">{lookupError}</p>}

        {lookedUpTicket && (
          <div className="p-4 rounded-2xl bg-cinema-900 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Ticket #{lookedUpTicket.ticketNumber}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-purple/20 text-purple-300 font-bold uppercase">
                {lookedUpTicket.status}
              </span>
            </div>
            <p className="text-slate-300">
              Subject: <strong>{lookedUpTicket.subject}</strong>
            </p>
            <p className="text-slate-400">{lookedUpTicket.message}</p>
            {lookedUpTicket.responses && lookedUpTicket.responses.length > 0 && (
              <div className="pt-2 border-t border-white/5 space-y-1">
                <span className="font-semibold text-emerald-400">Support Agent Response:</span>
                <p className="text-slate-300 bg-white/5 p-2.5 rounded-xl">
                  {lookedUpTicket.responses[lookedUpTicket.responses.length - 1].message}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Support Form */}
      <div className="p-8 rounded-3xl bg-cinema-850/80 border border-white/5 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-purple" />
            <span>Contact Customer Support</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Our help desk agents resolve 98% of inquiries within 1 hour.
          </p>
        </div>

        {submittedTicket ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Support Ticket Submitted!</h4>
            <p className="text-xs text-slate-300">
              Your ticket reference is{' '}
              <strong className="text-emerald-400 font-mono text-sm">
                #{submittedTicket.ticketNumber}
              </strong>
              . You will receive updates at {submittedTicket.userEmail}.
            </p>
            <button
              onClick={() => setSubmittedTicket(null)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayush Sharma"
                  className="w-full px-4 py-2.5 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ayush@example.com"
                  className="w-full px-4 py-2.5 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
                >
                  <option value="booking">Ticket & Seat Issue</option>
                  <option value="refund">Cancellation & Refund Status</option>
                  <option value="payment">Payment Deduction Issue</option>
                  <option value="theatre">Theatre Experience / Feedback</option>
                  <option value="other">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Booking Reference (Optional)
                </label>
                <input
                  type="text"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="e.g. CN-2026-X89K2P"
                  className="w-full px-4 py-2.5 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 uppercase focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your question"
                className="w-full px-4 py-2.5 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or feedback in detail..."
                className="w-full p-4 bg-cinema-900 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-brand-violet to-brand-purple hover:brightness-110 text-white font-bold text-xs shadow-glow transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
