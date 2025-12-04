/**
 * Currency Utilities
 * Helper functions for currency calculations and formatting
 */

/**
 * Round amount to whole number for VND currency
 * VND does not use decimal places in real transactions
 *
 * @param amount - The amount to round
 * @returns Rounded amount (whole number)
 *
 * @example
 * roundVND(10000.50) // returns 10001
 * roundVND(10000.49) // returns 10000
 * roundVND(10000) // returns 10000
 */
export function roundVND(amount: number | string): number {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return 0;
  }

  return Math.round(numAmount);
}

/**
 * Safely add amounts and round for VND
 *
 * @param a - First amount
 * @param b - Second amount
 * @returns Rounded sum
 */
export function addVND(a: number | string, b: number | string): number {
  const numA = typeof a === 'string' ? parseFloat(a) : a;
  const numB = typeof b === 'string' ? parseFloat(b) : b;

  return roundVND(numA + numB);
}

/**
 * Safely subtract amounts and round for VND
 *
 * @param a - Amount to subtract from
 * @param b - Amount to subtract
 * @returns Rounded difference
 */
export function subtractVND(a: number | string, b: number | string): number {
  const numA = typeof a === 'string' ? parseFloat(a) : a;
  const numB = typeof b === 'string' ? parseFloat(b) : b;

  return roundVND(numA - numB);
}

/**
 * Safely multiply amounts and round for VND
 *
 * @param a - First amount
 * @param b - Multiplier
 * @returns Rounded product
 */
export function multiplyVND(a: number | string, b: number | string): number {
  const numA = typeof a === 'string' ? parseFloat(a) : a;
  const numB = typeof b === 'string' ? parseFloat(b) : b;

  return roundVND(numA * numB);
}

/**
 * Safely divide amounts and round for VND
 *
 * @param a - Amount to divide
 * @param b - Divisor
 * @returns Rounded quotient
 */
export function divideVND(a: number | string, b: number | string): number {
  const numA = typeof a === 'string' ? parseFloat(a) : a;
  const numB = typeof b === 'string' ? parseFloat(b) : b;

  if (numB === 0) {
    return 0;
  }

  return roundVND(numA / numB);
}

/**
 * Convert any number to safe VND amount
 * Ensures no decimals and handles edge cases
 *
 * @param value - Value to convert
 * @returns Safe VND amount
 */
export function toVND(value: number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return roundVND(value);
}
