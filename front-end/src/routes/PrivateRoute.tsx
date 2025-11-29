/**
 * PrivateRoute Component
 * Route guard that checks authentication before rendering
 */

import { useAppSelector } from '@hooks/useRedux';
import { selectIsAuthenticated, selectIsHydrated } from '@redux/modules/auth';
import { Spin } from 'antd';
import React from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
`;

interface IPrivateRouteProps {
  children: React.ReactNode;
}

/**
 * PrivateRoute Component
 * Redirects to login if not authenticated
 */
export const PrivateRoute: React.FC<IPrivateRouteProps> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isHydrated = useAppSelector(selectIsHydrated);

  // Show loading while hydrating auth state
  if (!isHydrated) {
    return (
      <LoadingWrapper>
        <Spin size="large" />
      </LoadingWrapper>
    );
  }

  // Redirect to login if not authenticated after hydration
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
