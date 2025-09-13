import { useState, useEffect, useCallback } from 'react';
import { BaseResponse } from '../types/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseApiConfig {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

export function useApi<T>(
  apiCall: () => Promise<BaseResponse<T>>,
  config: UseApiConfig = {}
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setData(response.data);
        config.onSuccess?.(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      config.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiCall, config]);

  useEffect(() => {
    if (config.enabled !== false) {
      fetchData();
    }
  }, [fetchData, config.enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (variables?: any) => Promise<T | null>;
}

interface UseMutationConfig {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useMutation<T>(
  mutationFn: (variables?: any) => Promise<BaseResponse<T>>,
  config: UseMutationConfig = {}
): UseMutationState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (variables?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await mutationFn(variables);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setData(response.data);
        config.onSuccess?.(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      config.onError?.(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, config]);

  return {
    data,
    loading,
    error,
    mutate,
  };
}
