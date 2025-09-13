import { createClient, RedisClientType } from 'redis';
import { NextFunction, Request, Response } from 'express';

interface CacheOptions {
  duration?: number;
  key?: string | ((req: Request) => string);
  condition?: (req: Request) => boolean;
}

class CacheService {
  private client: RedisClientType;
  private readonly defaultDuration: number = 300; // 5 minutes

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => {
      console.error('Redis Cache Error:', err);
    });

    this.client.connect().catch(err => {
      console.error('Redis Connection Error:', err);
    });
  }

  private generateKey(req: Request, keyPattern?: string | ((req: Request) => string)): string {
    if (typeof keyPattern === 'function') {
      return keyPattern(req);
    }

    if (typeof keyPattern === 'string') {
      return keyPattern;
    }

    // Default key generation based on URL and query params
    const params = new URLSearchParams(req.query as Record<string, string>);
    params.sort();
    return `cache:${req.baseUrl}${req.path}:${params.toString()}`;
  }

  public middleware(options: CacheOptions = {}) {
    const { 
      duration = this.defaultDuration, 
      key,
      condition = () => true 
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
      // Skip caching for non-GET methods or if condition is not met
      if (req.method !== 'GET' || !condition(req)) {
        return next();
      }

      const cacheKey = this.generateKey(req, key);

      try {
        const cachedData = await this.client.get(cacheKey);

        if (cachedData) {
          const { statusCode, headers, body } = JSON.parse(cachedData);
          
          // Restore headers
          Object.entries(headers).forEach(([key, value]) => {
            if (typeof value === 'string' || typeof value === 'number' || Array.isArray(value)) {
              res.setHeader(key, value);
            }
          });
          
          res.setHeader('X-Cache', 'HIT');
          return res.status(statusCode).json(body);
        }

        // Cache miss - capture the response
        const originalJson = res.json.bind(res);
        res.json = (body: any) => {
          const responseData = {
            statusCode: res.statusCode,
            headers: res.getHeaders(),
            body,
          };

          // Store in cache
          this.client.setEx(cacheKey, duration, JSON.stringify(responseData))
            .catch(err => console.error('Cache storage error:', err));

          res.setHeader('X-Cache', 'MISS');
          return originalJson(body);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  public async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  public async clear(): Promise<void> {
    try {
      await this.client.flushDb();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      console.error('Cache disconnect error:', error);
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Export middleware factory functions
export const cacheMiddleware = (options?: CacheOptions) => cacheService.middleware(options);

// Helper function to create cache key based on query parameters
export const createQueryParamsCacheKey = (params: string[]) => {
  return (req: Request) => {
    const queryParams = new URLSearchParams();
    params.forEach(param => {
      if (req.query[param]) {
        queryParams.set(param, req.query[param] as string);
      }
    });
    queryParams.sort();
    return `cache:${req.baseUrl}${req.path}:${queryParams.toString()}`;
  };
};

// Cache invalidation function
export const invalidateCache = async (pattern: string) => {
  await cacheService.invalidate(`cache:${pattern}`);
};
