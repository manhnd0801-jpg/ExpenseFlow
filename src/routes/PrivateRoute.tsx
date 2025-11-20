/**
 * PrivateRoute Component
 * Route guard that checks authentication before rendering
 */

import { useAppSelector } from '@hooks/useRedux';
import { selectIsAuthenticated } from '@redux/modules/auth';
import React from 'react';
import { Navigate } from 'react-router-dom';

interface IPrivateRouteProps {
  children: React.ReactNode;
}

/**
 * PrivateRoute Component
 * Redirects to login if not authenticated
 */
export const PrivateRoute: React.FC<IPrivateRouteProps> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
