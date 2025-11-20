/**
 * Tooltip Component Types
 */

import type { TooltipPlacement } from 'antd/es/tooltip';

export interface ITooltipProps {
  /**
   * Tooltip content
   */
  title: string | React.ReactNode;

  /**
   * Tooltip placement
   * @default 'top'
   */
  placement?: TooltipPlacement;

  /**
   * Tooltip trigger
   * @default 'hover'
   */
  trigger?: 'hover' | 'focus' | 'click' | 'contextMenu';

  /**
   * Tooltip color
   */
  color?: string;

  /**
   * Children element to wrap
   */
  children: React.ReactNode;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Open state (controlled)
   */
  open?: boolean;

  /**
   * Open change handler
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Delay in milliseconds before showing tooltip
   * @default 0
   */
  mouseEnterDelay?: number;

  /**
   * Delay in milliseconds before hiding tooltip
   * @default 0.1
   */
  mouseLeaveDelay?: number;

  /**
   * Tooltip arrow point at center
   * @default false
   */
  arrow?: boolean | { pointAtCenter?: boolean };
}

