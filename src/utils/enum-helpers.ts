/**
 * Enum Helper Functions
 */

/**
 * Convert enum to options for Select component
 */
export function getEnumOptions<T extends Record<string, number | string>>(
  enumObj: T,
  labels: Record<string | number, string>
): Array<{ value: T[keyof T]; label: string }> {
  return Object.entries(enumObj)
    .filter(([, value]) => typeof value === 'number')
    .map(([, value]) => ({
      value: value as T[keyof T],
      label: labels[value] || String(value),
    }));
}

/**
 * Get label for enum value
 */
export function getEnumLabel<T extends Record<string, string | number>>(
  _enumObj: T,
  labels: Record<string | number, string>,
  value: T[keyof T]
): string {
  return labels[value] || String(value);
}

/**
 * Check if value is valid enum member
 */
export function isValidEnumValue<T extends Record<string, string | number>>(
  enumObj: T,
  value: unknown
): value is T[keyof T] {
  return Object.values(enumObj).includes(value as T[keyof T]);
}
