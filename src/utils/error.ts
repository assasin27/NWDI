import { BaseResponse, ErrorResponse } from '../types/api';

export function handleApiError(error: any): BaseResponse<any> {
  console.error('API Error:', error);

  if (error instanceof Error) {
    return {
      error: error.message,
      message: 'An unexpected error occurred',
    };
  }

  if (typeof error === 'object' && error !== null) {
    const errorResponse = error as ErrorResponse;
    return {
      error: errorResponse.error,
      message: errorResponse.message || 'An error occurred while processing your request',
    };
  }

  return {
    error: 'Unknown error',
    message: 'An unexpected error occurred',
  };
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Permission denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}
