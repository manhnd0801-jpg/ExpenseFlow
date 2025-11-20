/**
 * Button Atom Component
 * Reusable button with multiple variants and states
 */

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import React from 'react';
import styled from 'styled-components';

import { IButtonProps } from './Button.types';

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledButton = styled.button<{
  $variant: string;
  $size: string;
  $disabled: boolean;
  $loading: boolean;
  $width?: string;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: ${(props) => (props.$disabled || props.$loading ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease;
  white-space: nowrap;
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};
  width: ${(props) => props.$width || 'auto'};

  /* Size variants */
  ${(props) => {
    switch (props.$size) {
      case 'small':
        return `
          padding: 6px 12px;
          font-size: 12px;
          min-height: 28px;
        `;
      case 'large':
        return `
          padding: 10px 24px;
          font-size: 15px;
          min-height: 44px;
        `;
      case 'medium':
      default:
        return `
          padding: 8px 16px;
          font-size: 14px;
          min-height: 36px;
        `;
    }
  }}

  /* Color variants */
  ${(props) => {
    switch (props.$variant) {
      case 'primary':
        return `
          background-color: #1890ff;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #0050b3;
          }
          
          &:active:not(:disabled) {
            background-color: #003a8c;
          }
        `;
      case 'secondary':
        return `
          background-color: #f0f0f0;
          color: #262626;
          border: 1px solid #d9d9d9;
          
          &:hover:not(:disabled) {
            background-color: #e6e6e6;
            border-color: #b3b3b3;
          }
          
          &:active:not(:disabled) {
            background-color: #d9d9d9;
          }
        `;
      case 'danger':
        return `
          background-color: #ff4d4f;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #ff7875;
          }
          
          &:active:not(:disabled) {
            background-color: #d9363e;
          }
        `;
      case 'ghost':
        return `
          background-color: transparent;
          color: #1890ff;
          border: 1px solid #1890ff;
          
          &:hover:not(:disabled) {
            background-color: #e6f7ff;
          }
          
          &:active:not(:disabled) {
            background-color: #bae7ff;
          }
        `;
      default:
        return '';
    }
  }}

  /* Disabled state */
  &:disabled {
    cursor: not-allowed;
  }
`;

/**
 * Button Component
 *
 * @example
 * // Primary button
 * <Button label="Save" onClick={handleSave} />
 *
 * // Secondary button with loading
 * <Button label="Loading..." variant="secondary" loading={true} />
 *
 * // Danger button with icon
 * <Button label="Delete" variant="danger" icon={<DeleteIcon />} />
 *
 * // Ghost button
 * <Button label="Cancel" variant="ghost" />
 */
export const Button: React.FC<IButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  width,
  icon,
  className,
  htmlType = 'button',
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $disabled={disabled || loading}
      $loading={loading}
      $width={width}
      type={htmlType}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading && <Spin indicator={<LoadingOutlined />} />}
      {icon && !loading && icon}
      {label}
    </StyledButton>
  );
};

export default Button;
