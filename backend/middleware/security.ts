import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { sanitizeInput, validateInput } from '../utils/validation';

// Security middleware configuration
export const securityMiddleware = {
  // Basic security headers with Helmet
  helmetConfig: helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'script-src': ["'self'"],
        'img-src': ["'self'", "data:", "https:"],
        'connect-src': ["'self'", process.env.API_URL].filter(Boolean) as string[],
      },
    },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),

  // CORS configuration
  corsConfig: cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 600,
  }),

  // Rate limiting
  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Input validation and sanitization middleware
  validateAndSanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize request body
      if (req.body) {
        req.body = sanitizeInput(req.body);
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = sanitizeInput(req.query);
      }

      // Validate request based on schema
      const validationErrors = validateInput(req);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Validation Error',
          details: validationErrors,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  },
};
