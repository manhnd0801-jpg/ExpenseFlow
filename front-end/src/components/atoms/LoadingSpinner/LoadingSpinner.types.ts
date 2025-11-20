/**
 * Loading Spinner Component Types
 */

export interface ILoadingSpinnerProps {
  /**
   * Spinner size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Spinner color
   * @default 'primary'
   */
  color?: 'primary' | 'success' | 'error' | 'warning';

  /**
   * Loading text/message
   */
  text?: string;

  /**
   * Full page overlay
   * @default false
   */
  fullPage?: boolean;

  /**
   * CSS class name
   */
  className?: string;
}
