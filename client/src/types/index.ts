export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'theatre_owner' | 'admin' | 'support';
  city: string;
  isSubscribed: boolean;
  subscriptionExpiresAt?: string;
  subscriptionPlan?: 'monthly' | 'annual';
  rewardPoints: number;
  referralCode?: string;
}

export interface City {
  _id: string;
  name: string;
  state: string;
  code: string;
  lat: number;
  lng: number;
  isPopular: boolean;
  isActive: boolean;
}

export interface CastMember {
  name: string;
  role: string;
  photo: string;
}

export interface CrewMember {
  name: string;
  role: string;
}

export interface Movie {
  _id: string;
  title: string;
  slug: string;
  synopsis: string;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
  durationMinutes: number;
  certification: 'U' | 'UA' | 'A' | 'S';
  languages: string[];
  genres: string[];
  formats: string[];
  releaseDate: string;
  isTrending: boolean;
  isNowShowing: boolean;
  isComingSoon: boolean;
  avgRating: number;
  ratingCount: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Theatre {
  _id: string;
  name: string;
  chainName: string;
  city: string;
  locality: string;
  address: string;
  lat: number;
  lng: number;
  amenities: string[];
  contactPhone: string;
  contactEmail: string;
  cancellationWindowHours: number;
  refundPercentage: number;
  isApproved: boolean;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  category: string;
  type: 'regular' | 'wheelchair' | 'companion' | 'empty';
  price: number;
  status: 'available' | 'held' | 'sold';
  isHeldByMe?: boolean;
}

export interface Show {
  _id: string;
  movieId: Movie | string;
  theatreId: Theatre | string;
  screenId: {
    _id: string;
    name: string;
    screenType: string;
    totalSeats: number;
  } | string;
  startTime: string;
  endTime: string;
  dateStr: string;
  language: string;
  format: string;
  pricing: { category: string; price: number }[];
  soldSeats: string[];
  totalSeats: number;
  availableSeatsCount: number;
}

export interface BookedSeat {
  seatId: string;
  row: string;
  number: number;
  category: string;
  price: number;
}

export interface Booking {
  _id: string;
  bookingReference: string;
  userId: any;
  showId: any;
  movieId: any;
  theatreId: any;
  screenId: any;
  seats: BookedSeat[];
  baseAmount: number;
  convenienceFee: number;
  gstAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'PAYMENT_FAILED' | 'EXPIRED' | 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED';
  paymentOrderId?: string;
  paymentId?: string;
  paidAt?: string;
  qrCodeToken: string;
  qrCodeDataUrl?: string;
  cancellationPolicy: {
    canCancelUntil: string;
    refundPercentage: number;
  };
  refundDetails?: {
    refundId?: string;
    amount?: number;
    reason?: string;
    processedAt?: string;
    status?: string;
  };
  rewardPointsEarned: number;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minSpend: number;
  maxDiscount: number;
  isNewUserOnly: boolean;
  isMemberOnly: boolean;
  expiresAt: string;
}

export interface SubscriptionPlan {
  _id: string;
  planId: 'monthly' | 'annual';
  name: string;
  price: number;
  durationDays: number;
  benefits: string[];
  convenienceFeeWaiver: boolean;
  ticketDiscountPercent: number;
  maxDiscountPerBooking: number;
}

export interface Review {
  _id: string;
  movieId: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedBooking: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  userName: string;
  userEmail: string;
  bookingReference?: string;
  category: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: string;
  responses: {
    senderRole: string;
    senderName: string;
    message: string;
    createdAt: string;
  }[];
  createdAt: string;
}
