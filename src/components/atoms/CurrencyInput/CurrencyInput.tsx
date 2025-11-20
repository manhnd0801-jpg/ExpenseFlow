/**
 * CurrencyInput Component
 * Atom component for currency input with formatting
 */
import { Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { CURRENCY_FORMAT } from '../../../utils/constants';
import { formatCurrency, parseAmount } from '../../../utils/formatters';
import type { ICurrencyInputProps } from './CurrencyInput.types';

export const CurrencyInput: React.FC<ICurrencyInputProps> = ({
  value,
  onChange,
  currency = 'VND',
  maxAmount = 999999999,
  allowNegative = false,
  placeholder = 'Nhập số tiền...',
  ...restProps
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  // Format display value when prop value changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatCurrency(value, currency));
    } else {
      setDisplayValue('');
    }
  }, [value, currency]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Remove currency symbol and whitespace
    const currencySymbol = CURRENCY_FORMAT.SYMBOLS[currency];
    inputValue = inputValue.replace(new RegExp(`[${currencySymbol}\\s]`, 'g'), '');

    // Allow only numbers, dots, commas, and minus sign
    const cleanValue = inputValue.replace(/[^\d.,-]/g, '');

    // Parse to number
    const numericValue = parseAmount(cleanValue);

    // Validate constraints
    if (numericValue !== undefined) {
      if (!allowNegative && numericValue < 0) {
        return;
      }

      if (Math.abs(numericValue) > maxAmount) {
        return;
      }
    }

    // Update display value
    if (cleanValue === '' || cleanValue === '-') {
      setDisplayValue(cleanValue);
      onChange?.(undefined);
    } else if (numericValue !== undefined && !isNaN(numericValue)) {
      setDisplayValue(formatCurrency(numericValue, currency));
      onChange?.(numericValue);
    }
  };

  const handleFocus = () => {
    // Show raw number on focus for easier editing
    if (value !== undefined && value !== null) {
      setDisplayValue(value.toString());
    }
  };

  const handleBlur = () => {
    // Format back to currency on blur
    if (value !== undefined && value !== null) {
      setDisplayValue(formatCurrency(value, currency));
    }
  };

  return (
    <Input
      {...restProps}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      suffix={CURRENCY_FORMAT.SYMBOLS[currency]}
    />
  );
};

export default CurrencyInput;
