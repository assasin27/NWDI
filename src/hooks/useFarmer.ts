import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmerService } from '../services';
import { 
  DateRange, 
  FarmerProfile, 
  Product, 
  ProductFilter,
  Order,
  OrderStatus
} from '../types/farmer';

export const useFarmerStats = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['farmerStats', dateRange],
    queryFn: () => farmerService.getDashboardStats(dateRange),
    select: (response) => response.data,
  });
};

export const useFarmerProfile = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['farmerProfile'],
    queryFn: () => farmerService.getFarmerProfile(),
    select: (response) => response.data,
  });

  const mutation = useMutation({
    mutationFn: (profile: Partial<FarmerProfile>) => 
      farmerService.updateFarmerProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerProfile'] });
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateProfile: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

export const useFarmerProducts = (filter?: ProductFilter) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['farmerProducts', filter],
    queryFn: () => farmerService.getProducts(filter),
    select: (response) => response.data,
  });

  const createMutation = useMutation({
    mutationFn: (product: Omit<Product, 'id'>) =>
      farmerService.createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerProducts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      farmerService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerProducts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => farmerService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerProducts'] });
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      farmerService.updateProductStock(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerProducts'] });
    },
  });

  return {
    products: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    updateStock: stockMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdatingStock: stockMutation.isPending,
  };
};

export const useFarmerOrders = (status?: OrderStatus) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['farmerOrders', status],
    queryFn: () => farmerService.getOrders(status),
    select: (response) => response.data,
  });

  const mutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      farmerService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerOrders'] });
    },
  });

  return {
    orders: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateStatus: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

export const useFarmerAnalytics = (dateRange: DateRange) => {
  const salesQuery = useQuery({
    queryKey: ['farmerSalesAnalytics', dateRange],
    queryFn: () => farmerService.getSalesAnalytics(dateRange),
    select: (response) => response.data,
  });

  const inventoryQuery = useQuery({
    queryKey: ['farmerInventoryAnalytics'],
    queryFn: () => farmerService.getInventoryAnalytics(),
    select: (response) => response.data,
  });

  const customerQuery = useQuery({
    queryKey: ['farmerCustomerAnalytics', dateRange],
    queryFn: () => farmerService.getCustomerAnalytics(dateRange),
    select: (response) => response.data,
  });

  return {
    sales: salesQuery.data,
    inventory: inventoryQuery.data,
    customers: customerQuery.data,
    isLoading: salesQuery.isLoading || inventoryQuery.isLoading || customerQuery.isLoading,
    error: salesQuery.error || inventoryQuery.error || customerQuery.error,
  };
};
