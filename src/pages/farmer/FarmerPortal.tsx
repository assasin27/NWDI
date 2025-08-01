import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FarmerLogin from './FarmerLogin';
import FarmerDashboard from './FarmerDashboard';
import AddProduct from './AddProduct';

const FarmerPortal: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<FarmerLogin />} />
      <Route path="/login" element={<FarmerLogin />} />
      <Route path="/dashboard" element={<FarmerDashboard />} />
      <Route path="/add-product" element={<AddProduct />} />
    </Routes>
  );
};

export default FarmerPortal; 