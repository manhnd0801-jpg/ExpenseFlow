/**
 * Tooltip Atom Component
 * Wrapper around Ant Design Tooltip with consistent styling
 */

import { Tooltip as AntTooltip } from 'antd';
import React from 'react';
import type { ITooltipProps } from './Tooltip.types';

/**
 * Tooltip Component
 *
 * @example
 * // Basic tooltip
 * <Tooltip title="This is a tooltip">
 *   <Button>Hover me</Button>
 * </Tooltip>
 *
 * // Tooltip with custom placement
 * <Tooltip title="Tooltip on the right" placement="right">
 *   <span>Hover me</span>
 * </Tooltip>
 *
 * // Click trigger
 * <Tooltip title="Click to see tooltip" trigger="click">
 *   <Button>Click me</Button>
 * </Tooltip>
 */
export const Tooltip: React.FC<ITooltipProps> = ({
  title,
  placement = 'top',
  trigger = 'hover',
  color,
  children,
  className,
  open,
  onOpenChange,
  mouseEnterDelay = 0,
  mouseLeaveDelay = 0.1,
  arrow = false,
}) => {
  return (
    <AntTooltip
      title={title}
      placement={placement}
      trigger={trigger}
      color={color}
      className={className}
      open={open}
      onOpenChange={onOpenChange}
      mouseEnterDelay={mouseEnterDelay}
      mouseLeaveDelay={mouseLeaveDelay}
      arrow={arrow}
    >
      {children}
    </AntTooltip>
  );
};

export default Tooltip;

