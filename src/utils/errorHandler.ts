export class ApiError extends Error {
  constructor(
    message: string,
    public readonly cause?: any,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleError(message: string, error?: any, code?: string): never {
  console.error(`[ERROR] ${message}:`, error);

  if (error?.code === '42P01') {
    throw new ApiError(
      'Service temporarily unavailable. Please try again later.',
      error,
      'DATABASE_ERROR'
    );
  }

  if (error?.code === '23505') {
    throw new ApiError(
      'This item already exists.',
      error,
      'DUPLICATE_ENTRY'
    );
  }

  if (error?.code === 'PGRST301') {
    throw new ApiError(
      'Session expired. Please log in again.',
      error,
      'AUTH_ERROR'
    );
  }

  throw new ApiError(message, error, code);
}

export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError;
}
