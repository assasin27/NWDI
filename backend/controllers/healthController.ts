import { Request, Response } from 'express';
import { createClient } from 'redis';
import { Pool } from 'pg';
import { supabase } from '../integrations/supabase/supabaseClient';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  message?: string;
  details: {
    database: {
      status: 'healthy' | 'unhealthy';
      message?: string;
      responseTime?: number;
    };
    redis: {
      status: 'healthy' | 'unhealthy';
      message?: string;
      responseTime?: number;
    };
    supabase: {
      status: 'healthy' | 'unhealthy';
      message?: string;
      responseTime?: number;
    };
  };
}

// Initialize connections
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Check database connection
async function checkDatabase(): Promise<HealthStatus['details']['database']> {
  const start = Date.now();
  try {
    await pgPool.query('SELECT 1');
    return {
      status: 'healthy',
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - start,
    };
  }
}

// Check Redis connection
async function checkRedis(): Promise<HealthStatus['details']['redis']> {
  const start = Date.now();
  try {
    await redisClient.ping();
    return {
      status: 'healthy',
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - start,
    };
  }
}

// Check Supabase connection
async function checkSupabase(): Promise<HealthStatus['details']['supabase']> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.from('health_check').select('count').single();
    if (error) throw error;
    return {
      status: 'healthy',
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - start,
    };
  }
}

// Health check endpoint handler
export async function healthCheck(req: Request, res: Response) {
  const [database, redis, supabase] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkSupabase(),
  ]);

  const status: HealthStatus = {
    status: 'healthy',
    details: {
      database,
      redis,
      supabase,
    },
  };

  // Check if any service is unhealthy
  if (Object.values(status.details).some(service => service.status === 'unhealthy')) {
    status.status = 'unhealthy';
    status.message = 'One or more services are unhealthy';
  }

  // Set appropriate status code
  const statusCode = status.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(status);
}
