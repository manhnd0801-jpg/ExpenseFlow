/**
 * Select Atom Component
 * Dropdown select with customization options
 */

import { CloseOutlined, DownOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { ISelectProps } from './Select.types';

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledSelectWrapper = styled.div`
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

const StyledSelectContainer = styled.div<{ $hasError: boolean; $size: string }>`
  position: relative;
  width: 100%;

  border: 1px solid ${(props) => (props.$hasError ? '#ff4d4f' : '#d9d9d9')};
  border-radius: 6px;
  background-color: white;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: ${(props) => (props.$hasError ? '#ff4d4f' : '#40a9ff')};
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

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledSelectValue = styled.div<{ $size: string }>`
  flex: 1;
  font-size: ${(props) => {
    switch (props.$size) {
      case 'small':
        return '12px';
      case 'large':
        return '15px';
      case 'medium':
      default:
        return '14px';
    }
  }};
  color: #262626;
`;

const StyledPlaceholder = styled.div`
  color: #bfbfbf;
`;

const StyledClearIcon = styled.div`
  cursor: pointer;
  color: #8c8c8c;
  margin-right: 8px;
  display: flex;
  align-items: center;

  &:hover {
    color: #262626;
  }
`;

const StyledDropdownIcon = styled.div<{ $open: boolean }>`
  display: flex;
  align-items: center;
  color: #8c8c8c;
  transition: transform 0.3s ease;
  transform: ${(props) => (props.$open ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const StyledDropdown = styled.div<{ $open: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  display: ${(props) => (props.$open ? 'block' : 'none')};
`;

const StyledSearchInput = styled.input`
  width: 100%;
  padding: 8px;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #bfbfbf;
  }
`;

const StyledOption = styled.div<{ $selected: boolean; $disabled: boolean }>`
  padding: 8px 12px;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  background-color: ${(props) => (props.$selected ? '#e6f7ff' : 'white')};
  color: ${(props) => {
    if (props.$disabled) return '#bfbfbf';
    return props.$selected ? '#1890ff' : '#262626';
  }};
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};

  &:hover {
    background-color: ${(props) => (props.$disabled ? 'white' : '#f5f5f5')};
  }

  font-weight: ${(props) => (props.$selected ? '500' : 'normal')};
`;

const StyledErrorMessage = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
`;

/**
 * Select Component
 *
 * @example
 * // Basic select
 * <Select
 *   options={[
 *     { value: 1, label: 'Option 1' },
 *     { value: 2, label: 'Option 2' }
 *   ]}
 *   onChange={(value) => console.log(value)}
 * />
 *
 * // Select with label and error
 * <Select
 *   label="Choose category"
 *   options={categoryOptions}
 *   error="This field is required"
 *   required
 * />
 */
export const Select: React.FC<ISelectProps> = ({
  label,
  placeholder = 'Select an option',
  value,
  onChange,
  options,
  error,
  disabled = false,
  searchable = false,
  clearable = false,
  size = 'medium',
  className,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string | number) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined as any);
  };

  return (
    <StyledSelectWrapper className={className} ref={containerRef}>
      {label && <StyledLabel $required={required}>{label}</StyledLabel>}
      <StyledSelectContainer
        $hasError={!!error}
        $size={size}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <StyledSelectValue $size={size}>
          {selectedOption ? (
            selectedOption.label
          ) : (
            <StyledPlaceholder>{placeholder}</StyledPlaceholder>
          )}
        </StyledSelectValue>
        {selectedOption && clearable && !disabled && (
          <StyledClearIcon onClick={handleClear}>
            <CloseOutlined />
          </StyledClearIcon>
        )}
        <StyledDropdownIcon $open={isOpen}>
          <DownOutlined />
        </StyledDropdownIcon>
      </StyledSelectContainer>

      <StyledDropdown $open={isOpen}>
        {searchable && (
          <StyledSearchInput
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <StyledOption
              key={option.value}
              $selected={value === option.value}
              $disabled={option.disabled || false}
              onClick={() => !option.disabled && handleSelect(option.value)}
            >
              {option.label}
            </StyledOption>
          ))
        ) : (
          <StyledOption $selected={false} $disabled={true}>
            No options
          </StyledOption>
        )}
      </StyledDropdown>

      {error && <StyledErrorMessage>{error}</StyledErrorMessage>}
    </StyledSelectWrapper>
  );
};

export default Select;
