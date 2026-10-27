import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { Show } from '../src/models/Show.js';
import { Movie } from '../src/models/Movie.js';
import { Screen } from '../src/models/Screen.js';
import { User } from '../src/models/User.js';
import { Coupon } from '../src/models/Coupon.js';
import { verifyPaymentSignature } from '../src/services/paymentService.js';
import { calculateAuthoritativePricing } from '../src/services/pricingService.js';
import { createSeatHold, convertHoldToSold } from '../src/services/seatService.js';

let authToken = '';
let customerUser: any = null;
let sampleShow: any = null;
let sampleScreen: any = null;

beforeAll(async () => {
  await connectDatabase();
  customerUser = await User.findOne({ email: 'ayush@cinenova.live' });
  sampleShow = await Show.findOne({ status: 'scheduled', startTime: { $gt: new Date() } });
  if (sampleShow) {
    sampleScreen = await Screen.findById(sampleShow.screenId);
  }
});

afterAll(async () => {
  await disconnectDatabase();
});

describe('1. Health and Documentation Endpoints', () => {
  it('GET /api/health should return 200 with healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.platform).toBe('CineNova API');
  });

  it('GET /api/docs should return API route catalog', async () => {
    const res = await request(app).get('/api/docs');
    expect(res.status).toBe(200);
    expect(res.body.endpoints).toBeDefined();
    expect(res.body.endpoints.movies).toBeDefined();
  });
});

describe('2. Authentication & Authorization Security', () => {
  it('POST /api/auth/login with valid credentials should return JWT token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ayush@cinenova.live',
      password: 'Customer@123456',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('ayush@cinenova.live');
    authToken = res.body.token;
  });

  it('POST /api/auth/login with wrong password should return 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ayush@cinenova.live',
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/admin/overview should deny access to customers (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/admin/overview with admin login should succeed', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@cinenova.live',
      password: 'Admin@123456',
    });

    const adminToken = loginRes.body.token;

    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toBeDefined();
  });
});

describe('3. Movie Discovery and Location Filtering', () => {
  it('GET /api/cities should return popular Indian cities', async () => {
    const res = await request(app).get('/api/cities');
    expect(res.status).toBe(200);
    expect(res.body.cities.length).toBeGreaterThan(0);
    expect(res.body.cities[0].isPopular).toBe(true);
  });

  it('GET /api/movies should return active movies', async () => {
    const res = await request(app).get('/api/movies');
    expect(res.status).toBe(200);
    expect(res.body.movies.length).toBeGreaterThan(0);
  });

  it('GET /api/movies with genre and city filter', async () => {
    const res = await request(app).get('/api/movies?genre=Sci-Fi&city=Mumbai');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.movies)).toBe(true);
  });
});

describe('4. Authoritative Server Pricing & Coupon Engine', () => {
  it('Should calculate pricing correctly on server-side and waive convenience fee for Plus member', async () => {
    if (!sampleShow || !sampleScreen) return;

    const pricing = await calculateAuthoritativePricing({
      show: sampleShow,
      screen: sampleScreen,
      selectedSeatIds: ['A1', 'A2'],
      user: customerUser, // Ayush is subscribed to CineNova Plus
    });

    expect(pricing.baseAmount).toBeGreaterThan(0);
    // Convenience fee should be waived for CineNova Plus member!
    expect(pricing.convenienceFee).toBe(0);
    expect(pricing.convenienceFeeWaived).toBe(true);
    expect(pricing.totalAmount).toBeLessThanOrEqual(pricing.baseAmount);
  });

  it('Should validate and reject expired/invalid coupon codes', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'FAKECODE999', amount: 500 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('Should accept valid coupon FIRST50', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'FIRST50', amount: 300 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.coupon.discountValue).toBe(50);
  });
});

describe('5. Concurrency Safe Seat Holds & Double Booking Prevention', () => {
  it('User 1 can hold seats successfully', async () => {
    if (!sampleShow) return;

    const hold = await createSeatHold(sampleShow._id.toString(), customerUser._id.toString(), [
      'B1',
      'B2',
    ]);

    expect(hold.holdToken).toBeDefined();
    expect(hold.seatIds).toEqual(['B1', 'B2']);
    expect(hold.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('User 2 attempting to hold the same seats simultaneously must be rejected', async () => {
    if (!sampleShow) return;

    const otherUser = await User.findOne({ email: 'theatre@cinenova.live' });
    if (!otherUser) return;

    await expect(
      createSeatHold(sampleShow._id.toString(), otherUser._id.toString(), ['B1', 'B3'])
    ).rejects.toThrow(/temporarily held by another customer/);
  });

  it('Atomic sold conversion prevents double booking permanently', async () => {
    if (!sampleShow) return;

    // First booking of seats
    const success = await convertHoldToSold(sampleShow._id.toString(), ['G1', 'G2']);
    expect(success).toBe(true);

    // Second booking of same seats must fail concurrency check
    await expect(
      convertHoldToSold(sampleShow._id.toString(), ['G1', 'G2'])
    ).rejects.toThrow(/Double-booking prevented/);
  });
});

describe('6. Cryptographic Payment Verification', () => {
  it('Should verify authentic payment signature', () => {
    const isValid = verifyPaymentSignature({
      orderId: 'order_cn_12345678',
      paymentId: 'pay_cn_87654321',
      signature: 'sig_test_pay_cn_87654321',
    });

    expect(isValid).toBe(true);
  });

  it('Should reject forged/tampered payment signature', () => {
    const isValid = verifyPaymentSignature({
      orderId: 'order_live_99999999',
      paymentId: 'pay_live_99999999',
      signature: 'fraudulent_tampered_signature_xyz',
    });

    expect(isValid).toBe(false);
  });
});
