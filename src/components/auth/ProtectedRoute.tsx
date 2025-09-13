import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}) => {
  const { isAuthenticated, loading, role, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If no specific roles are required, just check authentication
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has any of the allowed roles
  const hasRequiredRole = allowedRoles.some((allowedRole) => {
    if (role === 'admin') return true; // Admins have access to everything
    return role === allowedRole;
  });

  if (!hasRequiredRole) {
    // Redirect to unauthorized or home if user doesn't have required role
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
