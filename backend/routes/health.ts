import { Router } from 'express';
import { NextFunction, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool();

// Basic health check
router.get('/health', async (_req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// Detailed health check
router.get('/health/detailed', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const checks = {
      database: false,
      cache: false,
      api: true,
    };

    // Check database connection
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Check Redis connection
    try {
      const redis = require('redis');
      const client = redis.createClient(process.env.REDIS_URL);
      await client.ping();
      await client.quit();
      checks.cache = true;
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    const allHealthy = Object.values(checks).every(Boolean);

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
