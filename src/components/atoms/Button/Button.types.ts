/**
 * Button Component Types
 */

export interface IButtonProps {
  /**
   * Button label/text content
   */
  label: string;

  /**
   * Button click handler
   */
  onClick?: () => void;

  /**
   * Button type
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Button variant/style
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';

  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Disable button
   * @default false
   */
  disabled?: boolean;

  /**
   * Show loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Button width
   */
  width?: string;

  /**
   * Icon element (left side)
   */
  icon?: React.ReactNode;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Custom HTML attributes
   */
  htmlType?: 'button' | 'submit' | 'reset';
}
