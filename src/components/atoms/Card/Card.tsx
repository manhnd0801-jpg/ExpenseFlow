/**
 * Card Atom Component
 * Reusable container with border and padding
 */

import React from 'react';
import styled from 'styled-components';

import { ICardProps } from './Card.types';

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledCard = styled.div<{
  $hoverable: boolean;
  $padding: string;
  $borderStyle: string;
  $backgroundColor?: string;
}>`
  background-color: ${(props) => props.$backgroundColor || '#ffffff'};
  border: 1px ${(props) => props.$borderStyle} #d9d9d9;
  border-radius: 8px;
  transition: all 0.3s ease;

  ${(props) =>
    props.$padding === 'small'
      ? 'padding: 12px;'
      : props.$padding === 'large'
      ? 'padding: 24px;'
      : 'padding: 16px;'}

  ${(props) =>
    props.$hoverable &&
    `
    cursor: pointer;
    
    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  `}
`;

const StyledCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const StyledCardTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #262626;
`;

const StyledCardExtra = styled.div`
  display: flex;
  align-items: center;
`;

const StyledCardBody = styled.div`
  width: 100%;
`;

const StyledCardFooter = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`;

/**
 * Card Component
 *
 * @example
 * // Simple card
 * <Card>Card Content</Card>
 *
 * // Card with title and footer
 * <Card
 *   title="My Card"
 *   footer={<Button label="Action" />}
 * >
 *   Card content here
 * </Card>
 *
 * // Hoverable card
 * <Card
 *   hoverable
 *   onClick={handleCardClick}
 *   title="Clickable Card"
 *   extra={<Icon />}
 * >
 *   Content
 * </Card>
 */
export const Card: React.FC<ICardProps> = ({
  title,
  children,
  footer,
  extra,
  hoverable = false,
  onClick,
  className,
  padding = 'medium',
  borderStyle = 'solid',
  backgroundColor,
}) => {
  return (
    <StyledCard
      $hoverable={hoverable}
      $padding={padding}
      $borderStyle={borderStyle}
      $backgroundColor={backgroundColor}
      onClick={onClick}
      className={className}
    >
      {(title || extra) && (
        <StyledCardHeader>
          {title && <StyledCardTitle>{title}</StyledCardTitle>}
          {extra && <StyledCardExtra>{extra}</StyledCardExtra>}
        </StyledCardHeader>
      )}
      <StyledCardBody>{children}</StyledCardBody>
      {footer && <StyledCardFooter>{footer}</StyledCardFooter>}
    </StyledCard>
  );
};

export default Card;
