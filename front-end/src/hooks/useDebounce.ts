/**
 * useDebounce Hook
 * Debounce a value with configurable delay
 * Useful for search inputs, resize handlers, etc.
 */

import { useEffect, useState } from 'react';

/**
 * useDebounce Hook
 * Returns a debounced version of the provided value
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * const searchTerm = useDebounce(inputValue, 300);
 * // searchTerm will only update 300ms after inputValue stops changing
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
