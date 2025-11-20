/**
 * Radio Atom Component
 * Wrapper around Ant Design Radio with consistent styling
 */

import { Radio as AntRadio } from 'antd';
import React from 'react';
import styled from 'styled-components';
import type { IRadioProps } from './Radio.types';

/**
 * Styled Components
 */
const RadioWrapper = styled.div`
  .ant-radio-group {
    width: 100%;
  }
`;

/**
 * Radio Component
 *
 * @example
 * // Basic radio group
 * <Radio
 *   options={[
 *     { label: 'Option 1', value: '1' },
 *     { label: 'Option 2', value: '2' },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 * />
 *
 * // Button style radio
 * <Radio
 *   options={options}
 *   value={selected}
 *   onChange={setSelected}
 *   buttonStyle="solid"
 * />
 */
export const Radio: React.FC<IRadioProps> = ({
  options = [],
  value,
  defaultValue,
  onChange,
  disabled = false,
  size = 'medium',
  direction = 'horizontal',
  className,
  buttonStyle = 'outline',
}) => {
  /**
   * Handle change event
   */
  const handleChange = (e: any) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  /**
   * Get size prop for Ant Design
   */
  const antSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'middle';

  /**
   * Render radio buttons
   */
  if (buttonStyle === 'solid') {
    return (
      <RadioWrapper className={className}>
        <AntRadio.Group
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          disabled={disabled}
          size={antSize}
          optionType="button"
          buttonStyle={buttonStyle}
          style={{
            display: 'flex',
            flexDirection: direction === 'vertical' ? 'column' : 'row',
            gap: direction === 'vertical' ? '8px' : '0',
          }}
        >
          {options.map((option) => (
            <AntRadio.Button key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </AntRadio.Button>
          ))}
        </AntRadio.Group>
      </RadioWrapper>
    );
  }

  return (
    <RadioWrapper className={className}>
      <AntRadio.Group
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        disabled={disabled}
        size={antSize}
        style={{
          display: 'flex',
          flexDirection: direction === 'vertical' ? 'column' : 'row',
          gap: direction === 'vertical' ? '8px' : '16px',
        }}
      >
        {options.map((option) => (
          <AntRadio key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </AntRadio>
        ))}
      </AntRadio.Group>
    </RadioWrapper>
  );
};

export default Radio;

