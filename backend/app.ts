import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { securityMiddleware } from './middleware/security';
import { performanceMonitoring } from './middleware/monitoring';
import { cacheMiddleware } from './middleware/cache';
import logger from './utils/logger';
import healthRouter from './routes/health';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { backupSchedule } from './utils/backup';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Security middleware
app.use(helmet());
app.use(securityMiddleware.corsConfig);
app.use(securityMiddleware.rateLimiter);
app.use(securityMiddleware.validateAndSanitize);

// Monitoring and logging
app.use(performanceMonitoring);

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FarmFresh API',
      version: '1.0.0',
      description: 'API documentation for FarmFresh e-commerce platform',
    },
    servers: [
      {
        url: process.env.API_URL,
        description: 'Production server',
      },
    ],
  },
  apis: ['./routes/*.ts'], // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check routes
app.use('/health', healthRouter);

// API routes with caching
app.use('/api/products', cacheMiddleware({ duration: 300 }), require('./routes/products'));
app.use('/api/categories', cacheMiddleware({ duration: 3600 }), require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
});

// Start backup schedule
backupSchedule.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  
  // Stop the backup schedule
  backupSchedule.stop();
  
  // Close server
  server.close(() => {
    logger.info('Server closed. Process exiting...');
    process.exit(0);
  });
});

const server = app.listen(process.env.PORT || 3000, () => {
  logger.info(`Server running on port ${process.env.PORT || 3000}`);
});
