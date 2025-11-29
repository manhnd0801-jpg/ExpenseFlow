/**
 * PublicRoute Component
 * Route guard for public pages (login, signup, etc.)
 * Redirects to dashboard if already authenticated
 */

import { useAppSelector } from '@hooks/useRedux';
import { selectIsAuthenticated, selectIsHydrated } from '@redux/modules/auth';
import { ROUTES } from '@utils/constants';
import { Spin } from 'antd';
import React from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
`;

interface IPublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute Component
 * Redirects to dashboard if already authenticated
 */
export const PublicRoute: React.FC<IPublicRouteProps> = ({ children }) => {
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

  // Redirect to dashboard if already authenticated after hydration
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
