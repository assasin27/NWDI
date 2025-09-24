import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Page components
import FarmerLogin from '@/pages/farmer/FarmerLogin';
import FarmerDashboard from '@/pages/farmer/FarmerDashboard';
import AddProduct from '@/pages/farmer/AddProduct';
import EditProduct from '@/pages/farmer/EditProduct';
import ProductsList from '@/pages/farmer/ProductsList';
import OrdersList from '@/pages/farmer/OrdersList';
import Inventory from '@/pages/farmer/Inventory';

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { user, loading: authLoading, profile } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyFarmerRole = async () => {
      if (!user) {
        setIsVerifying(false);
        return;
      }

      try {
        // Check auth context first
        if (profile?.role === 'farmer') {
          setIsAuthorized(true);
          setIsVerifying(false);
          return;
        }

        // Check admin_profile table
        const { data: farmerProfile, error } = await supabase
          .from('admin_profile')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking admin profile:', error);
        }

        if (farmerProfile) {
          // Update user metadata with farmer role
          await supabase.auth.updateUser({
            data: { role: 'farmer', ...farmerProfile }
          });
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Error verifying farmer role:', error);
        toast.error('Failed to verify farmer access');
      } finally {
        setIsVerifying(false);
      }
    };

    if (!authLoading) {
      verifyFarmerRole();
    }
  }, [user, profile, authLoading]);

  if (authLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground text-sm text-center">
            {authLoading ? 'Authenticating...' : 'Verifying farmer access...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/farmer/login" replace />;
  }

  if (!isAuthorized) {
    toast.error('Access denied. Only farmers can access this area.');
    return <Navigate to="/" replace />;
  }

  return <>{element}</>;
};

const FarmerPortal: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<FarmerLogin />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<FarmerDashboard />} />} />
      <Route path="/products/add" element={<ProtectedRoute element={<AddProduct />} />} />
      <Route path="/products/edit/:id" element={<ProtectedRoute element={<EditProduct />} />} />
      <Route path="/products" element={<ProtectedRoute element={<ProductsList />} />} />
      <Route path="/orders" element={<ProtectedRoute element={<OrdersList />} />} />
      <Route path="/inventory" element={<ProtectedRoute element={<Inventory />} />} />
      <Route path="*" element={<Navigate to="/farmer/dashboard" replace />} />
    </Routes>
  );
};

export default FarmerPortal;