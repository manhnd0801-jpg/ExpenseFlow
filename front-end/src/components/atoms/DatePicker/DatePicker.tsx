/**
 * DatePicker Atom Component
 * Wrapper around Ant Design DatePicker with consistent styling
 */

import { CalendarOutlined } from '@ant-design/icons';
import { DatePicker as AntDatePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import React from 'react';
import styled from 'styled-components';
import type { IDatePickerProps } from './DatePicker.types';

/**
 * Styled Components
 */
const DatePickerWrapper = styled.div`
  width: 100%;

  .date-picker-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);

    &.required::after {
      content: ' *';
      color: #ff4d4f;
    }
  }

  .date-picker-error {
    margin-top: 4px;
    font-size: 12px;
    color: #ff4d4f;
  }

  .ant-picker {
    width: 100%;

    &.ant-picker-error {
      border-color: #ff4d4f;
    }
  }
`;

/**
 * DatePicker Component
 *
 * @example
 * // Basic date picker
 * <DatePicker
 *   label="Transaction Date"
 *   value={date}
 *   onChange={setDate}
 *   placeholder="Select date"
 * />
 *
 * // With error
 * <DatePicker
 *   label="Date"
 *   value={date}
 *   onChange={setDate}
 *   error="Date is required"
 * />
 *
 * // Date and time picker
 * <DatePicker
 *   label="Date & Time"
 *   value={date}
 *   onChange={setDate}
 *   showTime={true}
 *   format="DD/MM/YYYY HH:mm"
 * />
 */
export const DatePicker: React.FC<IDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Chọn ngày',
  error,
  disabled = false,
  readOnly = false,
  size = 'medium',
  format = 'DD/MM/YYYY',
  showTime = false,
  allowClear = true,
  className,
  required = false,
  autoFocus = false,
  disabledDate,
  picker = 'date',
}) => {
  /**
   * Convert value to Dayjs
   */
  const dayjsValue = React.useMemo(() => {
    if (!value) return null;
    if (dayjs.isDayjs(value)) return value;
    if (typeof value === 'string') return dayjs(value);
    return null;
  }, [value]);

  /**
   * Handle date change
   */
  const handleChange = (date: Dayjs | null) => {
    if (onChange) {
      onChange(date);
    }
  };

  /**
   * Get size prop for Ant Design
   */
  const antSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'middle';

  return (
    <DatePickerWrapper className={className}>
      {label && (
        <label className={`date-picker-label ${required ? 'required' : ''}`}>{label}</label>
      )}
      <AntDatePicker
        value={dayjsValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled || readOnly}
        size={antSize}
        format={format}
        showTime={showTime}
        allowClear={allowClear}
        autoFocus={autoFocus}
        disabledDate={disabledDate}
        picker={picker}
        status={error ? 'error' : undefined}
        suffixIcon={<CalendarOutlined />}
        style={{ width: '100%' }}
      />
      {error && <div className="date-picker-error">{error}</div>}
    </DatePickerWrapper>
  );
};

export default DatePicker;

