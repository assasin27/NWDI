import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { Request, Response, NextFunction } from 'express';

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

interface CustomRequest extends Request {
  ip: string;
  user?: {
    id: string;
    is_seller: boolean;
  };
}

// Different rate limits for different types of users
const rateLimits = {
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  },
  authenticated: {
    windowMs: 15 * 60 * 1000,
    max: 300, // Higher limit for authenticated users
  },
  seller: {
    windowMs: 15 * 60 * 1000,
    max: 500, // Higher limit for sellers
  },
};

// Create different limiters for different user types
const createLimiter = (options: typeof rateLimits.public) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      prefix: 'rate-limit:',
    }),
    windowMs: options.windowMs,
    max: options.max,
    message: {
      status: 'error',
      message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const publicLimiter = createLimiter(rateLimits.public);
const authLimiter = createLimiter(rateLimits.authenticated);
const sellerLimiter = createLimiter(rateLimits.seller);

// Dynamic rate limiting middleware based on user type
export const dynamicRateLimiter = (req: CustomRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return publicLimiter(req, res, next);
  }

  if (req.user.is_seller) {
    return sellerLimiter(req, res, next);
  }

  return authLimiter(req, res, next);
};

// Higher rate limits for specific endpoints
export const createEndpointLimiter = (requestsPerWindow: number, windowMs: number = 15 * 60 * 1000) => {
  return createLimiter({
    windowMs,
    max: requestsPerWindow,
  });
};

// Specific limiters for different endpoints
export const productLimiter = createEndpointLimiter(200);
export const orderLimiter = createEndpointLimiter(150);
export const authLimiters = {
  login: createEndpointLimiter(20, 60 * 1000), // 20 requests per minute
  register: createEndpointLimiter(5, 60 * 1000), // 5 requests per minute
  forgotPassword: createEndpointLimiter(3, 60 * 1000), // 3 requests per minute
};
