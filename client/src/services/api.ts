const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('cinenova_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('cinenova_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('cinenova_token');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) =>
      request<any>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request<any>('/auth/me'),
    updateProfile: (profile: any) =>
      request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  },
  cities: {
    getAll: (search?: string) =>
      request<any>(search ? `/cities?search=${encodeURIComponent(search)}` : '/cities'),
  },
  movies: {
    getAll: (params: Record<string, any> = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const q = searchParams.toString();
      return request<any>(`/movies${q ? `?${q}` : ''}`);
    },
    getBanners: () => request<any>('/movies/featured/banners'),
    getDetails: (idOrSlug: string) => request<any>(`/movies/${idOrSlug}`),
    getShowtimes: (movieId: string, city?: string, date?: string) => {
      const sp = new URLSearchParams();
      if (city) sp.append('city', city);
      if (date) sp.append('date', date);
      const q = sp.toString();
      return request<any>(`/movies/${movieId}/showtimes${q ? `?${q}` : ''}`);
    },
  },
  theatres: {
    getAll: (params: Record<string, any> = {}) => {
      const sp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v) sp.append(k, String(v));
      });
      const q = sp.toString();
      return request<any>(`/theatres${q ? `?${q}` : ''}`);
    },
    getDetails: (id: string) => request<any>(`/theatres/${id}`),
  },
  shows: {
    getSeats: (showId: string) => request<any>(`/shows/${showId}/seats`),
    holdSeats: (showId: string, seatIds: string[]) =>
      request<any>(`/shows/${showId}/hold-seats`, {
        method: 'POST',
        body: JSON.stringify({ seatIds }),
      }),
    releaseHold: (showId: string, holdToken: string) =>
      request<any>(`/shows/${showId}/release-hold`, {
        method: 'POST',
        body: JSON.stringify({ holdToken }),
      }),
  },
  bookings: {
    calculatePrice: (data: { showId: string; seatIds: string[]; couponCode?: string; redeemPoints?: number }) =>
      request<any>('/bookings/calculate-price', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    createOrder: (data: {
      showId: string;
      seatIds: string[];
      holdToken: string;
      couponCode?: string;
      redeemPoints?: number;
    }) =>
      request<any>('/bookings/create-order', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    verifyPayment: (data: {
      bookingReference: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) =>
      request<any>('/bookings/verify-payment', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyBookings: () => request<any>('/bookings/my-bookings'),
    getByReference: (ref: string) => request<any>(`/bookings/${ref}`),
    cancel: (ref: string, reason?: string) =>
      request<any>(`/bookings/${ref}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    validateTicket: (token: string) => request<any>(`/bookings/validate-ticket/${token}`),
  },
  coupons: {
    getActive: () => request<any>('/coupons'),
    validate: (code: string, amount: number) =>
      request<any>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, amount }),
      }),
  },
  subscriptions: {
    getPlans: () => request<any>('/subscriptions/plans'),
    createOrder: (planId: string) =>
      request<any>('/subscriptions/create-order', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      }),
    verify: (data: any) =>
      request<any>('/subscriptions/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyStatus: () => request<any>('/subscriptions/my-status'),
  },
  reviews: {
    getByMovie: (movieId: string) => request<any>(`/reviews/movie/${movieId}`),
    create: (data: { movieId: string; rating: number; comment: string }) =>
      request<any>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    markHelpful: (reviewId: string) =>
      request<any>(`/reviews/${reviewId}/helpful`, { method: 'POST' }),
  },
  support: {
    createTicket: (data: any) =>
      request<any>('/support/tickets', { method: 'POST', body: JSON.stringify(data) }),
    getMyTickets: () => request<any>('/support/my-tickets'),
    getTicket: (ticketNum: string) => request<any>(`/support/tickets/${ticketNum}`),
    reply: (ticketNum: string, message: string) =>
      request<any>(`/support/tickets/${ticketNum}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
  },
  admin: {
    getOverview: () => request<any>('/admin/overview'),
    addMovie: (movieData: any) =>
      request<any>('/admin/movies', { method: 'POST', body: JSON.stringify(movieData) }),
    updateMovie: (id: string, data: any) =>
      request<any>(`/admin/movies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    verifyTheatre: (id: string, status: 'approved' | 'rejected') =>
      request<any>(`/admin/theatres/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    addCoupon: (couponData: any) =>
      request<any>('/admin/coupons', { method: 'POST', body: JSON.stringify(couponData) }),
    getAuditLogs: () => request<any>('/admin/audit-logs'),
    getUsers: () => request<any>('/admin/users'),
    updateUserRole: (id: string, role: string) =>
      request<any>(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
  },
  theatreOwner: {
    getMyTheatres: () => request<any>('/theatre-owner/theatres'),
    createTheatre: (data: any) =>
      request<any>('/theatre-owner/theatres', { method: 'POST', body: JSON.stringify(data) }),
    createScreen: (data: any) =>
      request<any>('/theatre-owner/screens', { method: 'POST', body: JSON.stringify(data) }),
    createShow: (data: any) =>
      request<any>('/theatre-owner/shows', { method: 'POST', body: JSON.stringify(data) }),
    getBookings: (theatreId?: string) =>
      request<any>(`/theatre-owner/bookings${theatreId ? `?theatreId=${theatreId}` : ''}`),
  },
};
