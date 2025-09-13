import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { ApiService } from '@/lib/apiService';
import { supabase } from '../../lib/supabase';
import FarmerLogin from '@/pages/farmer/FarmerLogin';
import FarmerDashboard from '@/pages/farmer/FarmerDashboard';
import AddProduct from '@/pages/farmer/AddProduct';
import EditProduct from '@/pages/farmer/EditProduct';
import ProductsList from '@/pages/farmer/ProductsList';
import OrdersList from '@/pages/farmer/OrdersList';
import Inventory from '@/pages/farmer/Inventory';

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user, loading: authLoading, profile } = useAuth();
  const [verifyingRole, setVerifyingRole] = useState(true);
  const [roleVerified, setRoleVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiService = useCallback(() => new ApiService(), []); // Create API service instance

  useEffect(() => {
    let mounted = true;

    const verifyFarmerRole = async () => {
      if (!user) {
        console.log('No user found, setting verifying role to false');
        setVerifyingRole(false);
        return;
      }

      if (!mounted) {
        return;
      }

      if (profile?.role === 'farmer') {
        console.log('User has farmer role from profile');
        setRoleVerified(true);
        setVerifyingRole(false);
        return;
      }

      try {
        console.log('Verifying farmer role from API');
        const response = await apiService().getCurrentUserRole();
        if (!response.data) {
          console.log('No data returned from getCurrentUserRole');
          return;
        }

        const roleData = response.data as string | { role: string; profile?: any };
        const role = typeof roleData === 'string' ? roleData : roleData.role;
        const farmerProfile = typeof roleData === 'object' ? roleData.profile : null;
        
        if (!mounted) return;

        if (role === 'farmer') {
          console.log('User verified as farmer from API');
          setRoleVerified(true);
          // Update auth context with farmer profile if available
          if (farmerProfile) {
            await supabase.auth.updateUser({
              data: { role: 'farmer', ...farmerProfile }
            });
          }
        } else {
          console.log('User is not a farmer');
        }
        setVerifyingRole(false);
      } catch (error) {
        console.error('Error verifying farmer role:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to verify farmer role');
          setVerifyingRole(false);
          setRoleVerified(false);
        }
      }
    };

    verifyFarmerRole();
    
    return () => {
      mounted = false;
    };
  }, [user, profile, apiService]);

  if (authLoading || verifyingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground text-sm text-center">
            {authLoading ? 'Authenticating...' : 'Verifying farmer access...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/farmer/login" replace />;
  }

  if (!roleVerified) {
    console.log('Role not verified, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{element}</>;
};

const FarmerPortal: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/farmer/dashboard" replace />} />
      <Route path="/login" element={<FarmerLogin />} />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute 
            element={<FarmerDashboard />} 
          />
        } 
      />
      <Route 
        path="/products" 
        element={
          <ProtectedRoute 
            element={<ProductsList />} 
          />
        } 
      />
      <Route 
        path="/products/new" 
        element={
          <ProtectedRoute 
            element={<AddProduct />} 
          />
        } 
      />
      <Route 
        path="/products/:id/edit" 
        element={
          <ProtectedRoute 
            element={<EditProduct />} 
          />
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute 
            element={<OrdersList />} 
          />
        } 
      />
      <Route 
        path="/inventory" 
        element={
          <ProtectedRoute 
            element={<Inventory />} 
          />
        } 
      />
      <Route 
        path="/inventory" 
        element={
          <ProtectedRoute 
            element={<FarmerDashboard />} 
          />
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute 
            element={<FarmerDashboard />} 
          />
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/farmer/dashboard" replace />} />
    </Routes>
  );
};

export default FarmerPortal;