/**
 * AuthLayout Component
 * Template layout for authentication pages (Login, Signup, Forgot Password)
 */

import React from 'react';
import styled from 'styled-components';

interface IAuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Styled Components
 */
const AuthContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 40px;

  @media (max-width: 768px) {
    padding: 30px;
  }

  @media (max-width: 576px) {
    padding: 20px;
  }
`;

const BrandSection = styled.div`
  text-align: center;
  margin-bottom: 30px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--primary-color);
    margin: 0;
  }

  p {
    font-size: 14px;
    color: #8c8c8c;
    margin-top: 8px;
  }
`;

/**
 * AuthLayout Component
 */
export const AuthLayout: React.FC<IAuthLayoutProps> = ({ children }) => {
  return (
    <AuthContainer>
      <ContentWrapper>
        <BrandSection>
          <h1>💰 ExpenseFlow</h1>
          <p>Quản lý chi tiêu thông minh, đạt tự do tài chính</p>
        </BrandSection>
        {children}
      </ContentWrapper>
    </AuthContainer>
  );
};

export default AuthLayout;
