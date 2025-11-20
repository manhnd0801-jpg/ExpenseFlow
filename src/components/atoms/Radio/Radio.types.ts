/**
 * Radio Component Types
 */

export interface IRadioOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface IRadioProps {
  /**
   * Radio group options
   */
  options?: IRadioOption[];

  /**
   * Selected value
   */
  value?: string | number;

  /**
   * Default selected value
   */
  defaultValue?: string | number;

  /**
   * Change event handler
   */
  onChange?: (value: string | number) => void;

  /**
   * Disable radio group
   * @default false
   */
  disabled?: boolean;

  /**
   * Radio button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Layout direction
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Radio button style (outline or solid)
   * @default 'outline'
   */
  buttonStyle?: 'outline' | 'solid';
}

