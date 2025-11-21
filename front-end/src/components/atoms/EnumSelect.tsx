/**
 * EnumSelect Component
 * Generic select component for integer-based enums with labels
 */

import { Select, SelectProps } from 'antd';

interface EnumSelectProps<T extends number> extends Omit<SelectProps, 'options'> {
  enumLabels: Record<T, string>;
  enumValues?: T[];
  excludeValues?: T[];
  placeholder?: string;
}

export function EnumSelect<T extends number>({
  enumLabels,
  enumValues,
  excludeValues = [],
  placeholder = 'Chọn',
  ...props
}: EnumSelectProps<T>) {
  // Get enum values from labels if not provided
  const values = enumValues || (Object.keys(enumLabels).map(Number) as T[]);

  // Filter out excluded values
  const filteredValues = values.filter((value) => !excludeValues.includes(value));

  // Build options
  const options = filteredValues.map((value) => ({
    value,
    label: enumLabels[value],
  }));

  return <Select placeholder={placeholder} options={options} {...props} />;
}
