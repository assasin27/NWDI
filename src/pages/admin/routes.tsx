import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import ProductsList from './components/ProductsList';
import ProductForm from './components/ProductForm';
import OrdersList from './components/OrdersList';
import AnalyticsDashboard from './components/AnalyticsDashboard';

export const router = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <AnalyticsDashboard />,
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <ProductsList />,
          },
          {
            path: 'new',
            element: <ProductForm />,
          },
          {
            path: ':id',
            element: <ProductForm />,
          },
          {
            path: ':id/edit',
            element: <ProductForm />,
          },
        ],
      },
      {
        path: 'orders',
        children: [
          {
            index: true,
            element: <OrdersList />,
          },
          {
            path: ':id',
            element: <div>Order Detail View</div>,
          },
        ],
      },
      {
        path: 'analytics',
        element: <AnalyticsDashboard />,
      },
    ],
  },
]);
