import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * ProtectedRoute component that enforces role-based access control
 * Only users with allowed roles can access the route
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Redirect if user doesn't have required role
  if (!hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has required role
  return <Outlet />;
};

export default ProtectedRoute;
