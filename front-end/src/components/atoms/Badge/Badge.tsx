/**
 * Badge Atom Component
 * Status badge with color variants
 */

import React from 'react';
import styled from 'styled-components';

import { IBadgeProps } from './Badge.types';

// ============================================
// STYLED COMPONENTS
// ============================================

const getColorVariant = (color: string) => {
  const variants: Record<string, { bg: string; text: string }> = {
    default: { bg: '#f0f0f0', text: '#262626' },
    success: { bg: '#f6ffed', text: '#52c41a' },
    warning: { bg: '#fffbe6', text: '#faad14' },
    error: { bg: '#fff1f0', text: '#ff4d4f' },
    info: { bg: '#e6f7ff', text: '#1890ff' },
    processing: { bg: '#e6f7ff', text: '#1890ff' },
  };
  return variants[color] || variants.default;
};

const StyledBadge = styled.span<{
  $color: string;
  $size: string;
  $backgroundColor?: string;
  $textColor?: string;
  $rounded: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: ${(props) => {
    switch (props.$size) {
      case 'small':
        return '2px 8px';
      case 'large':
        return '6px 12px';
      case 'medium':
      default:
        return '4px 10px';
    }
  }};
  font-size: ${(props) => {
    switch (props.$size) {
      case 'small':
        return '12px';
      case 'large':
        return '15px';
      case 'medium':
      default:
        return '13px';
    }
  }};
  font-weight: 500;
  border-radius: ${(props) => (props.$rounded ? '20px' : '4px')};

  ${(props) => {
    const variant = getColorVariant(props.$color);
    return `
      background-color: ${props.$backgroundColor || variant.bg};
      color: ${props.$textColor || variant.text};
    `;
  }}
`;

/**
 * Badge Component
 *
 * @example
 * // Success badge
 * <Badge color="success">Active</Badge>
 *
 * // Error badge with icon
 * <Badge color="error" icon={<ErrorIcon />}>Error</Badge>
 *
 * // Custom colored badge
 * <Badge backgroundColor="#e8f5e9" textColor="#2e7d32">
 *   Custom
 * </Badge>
 */
export const Badge: React.FC<IBadgeProps> = ({
  children,
  color = 'default',
  size = 'medium',
  backgroundColor,
  textColor,
  icon,
  className,
  rounded = false,
}) => {
  return (
    <StyledBadge
      $color={color}
      $size={size}
      $backgroundColor={backgroundColor}
      $textColor={textColor}
      $rounded={rounded}
      className={className}
    >
      {icon && <span>{icon}</span>}
      {children}
    </StyledBadge>
  );
};

export default Badge;
