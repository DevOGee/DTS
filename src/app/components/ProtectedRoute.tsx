import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { RouteConfig, hasRouteAccess } from '../routes/routeConfig';

interface ProtectedRouteProps {
  routeConfig: RouteConfig;
  children: React.ReactNode;
}

export function ProtectedRoute({ routeConfig, children }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const { permissions } = useData();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has access to this route
  const userPermissions = permissions[user?.role || 'Viewer/Digitiser'] || {};
  const userPermissionList = Object.keys(userPermissions).filter(key => userPermissions[key]);

  if (!hasRouteAccess(routeConfig, user?.role, userPermissionList)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

interface RouteGuardProps {
  routeConfig: RouteConfig;
}

export function RouteGuard({ routeConfig }: RouteGuardProps) {
  const Component = routeConfig.component;
  
  return (
    <ProtectedRoute routeConfig={routeConfig}>
      <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>}>
        <Component />
      </React.Suspense>
    </ProtectedRoute>
  );
}
