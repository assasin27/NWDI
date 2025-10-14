import { useQuery } from '@tanstack/react-query';
import { Order } from '@/types';
import { api } from '@/lib/api';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get<Order[]>('/orders');
      return response.data;
    },
  });
}