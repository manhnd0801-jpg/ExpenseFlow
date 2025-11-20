/**
 * Card Component Types
 */

export interface ICardProps {
  /**
   * Card title
   */
  title?: string | React.ReactNode;

  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Card footer content
   */
  footer?: React.ReactNode;

  /**
   * Card extra content (top right)
   */
  extra?: React.ReactNode;

  /**
   * Hover shadow effect
   * @default false
   */
  hoverable?: boolean;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Padding size
   * @default 'medium'
   */
  padding?: 'small' | 'medium' | 'large';

  /**
   * Border style
   * @default 'solid'
   */
  borderStyle?: 'solid' | 'dashed' | 'none';

  /**
   * Background color
   */
  backgroundColor?: string;
}
