import React from 'react';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EnhancedFarmerDashboard from './EnhancedFarmerDashboard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface FarmerDashboardProps {
  tab?: 'dashboard' | 'inventory' | 'orders';
}

// This is a wrapper component that provides necessary context providers
const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ tab = 'dashboard' }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <EnhancedFarmerDashboard tab={tab} />
    </QueryClientProvider>
  );
};

export default FarmerDashboard;
