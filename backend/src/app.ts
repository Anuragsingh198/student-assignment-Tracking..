import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { aiService } from './services/ai.service';
import cloudinaryService from './services/cloudinary.service';

// Import routes
import authRoutes from './routes/auth.routes';
import assignmentRoutes from './routes/assignment.routes';
import submissionRoutes from './routes/submission.routes';
import evaluationRoutes from './routes/evaluation.routes';

/**
 * Express Application Setup
 *
 * Why it exists: Centralizes all Express configuration, middleware,
 * and route setup for the application.
 *
 * Security considerations:
 * - Helmet for security headers
 * - CORS configuration
 * - Rate limiting to prevent abuse
 * - Compression for performance
 * - Proper error handling
 *
 * Scalability concerns:
 * - Modular route organization
 * - Middleware ordering for optimal performance
 * - Centralized configuration
 */

const app = express();

// Initialize services
aiService.initialize().catch(console.error);
// Cloudinary service is initialized when imported

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// More restrictive rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/evaluations', evaluationRoutes);

// API documentation placeholder
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Documentation',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        profile: 'GET /api/auth/profile',
      },
      assignments: {
        create: 'POST /api/assignments (Teacher)',
        list: 'GET /api/assignments',
        get: 'GET /api/assignments/:id',
        update: 'PUT /api/assignments/:id (Teacher)',
        delete: 'DELETE /api/assignments/:id (Teacher)',
        publish: 'PATCH /api/assignments/:id/publish (Teacher)',
        unpublish: 'PATCH /api/assignments/:id/unpublish (Teacher)',
      },
      submissions: {
        create: 'POST /api/submissions/:assignmentId',
        mySubmissions: 'GET /api/submissions/my',
        getSubmission: 'GET /api/submissions/:id',
        assignmentSubmissions: 'GET /api/submissions/assignment/:assignmentId (Teacher)',
        versions: 'GET /api/submissions/versions/:assignmentId',
      },
      evaluations: {
        evaluate: 'POST /api/evaluations/:submissionId (Teacher)',
        getFeedback: 'GET /api/evaluations/feedback/:submissionId',
        updateFeedback: 'PUT /api/evaluations/feedback/:submissionId (Teacher)',
        generateAIFeedback: 'POST /api/evaluations/ai-feedback/:submissionId (Teacher)',
      },
    },
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
