/**
 * Select Component Types
 */

export interface ISelectOption {
  /**
   * Option value
   */
  value: string | number;

  /**
   * Option label
   */
  label: string;

  /**
   * Disable option
   */
  disabled?: boolean;
}

export interface ISelectProps {
  /**
   * Select label
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Selected value
   */
  value?: string | number;

  /**
   * Change handler
   */
  onChange?: (value: string | number) => void;

  /**
   * Select options
   */
  options: ISelectOption[];

  /**
   * Error message
   */
  error?: string;

  /**
   * Disable select
   * @default false
   */
  disabled?: boolean;

  /**
   * Allow search
   * @default false
   */
  searchable?: boolean;

  /**
   * Allow clear
   * @default false
   */
  clearable?: boolean;

  /**
   * Select size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

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
   * Multiple selection
   * @default false
   */
  multiple?: boolean;
}
