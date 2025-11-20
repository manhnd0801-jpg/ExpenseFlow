/**
 * Input Component Types
 */

export interface IInputProps {
  /**
   * Input label
   */
  label?: string;

  /**
   * Input placeholder
   */
  placeholder?: string;

  /**
   * Input type
   * @default 'text'
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel';

  /**
   * Input value
   */
  value?: string | number;

  /**
   * Change event handler
   */
  onChange?: (value: string | number) => void;

  /**
   * Blur event handler
   */
  onBlur?: () => void;

  /**
   * Error message
   */
  error?: string;

  /**
   * Disable input
   * @default false
   */
  disabled?: boolean;

  /**
   * Read-only input
   * @default false
   */
  readOnly?: boolean;

  /**
   * Input size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Prefix element (left side)
   */
  prefix?: React.ReactNode;

  /**
   * Suffix element (right side)
   */
  suffix?: React.ReactNode;

  /**
   * Maximum length
   */
  maxLength?: number;

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
}
