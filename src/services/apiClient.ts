import { BaseResponse } from '../types/api';
import { handleApiError } from '../utils/error';

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

interface ApiClientConfig {
  baseURL: string;
  defaultHeaders?: Record<string, string>;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
  }

  private buildURL(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private async request<T>(endpoint: string, config?: RequestConfig): Promise<BaseResponse<T>> {
    try {
      const url = this.buildURL(endpoint, config?.params);
      const response = await fetch(url, {
        ...config,
        headers: {
          ...this.defaultHeaders,
          ...config?.headers,
        },
      });

      if (!response.ok) {
        throw await response.json();
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  public async get<T>(endpoint: string, config?: RequestConfig): Promise<BaseResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  public async post<T>(endpoint: string, data: any, config?: RequestConfig): Promise<BaseResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async put<T>(endpoint: string, data: any, config?: RequestConfig): Promise<BaseResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async patch<T>(endpoint: string, data: any, config?: RequestConfig): Promise<BaseResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async delete<T>(endpoint: string, config?: RequestConfig): Promise<BaseResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}
