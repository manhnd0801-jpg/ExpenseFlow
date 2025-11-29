import { Transform } from 'class-transformer';

/**
 * Transform Date object to ISO string for JSON serialization
 * Ensures consistent date format in API responses
 *
 * @example
 * ```typescript
 * @DateToString()
 * @CreateDateColumn({ name: 'created_at' })
 * createdAt: Date;
 * ```
 */
export function DateToString() {
  return Transform(({ value }) => {
    if (value === null || value === undefined) {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    // Handle string dates
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toISOString();
    }

    return value;
  });
}
