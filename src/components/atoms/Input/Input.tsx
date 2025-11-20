/**
 * Input Atom Component
 * Reusable text input with validation and styling
 */

import React, { useMemo } from 'react';
import styled from 'styled-components';

import { IInputProps } from './Input.types';

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledInputWrapper = styled.div`
  width: 100%;
`;

const StyledLabel = styled.label<{ $required: boolean }>`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #262626;
  font-size: 14px;

  ${(props) =>
    props.$required &&
    `
    &::after {
      content: ' *';
      color: #ff4d4f;
    }
  `}
`;

const StyledInputContainer = styled.div<{ $hasError: boolean; $size: string }>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  border: 1px solid ${(props) => (props.$hasError ? '#ff4d4f' : '#d9d9d9')};
  border-radius: 6px;
  background-color: white;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${(props) => (props.$hasError ? '#ff4d4f' : '#40a9ff')};
  }

  &:focus-within {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  ${(props) => {
    switch (props.$size) {
      case 'small':
        return `padding: 4px 8px;`;
      case 'large':
        return `padding: 10px 12px;`;
      case 'medium':
      default:
        return `padding: 8px 12px;`;
    }
  }}
`;

const StyledInput = styled.input<{ $size: string }>`
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  color: #262626;

  ${(props) => {
    switch (props.$size) {
      case 'small':
        return `font-size: 12px;`;
      case 'large':
        return `font-size: 15px;`;
      case 'medium':
      default:
        return `font-size: 14px;`;
    }
  }}

  &::placeholder {
    color: #bfbfbf;
  }

  &:disabled {
    background-color: #f5f5f5;
    color: #bfbfbf;
    cursor: not-allowed;
  }

  /* Hide number input spinner */
  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type='number'] {
    -moz-appearance: textfield;
  }
`;

const StyledPrefix = styled.span`
  display: flex;
  align-items: center;
  margin-right: 8px;
  color: #8c8c8c;
`;

const StyledSuffix = styled.span`
  display: flex;
  align-items: center;
  margin-left: 8px;
  color: #8c8c8c;
`;

const StyledErrorMessage = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
`;

/**
 * Input Component
 *
 * @example
 * // Basic input
 * <Input placeholder="Enter your name" />
 *
 * // Email input with error
 * <Input type="email" error="Invalid email" />
 *
 * // Input with prefix/suffix
 * <Input prefix={<UserIcon />} placeholder="Username" />
 *
 * // Number input
 * <Input type="number" placeholder="0" />
 */
export const Input: React.FC<IInputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  readOnly = false,
  size = 'medium',
  prefix,
  suffix,
  maxLength,
  className,
  required = false,
  autoFocus = false,
}) => {
  const hasError = useMemo(() => !!error, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || '' : e.target.value;
    onChange?.(newValue);
  };

  return (
    <StyledInputWrapper className={className}>
      {label && <StyledLabel $required={required}>{label}</StyledLabel>}
      <StyledInputContainer $hasError={hasError} $size={size}>
        {prefix && <StyledPrefix>{prefix}</StyledPrefix>}
        <StyledInput
          $size={size}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          autoFocus={autoFocus}
        />
        {suffix && <StyledSuffix>{suffix}</StyledSuffix>}
      </StyledInputContainer>
      {error && <StyledErrorMessage>{error}</StyledErrorMessage>}
    </StyledInputWrapper>
  );
};

export default Input;
