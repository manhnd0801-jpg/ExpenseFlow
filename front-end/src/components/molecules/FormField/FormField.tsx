/**
 * FormField Molecule Component
 * Wrapper component for form inputs with label, error, and validation
 */

import React from 'react';
import styled from 'styled-components';

import { Input, type IInputProps } from '@/components/atoms/Input';
import { Select, type ISelectProps } from '@/components/atoms/Select';

// ============================================
// TYPES
// ============================================

export type FormFieldType = 'input' | 'select' | 'textarea';

export interface IFormFieldProps {
  /**
   * Field name
   */
  name: string;

  /**
   * Field label
   */
  label?: string;

  /**
   * Field type
   * @default 'input'
   */
  type?: FormFieldType;

  /**
   * Field value
   */
  value?: string | number;

  /**
   * Change handler
   */
  onChange?: (value: string | number) => void;

  /**
   * Blur handler
   */
  onBlur?: () => void;

  /**
   * Field placeholder
   */
  placeholder?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Helper text
   */
  helperText?: string;

  /**
   * Required field
   * @default false
   */
  required?: boolean;

  /**
   * Disable field
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional input props (for input type)
   */
  inputProps?: Partial<IInputProps>;

  /**
   * Additional select props (for select type)
   */
  selectProps?: Partial<ISelectProps>;

  /**
   * CSS class name
   */
  className?: string;
}

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledFormField = styled.div`
  width: 100%;
  margin-bottom: 16px;
`;

const StyledHelperText = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #8c8c8c;
`;

/**
 * FormField Molecule Component
 *
 * @example
 * // Text input field
 * <FormField
 *   name="username"
 *   label="Username"
 *   placeholder="Enter username"
 *   value={formData.username}
 *   onChange={(value) => setFormData({...formData, username: value})}
 *   required
 * />
 *
 * // Select field
 * <FormField
 *   name="category"
 *   type="select"
 *   label="Category"
 *   selectProps={{
 *     options: categories,
 *     searchable: true,
 *   }}
 *   value={formData.category}
 *   onChange={(value) => setFormData({...formData, category: value})}
 * />
 *
 * // With error and helper text
 * <FormField
 *   name="email"
 *   label="Email"
 *   type="input"
 *   inputProps={{ type: 'email' }}
 *   error="Invalid email format"
 *   helperText="We'll never share your email"
 * />
 */
export const FormField: React.FC<IFormFieldProps> = ({
  label,
  type = 'input',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  inputProps = {},
  selectProps = {},
  className,
}) => {
  return (
    <StyledFormField className={className}>
      {type === 'input' && (
        <Input
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          disabled={disabled}
          required={required}
          {...inputProps}
        />
      )}

      {type === 'select' && (
        <Select
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
          required={required}
          options={selectProps?.options || []}
          {...selectProps}
        />
      )}

      {helperText && <StyledHelperText>{helperText}</StyledHelperText>}
    </StyledFormField>
  );
};

export default FormField;
