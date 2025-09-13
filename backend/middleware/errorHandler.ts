import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ValidationError } from 'express-validator';
import * as Sentry from '@sentry/node';
import logger from './logging';

// Custom error class for HTTP errors
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

// Base error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error response
  const errorResponse = {
    status: 'error',
    message: 'Internal Server Error',
    code: 'INTERNAL_ERROR',
    errors: null as any[] | null,
  };

  // Log error details
  logger.error('Error Handler', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
    },
  });

  // Handle different types of errors
  if (err instanceof HttpError) {
    errorResponse.message = err.message;
    errorResponse.code = err.code || `HTTP_${err.statusCode}`;
    if (err.data) {
      errorResponse.errors = Array.isArray(err.data) ? err.data : [err.data];
    }
    res.status(err.statusCode);
  } else if (err instanceof ZodError) {
    errorResponse.message = 'Validation Error';
    errorResponse.code = 'VALIDATION_ERROR';
    errorResponse.errors = err.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
    res.status(400);
  } else if (err instanceof Error && 'errors' in err && Array.isArray((err as any).errors)) {
    errorResponse.message = 'Validation Error';
    errorResponse.code = 'VALIDATION_ERROR';
    errorResponse.errors = (err as any).errors.map((e: any) => ({
      field: e.param,
      message: e.msg,
      value: e.value,
    }));
    res.status(400);
  } else if (err.name === 'UnauthorizedError') {
    errorResponse.message = 'Authentication Required';
    errorResponse.code = 'UNAUTHORIZED';
    res.status(401);
  } else if (err.name === 'ForbiddenError') {
    errorResponse.message = 'Access Denied';
    errorResponse.code = 'FORBIDDEN';
    res.status(403);
  } else if (err.name === 'NotFoundError') {
    errorResponse.message = 'Resource Not Found';
    errorResponse.code = 'NOT_FOUND';
    res.status(404);
  } else if (err.name === 'ApiError') {
    errorResponse.message = err.message;
    errorResponse.code = (err as any).code || 'API_ERROR';
    res.status(err.message.includes('Session expired') ? 401 : 500);
  } else {
    // Log unexpected errors to Sentry
    Sentry.captureException(err);
    res.status(500);
  }

  // In development, include error stack
  if (process.env.NODE_ENV === 'development') {
    errorResponse.errors = errorResponse.errors || [{
      stack: err.stack,
      message: err.message,
    }];
  }

  res.json(errorResponse);
};

// Error handling utilities
export const handleAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Create error utility functions
export const createError = {
  badRequest: (message: string, code?: string, data?: any) => 
    new HttpError(400, message, code || 'BAD_REQUEST', data),
  unauthorized: (message: string = 'Authentication required', code?: string) => 
    new HttpError(401, message, code || 'UNAUTHORIZED'),
  forbidden: (message: string = 'Access denied', code?: string) => 
    new HttpError(403, message, code || 'FORBIDDEN'),
  notFound: (message: string = 'Resource not found', code?: string) => 
    new HttpError(404, message, code || 'NOT_FOUND'),
  conflict: (message: string, code?: string, data?: any) => 
    new HttpError(409, message, code || 'CONFLICT', data),
  validationError: (message: string, errors: any[]) => 
    new HttpError(400, message, 'VALIDATION_ERROR', errors),
  internal: (message: string = 'Internal server error', code?: string) => 
    new HttpError(500, message, code || 'INTERNAL_ERROR'),
};
