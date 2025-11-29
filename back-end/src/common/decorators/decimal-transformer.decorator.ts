import { Transform } from 'class-transformer';

/**
 * Transform decimal string to number for JSON serialization
 * TypeORM returns decimal/numeric columns as strings to preserve precision
 * This decorator converts them to numbers for API responses
 *
 * @example
 * ```typescript
 * @DecimalToNumber()
 * @Column({ type: 'decimal', precision: 15, scale: 2 })
 * amount: number;
 * ```
 */
export function DecimalToNumber() {
  return Transform(({ value }) => {
    if (value === null || value === undefined) {
      return value;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? value : parsed;
  });
}
