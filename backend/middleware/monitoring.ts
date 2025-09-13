import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';
import * as newrelic from 'newrelic';
import { performance } from 'perf_hooks';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    Sentry.httpIntegration(),
    Sentry.expressIntegration(),
  ],
});

// Performance monitoring middleware
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  
  // Add trace ID for request tracking
  const traceId = req.headers['x-trace-id'] || Math.random().toString(36).substring(7);
  req.headers['x-trace-id'] = traceId;

  // Track response time
  res.on('finish', () => {
    const duration = performance.now() - start;
    
    // Log to NewRelic
    newrelic.recordMetric('Custom/API/ResponseTime', duration);
    
    // Log to Sentry if response time is too high
    if (duration > 200) {
      Sentry.captureMessage('High API Response Time', {
        level: 'warning',
        extra: {
          path: req.path,
          duration,
          method: req.method,
          traceId,
        },
      });
    }
  });

  next();
};
