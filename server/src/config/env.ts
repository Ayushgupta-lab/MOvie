import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'cinenova_dev_super_secret_jwt_key_2026_xyz',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'cinenova_dev_refresh_jwt_key_2026_abc',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_cinenova_demo_key',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_cinenova_demo_secret',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'cinenova_webhook_secret_demo',
  },
  booking: {
    holdDurationMinutes: parseInt(process.env.SEAT_HOLD_MINUTES || '10', 10),
    convenienceFeePercentage: 0.10, // 10%
    baseConvenienceFee: 30, // INR 30
    gstPercentage: 0.18, // 18% on convenience fee
  },
  email: {
    from: process.env.EMAIL_FROM || 'tickets@cinenova.live',
    service: process.env.EMAIL_SERVICE || 'mock',
  },
};
