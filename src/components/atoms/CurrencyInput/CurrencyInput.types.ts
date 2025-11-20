/**
 * CurrencyInput Component Types
 */
import { InputProps } from 'antd';

export interface ICurrencyInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: number;
  onChange?: (value: number | undefined) => void;
  currency?: 'VND' | 'USD' | 'EUR';
  maxAmount?: number;
  allowNegative?: boolean;
}
