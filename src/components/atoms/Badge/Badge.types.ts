/**
 * Badge Component Types
 */

export interface IBadgeProps {
  /**
   * Badge content/label
   */
  children: React.ReactNode;

  /**
   * Badge color/variant
   * @default 'default'
   */
  color?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'processing';

  /**
   * Badge size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Custom background color
   */
  backgroundColor?: string;

  /**
   * Custom text color
   */
  textColor?: string;

  /**
   * Icon element
   */
  icon?: React.ReactNode;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Rounded style
   * @default false
   */
  rounded?: boolean;
}
