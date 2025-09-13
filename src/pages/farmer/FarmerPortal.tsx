import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import FarmerLogin from '@/pages/farmer/FarmerLogin';
import FarmerDashboard from '@/pages/farmer/FarmerDashboard';
import AddProduct from '@/pages/farmer/AddProduct';
import EditProduct from '@/pages/farmer/EditProduct';
import ProductsList from '@/pages/farmer/ProductsList';
import OrdersList from '@/pages/farmer/OrdersList';
import Inventory from '@/pages/farmer/Inventory';

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to="/farmer/login" replace />;
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
            element={<FarmerDashboard tab="inventory" />} 
          />
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute 
            element={<FarmerDashboard tab="orders" />} 
          />
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/farmer/dashboard" replace />} />
    </Routes>
  );
};

export default FarmerPortal;