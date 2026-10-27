import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { seedDatabase } from './scripts/seed.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import theatreRoutes from './routes/theatreRoutes.js';
import showRoutes from './routes/showRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import theatreOwnerRoutes from './routes/theatreOwnerRoutes.js';

export const app = express();

// Security and utility middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline styles and external images for movie posters
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost dev servers or same origin
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiter to general API
app.use('/api', apiLimiter);

// Health check endpoints (root and /api)
const healthHandler = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'healthy',
    platform: 'CineNova API',
    version: '1.0.0',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// API Documentation / Route Directory Endpoint
const docsHandler = (req: express.Request, res: express.Response) => {
  res.json({
    platform: 'CineNova Movie Ticket Booking Platform API',
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/me', 'PUT /api/auth/profile'],
      cities: ['GET /api/cities'],
      movies: ['GET /api/movies', 'GET /api/movies/featured/banners', 'GET /api/movies/:idOrSlug', 'GET /api/movies/:id/showtimes'],
      theatres: ['GET /api/theatres', 'GET /api/theatres/:id'],
      shows: ['GET /api/shows/:id', 'GET /api/shows/:id/seats', 'POST /api/shows/:id/hold-seats', 'POST /api/shows/:id/release-hold'],
      bookings: ['POST /api/bookings/calculate-price', 'POST /api/bookings/create-order', 'POST /api/bookings/verify-payment', 'GET /api/bookings/my-bookings', 'GET /api/bookings/:reference', 'POST /api/bookings/:reference/cancel', 'GET /api/bookings/validate-ticket/:token'],
      coupons: ['GET /api/coupons', 'POST /api/coupons/validate'],
      subscriptions: ['GET /api/subscriptions/plans', 'POST /api/subscriptions/create-order', 'POST /api/subscriptions/verify', 'GET /api/subscriptions/my-status'],
      reviews: ['GET /api/reviews/movie/:movieId', 'POST /api/reviews', 'POST /api/reviews/:id/helpful'],
      support: ['POST /api/support/tickets', 'GET /api/support/my-tickets', 'GET /api/support/tickets/:ticketNumber', 'POST /api/support/tickets/:ticketNumber/reply'],
      admin: ['GET /api/admin/overview', 'POST /api/admin/movies', 'PATCH /api/admin/theatres/:id/verify', 'POST /api/admin/coupons', 'GET /api/admin/audit-logs', 'GET /api/admin/users'],
      theatreOwner: ['GET /api/theatre-owner/theatres', 'POST /api/theatre-owner/theatres', 'POST /api/theatre-owner/screens', 'POST /api/theatre-owner/shows', 'GET /api/theatre-owner/bookings'],
    },
  });
};
app.get('/docs', docsHandler);
app.get('/api/docs', docsHandler);

// Create modular API Router
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/cities', cityRoutes);
apiRouter.use('/movies', movieRoutes);
apiRouter.use('/theatres', theatreRoutes);
apiRouter.use('/shows', showRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/coupons', couponRoutes);
apiRouter.use('/subscriptions', subscriptionRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/support', supportRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/theatre-owner', theatreOwnerRoutes);

// Mount API Router under both '/api' and '/' so routing works with or without path stripping
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Server startup
const startServer = async () => {
  try {
    await connectDatabase();
    await seedDatabase();

    const server = app.listen(config.port, () => {
      console.log(`🚀 CineNova Backend Server running on port ${config.port}`);
      console.log(`📡 API Documentation available at: http://localhost:${config.port}/api/docs`);
      console.log(`🩺 Health check endpoint: http://localhost:${config.port}/api/health`);
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start CineNova server:', error);
    process.exit(1);
  }
};

// Export default app for Vercel Express service and serverless compatibility
export default app;

// Start automatically when running as a standalone server or Vercel service
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

