export interface BaseResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
  isUpdate?: boolean;
}

export interface PaginatedResponse<T> extends BaseResponse<T> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
