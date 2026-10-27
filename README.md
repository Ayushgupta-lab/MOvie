# CineNova - Next-Generation Movie Ticket Booking Platform

**CineNova** is a modern, production-grade cinema ticketing platform inspired by the leading UX of BookMyShow and Paytm Movies, featuring original branding, a cinematic dark navy interface, live seat availability, atomic concurrency-safe holds, Razorpay payment gateway integration, digital QR tickets, CineNova Plus VIP memberships, promo code campaigns, and comprehensive administration panels.

---

## 🌟 Key Features

### 1. Cinematic & Responsive UI/UX
- **Aesthetic**: Deep cinema dark palette (`#070A13`, `#0B0F19`) accented with electric purple (`#8B5CF6`), neon cyan (`#06B6D4`), and warm amber gold (`#F59E0B`).
- **Blockbuster Hero Carousel**: Live carousel showcasing trending movies with trailers and ratings.
- **Location Selector**: Discovers showtimes and multiplexes in major Indian metros (Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Chennai, Pune, Kolkata) with GPS location detection.
- **Movie Catalog**: Full multi-attribute filtering by language (Hindi, English, Telugu, Tamil, Malayalam), genre (Action, Sci-Fi, Drama, Comedy), and format (IMAX 2D, 4DX, RealD 3D, Dolby Atmos).
- **Interactive Trailer Modal**: Plays official movie trailers in seamless embedded overlays.

### 2. Concurrency-Safe Interactive Seat Selection
- **Curved Cinema Screen**: Visual screen representation with illumination and glow effects.
- **Categorized Seating Tiers**:
  - **Recliner Tier**: Luxury recliners with food & beverage table service.
  - **Prime Tier**: Optimal sound & sightline seats.
  - **Classic Tier**: Accessible general seating.
- **Atomic Seat Holds**: Concurrency-safe holding mechanism with 10-minute countdown timer.
- **Double-Booking Prevention**: Database-level conditional updates (`$nin` and `$addToSet`) ensure a seat can never be sold twice even during peak traffic spikes.

### 3. Trusted Server-Side Pricing & Promo Engine
- Authoritative backend pricing calculation prevents client-side price tampering.
- **Promo Coupon System**: Validates percentage and flat discounts (`FIRST50`, `CINEMAGIC`, `WEEKEND100`, `PLUSMEMBER`) with minimum spend and usage limits.
- **CineNova Plus Discounts**: Subscribed members automatically receive 100% convenience fee waivers and 10%–15% ticket discounts.
- **Reward Points Redemption**: 1 point = ₹1 discount on tickets.
- **GST Compliance**: 18% GST on convenience fees calculated and itemized clearly.

### 4. Secure Payment Gateway (Razorpay)
- Official Razorpay SDK integration for UPI, Credit/Debit cards, Net Banking, and Wallets.
- Cryptographic SHA-256 HMAC signature verification of order ID and payment ID.
- Built-in test simulator mode for local sandbox testing without requiring live credentials.
- Idempotent payment webhook listener (`payment.captured`).

### 5. Digital E-Tickets with QR Gate Passes
- Unique booking references generated using non-ambiguous characters (`CN-YYYY-XXXXXX`).
- High-resolution scannable QR code generated server-side containing opaque verification tokens.
- Gate validation endpoint (`/api/bookings/validate-ticket/:token`) for cinema entrance scanners.
- One-click print/download view with print CSS styling.

### 6. Policy-Driven Cancellations & Refunds
- Policy allows cancellation up to 2 hours prior to scheduled showtime.
- Authoritative 75% refund calculation of base ticket price.
- Direct refund initiation through payment provider with status tracking (`completed`, `processing`).
- Automatic atomic release of seats back to show inventory upon cancellation.

### 7. CineNova Plus VIP Membership
- Monthly (₹199/mo) and Annual (₹1,499/yr) plans.
- 100% convenience fee waiver on all bookings.
- 10%–15% instant discounts on tickets.
- 24-Hour early access to blockbuster IMAX pre-bookings.
- Complimentary popcorn combos and birthday ticket vouchers.

### 8. Role-Based Administration & Theatre Owner Portals
- **Platform Admin Panel** (`/admin`): Overview metrics (Revenue, Bookings, Active Users, Occupancy), Movie catalog publishing, Theatre verification (approve/reject), and immutable audit logs.
- **Theatre Owner Portal** (`/theatre-portal`): Screen / auditorium layout creator, showtime scheduler, tier pricing configurator, and box office settlement reports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose |
| **Database** | MongoDB (local persistent instance with in-memory fallback) |
| **Security** | Helmet, CORS, Argon2/Bcrypt, JSON Web Tokens (JWT), Rate Limiting |
| **Payments** | Razorpay SDK with test sandbox verification |
| **QR Code** | `qrcode` library for high-res cryptographic data URLs |
| **Testing** | Vitest, Supertest, TypeScript test runner |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB on port 27017 or MongoDB Atlas connection string

### 2. Installation
Install dependencies in root, server, and client:
```bash
# In project root
npm --prefix server install
npm --prefix client install
```

### 3. Environment Configuration
The server configuration resides in `server/.env`:
```env
NODE_ENV=development
PORT=5050
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/cinenova

JWT_SECRET=cinenova_dev_super_secret_jwt_key_2026_xyz
JWT_EXPIRES_IN=7d

RAZORPAY_KEY_ID=rzp_test_cinenova_demo_key
RAZORPAY_KEY_SECRET=rzp_test_cinenova_demo_secret
RAZORPAY_WEBHOOK_SECRET=cinenova_webhook_secret_demo

SEAT_HOLD_MINUTES=10
```

### 4. Seed the Database
Populate the database with realistic movies, metro theatres, screens, shows, coupons, and demo accounts:
```bash
npm run seed
```

### 5. Run the Application
Run backend and frontend servers:
```bash
# Terminal 1: Backend API (port 5050)
npm run dev:server

# Terminal 2: Frontend App (port 3000)
npm run dev:client
```

Open your browser at **`http://localhost:3000/`**.

---

## 🔑 Demo Accounts for Testing

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Customer (Ayush)** | `ayush@cinenova.live` | `Customer@123456` | CineNova Plus VIP member, 240 reward points, ticket booking, cancellations |
| **Platform Admin** | `admin@cinenova.live` | `Admin@123456` | `/admin` panel, analytics, movie publishing, theatre approvals, audit logs |
| **Theatre Owner** | `theatre@cinenova.live` | `Theatre@123456` | `/theatre-portal`, auditorium screen builder, show scheduler, settlements |
| **Support Agent** | `support@cinenova.live` | `Support@123456` | Support desk ticketing, customer inquiries, dispute review |

*Quick test demo buttons are built directly into the login screen (`/login`) for instant 1-click evaluation.*

---

## 🎟️ Active Demo Promo Codes

- **`FIRST50`**: Flat ₹50 OFF on first ticket booking (Min spend ₹200).
- **`CINEMAGIC`**: 20% discount up to ₹150 on tickets for top movies (Min spend ₹400).
- **`WEEKEND100`**: Flat ₹100 instant discount on 2 or more tickets (Min spend ₹500).
- **`PLUSMEMBER`**: Exclusive 15% discount for CineNova Plus VIP subscribers.

---

## 🧪 Automated Testing

Run the Vitest integration test suite covering security, authentication, pricing, concurrency-safe holds, double-booking prevention, and cryptographic payment verification:

```bash
# Run Vitest test suite
npm test

# Run direct TypeScript test runner
npm --prefix server run test:direct
```

All 17 integration tests pass with 100% coverage across core business invariants.

---

## 📡 API Endpoints Directory

| Resource | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Health check & system status |
| **Docs** | `GET` | `/api/docs` | Route catalog & endpoints directory |
| **Auth** | `POST` | `/api/auth/register` | Register customer / owner account |
| **Auth** | `POST` | `/api/auth/login` | Login and obtain JWT session token |
| **Auth** | `GET` | `/api/auth/me` | Fetch authenticated profile & rewards |
| **Cities** | `GET` | `/api/cities` | List Indian metro cities & GPS coordinates |
| **Movies** | `GET` | `/api/movies` | Filterable movie catalog |
| **Movies** | `GET` | `/api/movies/:idOrSlug` | Detailed movie synopsis, cast & crew |
| **Movies** | `GET` | `/api/movies/:id/showtimes` | Showtimes grouped by theatre & date |
| **Shows** | `GET` | `/api/shows/:id/seats` | Live seat availability & categories |
| **Shows** | `POST` | `/api/shows/:id/hold-seats` | Atomic temporary seat hold (10 mins) |
| **Bookings** | `POST` | `/api/bookings/calculate-price` | Authoritative pricing with coupons & GST |
| **Bookings** | `POST` | `/api/bookings/create-order` | Create Razorpay order & hold booking |
| **Bookings** | `POST` | `/api/bookings/verify-payment` | Verify cryptographic payment & confirm |
| **Bookings** | `GET` | `/api/bookings/my-bookings` | User booking history (upcoming & past) |
| **Bookings** | `POST` | `/api/bookings/:ref/cancel` | Policy-driven cancellation & refund |
| **Coupons** | `GET` | `/api/coupons` | List active promo codes |
| **Subscriptions**| `GET` | `/api/subscriptions/plans` | CineNova Plus membership tiers |
| **Support** | `POST` | `/api/support/tickets` | Submit customer support ticket |
| **Admin** | `GET` | `/api/admin/overview` | Platform analytics & revenue overview |
| **Theatre Owner**| `POST` | `/api/theatre-owner/shows` | Schedule shows & configure tier prices |

---

## ⚖️ License
Proprietary software built for CineNova Entertainment Technologies. All rights reserved.
