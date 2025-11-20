/**
 * DatePicker Component Types
 */

import type { Dayjs } from 'dayjs';

export interface IDatePickerProps {
  /**
   * DatePicker label
   */
  label?: string;

  /**
   * Selected date value
   */
  value?: Dayjs | string | null;

  /**
   * Change event handler
   */
  onChange?: (value: Dayjs | null) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Disable date picker
   * @default false
   */
  disabled?: boolean;

  /**
   * Read-only date picker
   * @default false
   */
  readOnly?: boolean;

  /**
   * DatePicker size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Format of the date
   * @default 'DD/MM/YYYY'
   */
  format?: string;

  /**
   * Show time picker
   * @default false
   */
  showTime?: boolean;

  /**
   * Allow clearing the date
   * @default true
   */
  allowClear?: boolean;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Required field
   * @default false
   */
  required?: boolean;

  /**
   * Auto focus
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Disable dates before this date
   */
  disabledDate?: (current: Dayjs) => boolean;

  /**
   * Picker mode (date, week, month, quarter, year)
   * @default 'date'
   */
  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year';

  /**
   * Range picker mode
   * @default false
   */
  range?: boolean;

  /**
   * Range value (for range picker)
   */
  valueRange?: [Dayjs | null, Dayjs | null];

  /**
   * Range change handler (for range picker)
   */
  onChangeRange?: (dates: [Dayjs | null, Dayjs | null] | null) => void;
}

