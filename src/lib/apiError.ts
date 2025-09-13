import { PostgrestError } from '@supabase/supabase-js';

interface ErrorOptions {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
  name?: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details: string;
  hint?: string;

  constructor(error: string | Error | PostgrestError | ErrorOptions) {
    if (typeof error === 'string') {
      super(error);
      this.status = 500;
      this.code = 'internal_error';
      this.details = error;
      this.name = 'ApiError';
      return;
    }

    if (error instanceof Error) {
      super(error.message);
      this.status = 500;
      this.code = 'internal_error';
      this.details = error.message;
      this.stack = error.stack;
      this.name = error.name || 'ApiError';
      return;
    }

    // Handle PostgrestError or ErrorOptions
    const { message, code = 'internal_error', details = '', hint, status = 500, name = 'ApiError' } = error;
    super(message);
    this.status = status;
    this.code = code;
    this.details = details || message;
    this.hint = hint;
    this.name = name;

    // Map common PostgREST error codes to HTTP status codes
    if (code === '23505') {
      // Unique violation
      this.status = 409; // Conflict
    } else if (code === '23503') {
      // Foreign key violation
      this.status = 400; // Bad Request
    } else if (code?.startsWith('22') || code?.startsWith('23')) {
      // Class 22 — Data Exception
      // Class 23 — Integrity Constraint Violation
      this.status = 400; // Bad Request
    } else if (code === 'PGRST301') {
      // Not found
      this.status = 404;
    }
  }

  toJSON() {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      details: this.details,
      hint: this.hint,
      name: this.name,
    };
  }
}

export const handleApiError = (error: unknown): never => {
  if (error instanceof ApiError) {
    throw error;
  }
  
  if (typeof error === 'string') {
    throw new ApiError({
      message: error,
      code: 'internal_error',
      details: error,
    });
  }
  
  if (error instanceof Error) {
    throw new ApiError({
      message: error.message,
      code: 'internal_error',
      details: error.message,
      name: error.name,
    });
  }
  
  // Handle PostgREST errors
  const pgError = error as PostgrestError;
  if (pgError.code && pgError.message) {
    throw new ApiError({
      message: pgError.message,
      code: pgError.code,
      details: pgError.details || pgError.message,
      hint: pgError.hint,
      name: 'PostgrestError',
    });
  }
  
  // Fallback for unknown errors
  throw new ApiError({
    message: 'An unknown error occurred',
    code: 'unknown_error',
    details: 'No additional error information available',
  });
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError || 
    (typeof error === 'object' && 
     error !== null && 
     'code' in error && 
     'details' in error &&
     'message' in error);
};
