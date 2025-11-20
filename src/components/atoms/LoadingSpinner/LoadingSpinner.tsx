/**
 * Loading Spinner Atom Component
 * Animated spinner for loading states
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

import { ILoadingSpinnerProps } from './LoadingSpinner.types';

// ============================================
// ANIMATIONS
// ============================================

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledContainer = styled.div<{ $fullPage: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;

  ${(props) =>
    props.$fullPage &&
    `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
  `}
`;

const StyledSpinner = styled.div<{ $size: string; $color: string }>`
  border: 3px solid #f0f0f0;
  border-top: 3px solid
    ${(props) => {
      switch (props.$color) {
        case 'success':
          return '#52c41a';
        case 'error':
          return '#ff4d4f';
        case 'warning':
          return '#faad14';
        case 'primary':
        default:
          return '#1890ff';
      }
    }};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;

  ${(props) => {
    switch (props.$size) {
      case 'small':
        return 'width: 24px; height: 24px;';
      case 'large':
        return 'width: 48px; height: 48px;';
      case 'medium':
      default:
        return 'width: 36px; height: 36px;';
    }
  }}
`;

const StyledText = styled.div`
  font-size: 14px;
  color: #262626;
  text-align: center;
`;

/**
 * Loading Spinner Component
 *
 * @example
 * // Basic spinner
 * <LoadingSpinner />
 *
 * // Spinner with text
 * <LoadingSpinner text="Loading data..." size="medium" />
 *
 * // Full page overlay
 * <LoadingSpinner fullPage text="Processing..." />
 *
 * // Custom colored spinner
 * <LoadingSpinner color="success" size="large" />
 */
export const LoadingSpinner: React.FC<ILoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  text,
  fullPage = false,
  className,
}) => {
  return (
    <StyledContainer $fullPage={fullPage} className={className}>
      <StyledSpinner $size={size} $color={color} />
      {text && <StyledText>{text}</StyledText>}
    </StyledContainer>
  );
};

export default LoadingSpinner;
