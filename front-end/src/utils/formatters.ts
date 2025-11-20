/**
 * Formatter Functions
 * Format data for display
 */

import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CURRENCY_FORMAT, DATE_FORMATS } from './constants';

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

/**
 * Format number as currency
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'VND',
  decimals: number = 0
): string => {
  // const symbol = CURRENCY_FORMAT.SYMBOLS[currency as keyof typeof CURRENCY_FORMAT.SYMBOLS] || '';
  const formatted = new Intl.NumberFormat(
    CURRENCY_FORMAT.LOCALES[currency as keyof typeof CURRENCY_FORMAT.LOCALES] || 'en-US',
    {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }
  ).format(amount);
  return formatted;
};

/**
 * Format date with pattern
 */
export const formatDate = (date: string | Date, format: string = DATE_FORMATS.DISPLAY): string => {
  return dayjs(date).format(format);
};

/**
 * Format date with time
 */
export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format(DATE_FORMATS.DISPLAY_TIME);
};

/**
 * Format number with separators
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format as percentage
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Parse formatted currency to number
 */
export const parseAmount = (value: string): number => {
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Format relative time (e.g. "2 days ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
