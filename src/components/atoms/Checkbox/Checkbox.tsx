/**
 * Checkbox Atom Component
 * Wrapper around Ant Design Checkbox with consistent styling
 */

import { Checkbox as AntCheckbox } from 'antd';
import React from 'react';
import styled from 'styled-components';
import type { ICheckboxProps } from './Checkbox.types';

/**
 * Styled Components
 */
const CheckboxWrapper = styled.div`
  .ant-checkbox-wrapper {
    font-size: 14px;
  }
`;

/**
 * Checkbox Component
 *
 * @example
 * // Basic checkbox
 * <Checkbox
 *   label="Remember me"
 *   checked={remember}
 *   onChange={setRemember}
 * />
 *
 * // Disabled checkbox
 * <Checkbox
 *   label="Disabled option"
 *   checked={false}
 *   disabled={true}
 * />
 */
export const Checkbox: React.FC<ICheckboxProps> = ({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  indeterminate = false,
  className,
  autoFocus = false,
}) => {
  /**
   * Handle change event
   */
  const handleChange = (e: any) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <CheckboxWrapper className={className}>
      <AntCheckbox
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={handleChange}
        disabled={disabled}
        indeterminate={indeterminate}
        autoFocus={autoFocus}
      >
        {label}
      </AntCheckbox>
    </CheckboxWrapper>
  );
};

export default Checkbox;

