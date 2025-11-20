/**
 * Checkbox Component Types
 */

export interface ICheckboxProps {
  /**
   * Checkbox label
   */
  label?: string;

  /**
   * Checked state
   */
  checked?: boolean;

  /**
   * Default checked state
   */
  defaultChecked?: boolean;

  /**
   * Change event handler
   */
  onChange?: (checked: boolean) => void;

  /**
   * Disable checkbox
   * @default false
   */
  disabled?: boolean;

  /**
   * Indeterminate state
   * @default false
   */
  indeterminate?: boolean;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Auto focus
   * @default false
   */
  autoFocus?: boolean;
}

