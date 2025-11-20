/**
 * Validator Functions
 * Validate user input
 */

import { VALIDATION } from './constants';

/**
 * Email validation
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Phone number validation (Vietnam)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+84|0)[0-9]{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Password strength validation
 */
export const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    errors.push(`Mật khẩu phải có ít nhất ${VALIDATION.MIN_PASSWORD_LENGTH} ký tự`);
  }
  if (password.length > VALIDATION.MAX_PASSWORD_LENGTH) {
    errors.push(`Mật khẩu không được vượt quá ${VALIDATION.MAX_PASSWORD_LENGTH} ký tự`);
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một chữ cái thường');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một chữ cái hoa');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một chữ số');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Amount validation
 */
export const validateAmount = (
  amount: number | string
): {
  isValid: boolean;
  error?: string;
} => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return { isValid: false, error: 'Số tiền phải là một số hợp lệ' };
  }
  if (num < VALIDATION.MIN_AMOUNT) {
    return { isValid: false, error: `Số tiền phải lớn hơn hoặc bằng ${VALIDATION.MIN_AMOUNT}` };
  }
  if (num > VALIDATION.MAX_AMOUNT) {
    return { isValid: false, error: `Số tiền không được vượt quá ${VALIDATION.MAX_AMOUNT}` };
  }

  return { isValid: true };
};

/**
 * Date validation (not future)
 */
export const validateDate = (
  date: string | Date
): {
  isValid: boolean;
  error?: string;
} => {
  const selectedDate = new Date(date);
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  if (isNaN(selectedDate.getTime())) {
    return { isValid: false, error: 'Ngày không hợp lệ' };
  }
  if (selectedDate > now) {
    return { isValid: false, error: 'Ngày không được là ngày trong tương lai' };
  }

  return { isValid: true };
};

/**
 * Required field validation
 */
export const validateRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Min length validation
 */
export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Max length validation
 */
export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};
