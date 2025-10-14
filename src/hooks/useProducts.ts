import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types';
import { api } from '@/lib/api';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get<Product[]>('/products');
      return response.data;
    },
  });
}