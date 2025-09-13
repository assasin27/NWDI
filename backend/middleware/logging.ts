import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import 'winston-daily-rotate-file';

// Configure winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'farmfresh-api' },
  transports: [
    // Write all logs to rotating files
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

interface RequestLogData {
  method: string;
  url: string;
  params: Record<string, any>;
  query: Record<string, any>;
  body: Record<string, any>;
  userId?: string;
  userRole?: string;
  ip: string;
  userAgent: string;
  responseTime: number;
  statusCode: number;
  error?: Error;
}

// Mask sensitive data in logs
const maskSensitiveData = (data: any): any => {
  const sensitiveFields = ['password', 'token', 'credit_card', 'ssn'];
  
  if (!data) return data;
  
  if (typeof data === 'object') {
    const masked = { ...data };
    for (const key in masked) {
      if (sensitiveFields.includes(key.toLowerCase())) {
        masked[key] = '******';
      } else {
        masked[key] = maskSensitiveData(masked[key]);
      }
    }
    return masked;
  }
  
  return data;
};

// Request logging middleware
export const requestLogger = (options: {
  excludePaths?: string[];
} = {}) => {
  const { excludePaths = [] } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip logging for excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const startTime = process.hrtime();

    // Capture response data
    const chunks: Buffer[] = [];
    const oldWrite = res.write;
    const oldEnd = res.end;

    res.write = function (chunk: any, ...args: any[]): boolean {
      chunks.push(Buffer.from(chunk));
      return oldWrite.apply(res, [chunk, ...args]);
    };

    res.end = function (chunk: any, ...args: any[]): any {
      if (chunk) {
        chunks.push(Buffer.from(chunk));
      }
      oldEnd.apply(res, [chunk, ...args]);
    };

    // Log after response is sent
    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const responseTime = seconds * 1000 + nanoseconds / 1000000;

      const logData: RequestLogData = {
        method: req.method,
        url: req.originalUrl || req.url,
        params: maskSensitiveData(req.params),
        query: maskSensitiveData(req.query),
        body: maskSensitiveData(req.body),
        userId: (req as any).user?.id,
        userRole: (req as any).user?.role,
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || '',
        responseTime,
        statusCode: res.statusCode,
      };

      // Log at appropriate level based on status code
      if (res.statusCode >= 500) {
        logger.error('Server Error', logData);
      } else if (res.statusCode >= 400) {
        logger.warn('Client Error', logData);
      } else {
        logger.info('Request Completed', logData);
      }
    });

    next();
  };
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled Error', {
    error: {
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.originalUrl || req.url,
      params: maskSensitiveData(req.params),
      query: maskSensitiveData(req.query),
      body: maskSensitiveData(req.body),
      userId: (req as any).user?.id,
      userRole: (req as any).user?.role,
      ip: req.ip,
      userAgent: req.get('user-agent') || '',
    },
  });

  next(err);
};

export default logger;
