/**
 * AmountInput Component
 * Currency-formatted input for money amounts
 */

import { useAppSelector } from '@hooks/useRedux';
import { InputNumber, InputNumberProps } from 'antd';
import React from 'react';

interface AmountInputProps extends Omit<InputNumberProps, 'formatter' | 'parser'> {
  currency?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  currency,
  placeholder = 'Nhập số tiền',
  ...props
}) => {
  const userCurrency = useAppSelector((state) => state.auth.user?.currency || 'VND');
  const displayCurrency = currency || userCurrency;

  // Format number with currency symbol
  const formatter = (value: string | number | undefined): string => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Format based on currency
    if (displayCurrency === 'VND') {
      return `${numValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫';
    } else if (displayCurrency === 'USD') {
      return `$ ${numValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else if (displayCurrency === 'EUR') {
      return `€ ${numValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return `${numValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse formatted string back to number
  const parser = (value: string | undefined): string => {
    if (!value) return '0';
    return value.replace(/[^\d]/g, '');
  };

  return (
    <InputNumber
      style={{ width: '100%' }}
      placeholder={placeholder}
      formatter={formatter}
      parser={parser}
      min={0}
      precision={0}
      {...props}
    />
  );
};
