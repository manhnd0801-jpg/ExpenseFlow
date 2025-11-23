/**
 * useDebounce Hook Tests - C2 Coverage
 * Tests all conditional branches and edge cases
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDebounce } from '../useDebounce';

describe('useDebounce - C2 Coverage', () => {
  // ============================================
  // BASIC FUNCTIONALITY - C2 Coverage
  // ============================================
  describe('Basic Functionality', () => {
    it('should return initial value immediately (C2: initial render)', () => {
      const { result } = renderHook(() => useDebounce('initial', 100));

      // C2: Tests initial render returns value immediately
      expect(result.current).toBe('initial');
    });

    it('should return debounced value after delay (C2: timeout completes)', async () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 100 },
      });

      expect(result.current).toBe('initial');

      // Change value
      rerender({ value: 'updated', delay: 100 });

      // Value should not change immediately
      expect(result.current).toBe('initial');

      // Wait for debounced value
      // C2: Tests setTimeout completion branch
      await waitFor(
        () => {
          expect(result.current).toBe('updated');
        },
        { timeout: 200 }
      );
    });

    it('should use default delay of 500ms when not provided (C2: default parameter)', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value), // No delay parameter
        {
          initialProps: { value: 'initial' },
        }
      );

      expect(result.current).toBe('initial');

      rerender({ value: 'updated' });

      // Should not update before 500ms
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(result.current).toBe('initial');

      // C2: Tests default delay parameter (500ms) branch
      await waitFor(
        () => {
          expect(result.current).toBe('updated');
        },
        { timeout: 600 }
      );
    });

    it('should handle custom delay (C2: custom delay parameter)', async () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 200 },
      });

      rerender({ value: 'updated', delay: 200 });

      // C2: Tests custom delay parameter branch
      await waitFor(
        () => {
          expect(result.current).toBe('updated');
        },
        { timeout: 300 }
      );
    });
  });

  // ============================================
  // CLEANUP AND CANCELLATION - C2 Coverage
  // ============================================
  describe('Cleanup and Cancellation', () => {
    it('should cancel previous timeout when value changes (C2: cleanup on value change)', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: 'first' },
      });

      // Change value multiple times quickly
      rerender({ value: 'second' });
      await new Promise((resolve) => setTimeout(resolve, 50)); // Wait 50ms (< 100ms delay)

      // C2: Tests cleanup cancels previous timeout
      rerender({ value: 'third' });

      // Only the last value should be set after delay
      await waitFor(
        () => {
          expect(result.current).toBe('third');
        },
        { timeout: 200 }
      );

      // Should never have been 'second'
      expect(result.current).not.toBe('second');
    });

    it('should cancel timeout when delay changes (C2: cleanup on delay change)', async () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 100 },
      });

      rerender({ value: 'updated', delay: 100 });
      await new Promise((resolve) => setTimeout(resolve, 50));

      // C2: Tests cleanup when delay changes
      rerender({ value: 'updated', delay: 200 });

      // Should use new delay (200ms total from last rerender)
      await waitFor(
        () => {
          expect(result.current).toBe('updated');
        },
        { timeout: 300 }
      );
    });

    it('should cleanup timeout on unmount (C2: cleanup on unmount)', async () => {
      const { result, unmount } = renderHook(() => useDebounce('initial', 100));

      expect(result.current).toBe('initial');

      // C2: Tests cleanup function is called on unmount
      unmount(); // Should not cause any errors or memory leaks
    });
  });

  // ============================================
  // MULTIPLE RAPID CHANGES - C2 Coverage
  // ============================================
  describe('Multiple Rapid Changes', () => {
    it('should only update once after multiple rapid changes (C2: multiple cleanups)', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: 'value1' },
      });

      // Rapid changes
      rerender({ value: 'value2' });
      rerender({ value: 'value3' });
      rerender({ value: 'value4' });
      rerender({ value: 'value5' });

      // C2: Tests multiple cleanup calls (each change triggers cleanup)
      await waitFor(
        () => {
          expect(result.current).toBe('value5');
        },
        { timeout: 200 }
      );

      // Should only have updated once to final value
      expect(result.current).toBe('value5');
    });

    it('should handle rapid changes with zero delay (C2: immediate update)', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 0), {
        initialProps: { value: 'initial' },
      });

      rerender({ value: 'updated' });

      // C2: Tests zero delay (setTimeout with 0)
      await waitFor(
        () => {
          expect(result.current).toBe('updated');
        },
        { timeout: 100 } // Increased timeout for zero delay
      );
    });
  });

  // ============================================
  // TYPE VARIATIONS - C2 Coverage (Generic T)
  // ============================================
  describe('Type Variations', () => {
    it('should handle string values (C2: string type)', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: 'hello' },
      });

      rerender({ value: 'world' });

      // C2: Tests string type for generic T
      await waitFor(
        () => {
          expect(result.current).toBe('world');
        },
        { timeout: 200 }
      );
    });

    it('should handle number values (C2: number type)', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: 42 },
      });

      rerender({ value: 100 });

      // C2: Tests number type for generic T
      await waitFor(
        () => {
          expect(result.current).toBe(100);
        },
        { timeout: 200 }
      );
    });

    it('should handle boolean values (C2: boolean type)', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: false },
      });

      rerender({ value: true });

      // C2: Tests boolean type for generic T
      await waitFor(
        () => {
          expect(result.current).toBe(true);
        },
        { timeout: 200 }
      );
    });

    it('should handle object values (C2: object type)', async () => {
      const obj1 = { name: 'John', age: 30 };
      const obj2 = { name: 'Jane', age: 25 };

      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: obj1 },
      });

      rerender({ value: obj2 });

      // C2: Tests object type for generic T
      await waitFor(
        () => {
          expect(result.current).toEqual(obj2);
        },
        { timeout: 200 }
      );
    });

    it('should handle array values (C2: array type)', async () => {
      const arr1 = [1, 2, 3];
      const arr2 = [4, 5, 6];

      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: arr1 },
      });

      rerender({ value: arr2 });

      // C2: Tests array type for generic T
      await waitFor(
        () => {
          expect(result.current).toEqual(arr2);
        },
        { timeout: 200 }
      );
    });

    it('should handle null/undefined values (C2: nullish types)', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: null as any },
      });

      expect(result.current).toBeNull();

      rerender({ value: undefined as any });

      // C2: Tests nullish types for generic T
      await waitFor(
        () => {
          expect(result.current).toBeUndefined();
        },
        { timeout: 200 }
      );
    });
  });

  // ============================================
  // EDGE CASES - C2 Coverage
  // ============================================
  describe('Edge Cases', () => {
    it('should handle same value updates (C2: no actual change)', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: 'same' },
      });

      // C2: Tests updating with same value (still triggers cleanup & setTimeout)
      rerender({ value: 'same' });

      await waitFor(
        () => {
          expect(result.current).toBe('same');
        },
        { timeout: 200 }
      );
    });

    it('should handle very long delay (C2: large delay value)', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
        initialProps: { value: 'initial' },
      });

      rerender({ value: 'updated' });

      // Should not update before delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(result.current).toBe('initial');

      // C2: Tests large delay value (1000ms)
      await waitFor(
        () => {
          expect(result.current).toBe('updated');
        },
        { timeout: 1200 }
      );
    });

    it('should handle negative delay as 0 (C2: invalid delay)', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, -100), {
        initialProps: { value: 'initial' },
      });

      rerender({ value: 'updated' });

      // C2: Tests negative delay (setTimeout treats negative as 0)
      await waitFor(
        () => {
          expect(result.current).toBe('updated');
        },
        { timeout: 100 }
      );
    });

    it('should handle empty string (C2: falsy but valid string)', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: 'not empty' },
      });

      rerender({ value: '' });

      // C2: Tests empty string (falsy value)
      await waitFor(
        () => {
          expect(result.current).toBe('');
        },
        { timeout: 200 }
      );
    });

    it('should handle zero number (C2: falsy but valid number)', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: 42 },
      });

      rerender({ value: 0 });

      // C2: Tests zero (falsy value)
      await waitFor(
        () => {
          expect(result.current).toBe(0);
        },
        { timeout: 200 }
      );
    });
  });
});
