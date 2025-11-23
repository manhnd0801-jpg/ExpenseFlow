/**
 * Validators Tests - C2 Coverage
 * Tests all validation functions with edge cases and conditional branches
 */

import { describe, expect, it } from 'vitest';
import {
  validateAmount,
  validateDate,
  validateEmail,
  validateMaxLength,
  validateMinLength,
  validatePassword,
  validatePhoneNumber,
  validateRequired,
} from '../validators';

describe('Validators - C2 Coverage', () => {
  // ============================================
  // EMAIL VALIDATION - C2 Coverage
  // ============================================
  describe('validateEmail', () => {
    it('should return true for valid email (C2: regex test passes)', () => {
      // C2: Tests emailRegex.test(email) === true branch
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@domain.co')).toBe(true);
      expect(validateEmail('name+tag@company.org')).toBe(true);
    });

    it('should return false for invalid email (C2: regex test fails)', () => {
      // C2: Tests emailRegex.test(email) === false branch
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@nodomain.com')).toBe(false);
      expect(validateEmail('no-at-sign.com')).toBe(false);
      expect(validateEmail('spaces in@email.com')).toBe(false);
    });

    it('should handle empty string (C2: edge case)', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  // ============================================
  // PHONE NUMBER VALIDATION - C2 Coverage
  // ============================================
  describe('validatePhoneNumber', () => {
    it('should return true for valid Vietnamese phone (C2: regex passes)', () => {
      // C2: Tests phoneRegex.test(phone) === true branch
      expect(validatePhoneNumber('0123456789')).toBe(true);
      expect(validatePhoneNumber('0987654321')).toBe(true);
      expect(validatePhoneNumber('+84123456789')).toBe(true);
      expect(validatePhoneNumber('+84987654321')).toBe(true);
    });

    it('should return false for invalid phone (C2: regex fails)', () => {
      // C2: Tests phoneRegex.test(phone) === false branch
      expect(validatePhoneNumber('123456789')).toBe(false); // Missing 0/+84
      expect(validatePhoneNumber('012345678')).toBe(false); // Too short
      expect(validatePhoneNumber('01234567890')).toBe(false); // Too long
      expect(validatePhoneNumber('abc1234567')).toBe(false); // Contains letters
      expect(validatePhoneNumber('+841234567')).toBe(false); // Too short
    });

    it('should handle empty string (C2: edge case)', () => {
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  // ============================================
  // PASSWORD VALIDATION - C2 Coverage
  // ============================================
  describe('validatePassword', () => {
    it('should return valid for strong password (C2: all conditions pass)', () => {
      // C2: All test branches pass (length, lowercase, uppercase, digit)
      const result = validatePassword('StrongPass123');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for password too short (C2: length < MIN)', () => {
      // C2: Tests password.length < MIN_PASSWORD_LENGTH branch
      const result = validatePassword('Short1');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu phải có ít nhất 8 ký tự');
    });

    it('should return error for password too long (C2: length > MAX)', () => {
      // C2: Tests password.length > MAX_PASSWORD_LENGTH branch
      const longPassword = 'A'.repeat(129) + 'a1'; // 131 chars
      const result = validatePassword(longPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu không được vượt quá 128 ký tự');
    });

    it('should return error for no lowercase (C2: lowercase missing)', () => {
      // C2: Tests !/[a-z]/.test(password) branch
      const result = validatePassword('UPPERCASE123');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu phải chứa ít nhất một chữ cái thường');
    });

    it('should return error for no uppercase (C2: uppercase missing)', () => {
      // C2: Tests !/[A-Z]/.test(password) branch
      const result = validatePassword('lowercase123');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu phải chứa ít nhất một chữ cái hoa');
    });

    it('should return error for no digits (C2: digit missing)', () => {
      // C2: Tests !/[0-9]/.test(password) branch
      const result = validatePassword('NoDigitsHere');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu phải chứa ít nhất một chữ số');
    });

    it('should return multiple errors (C2: multiple conditions fail)', () => {
      // C2: Tests multiple error branches
      const result = validatePassword('short');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Mật khẩu phải có ít nhất 8 ký tự');
      expect(result.errors).toContain('Mật khẩu phải chứa ít nhất một chữ cái hoa');
      expect(result.errors).toContain('Mật khẩu phải chứa ít nhất một chữ số');
    });

    it('should handle edge case: exactly MIN_LENGTH (C2: boundary)', () => {
      // C2: Tests password.length === MIN_PASSWORD_LENGTH (8 chars)
      const result = validatePassword('Pass1234');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle edge case: exactly MAX_LENGTH (C2: boundary)', () => {
      // C2: Tests password.length === MAX_PASSWORD_LENGTH (128 chars)
      const maxPassword = 'A'.repeat(126) + 'a1'; // Exactly 128 chars
      const result = validatePassword(maxPassword);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // ============================================
  // AMOUNT VALIDATION - C2 Coverage
  // ============================================
  describe('validateAmount', () => {
    it('should return valid for positive number (C2: valid amount)', () => {
      // C2: Tests isNaN === false, amount >= MIN, amount <= MAX
      const result = validateAmount(1000);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for string number (C2: string input)', () => {
      // C2: Tests typeof amount === 'string' branch + parseFloat
      const result = validateAmount('5000');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error for NaN (C2: isNaN branch)', () => {
      // C2: Tests isNaN(num) === true branch
      const result = validateAmount('not a number');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Số tiền phải là một số hợp lệ');
    });

    it('should return error for amount too small (C2: amount < MIN)', () => {
      // C2: Tests num < MIN_AMOUNT branch
      const result = validateAmount(-1);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Số tiền phải lớn hơn hoặc bằng 0');
    });

    it('should return error for amount too large (C2: amount > MAX)', () => {
      // C2: Tests num > MAX_AMOUNT branch
      const result = validateAmount(1000000000); // 1 billion > 999999999

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Số tiền không được vượt quá 999999999');
    });

    it('should handle edge case: exactly MIN_AMOUNT (C2: boundary)', () => {
      // C2: Tests num === MIN_AMOUNT (0)
      const result = validateAmount(0);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle edge case: exactly MAX_AMOUNT (C2: boundary)', () => {
      // C2: Tests num === MAX_AMOUNT (999999999)
      const result = validateAmount(999999999);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle decimal numbers (C2: float values)', () => {
      const result1 = validateAmount(123.45);
      const result2 = validateAmount('678.90');

      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(true);
    });

    it('should handle empty string (C2: parseFloat edge case)', () => {
      // C2: parseFloat('') returns NaN
      const result = validateAmount('');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Số tiền phải là một số hợp lệ');
    });
  });

  // ============================================
  // DATE VALIDATION - C2 Coverage
  // ============================================
  describe('validateDate', () => {
    it('should return valid for past date (C2: valid date)', () => {
      // C2: Tests isNaN === false, date <= now
      const pastDate = new Date('2020-01-01');
      const result = validateDate(pastDate);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for today (C2: date === today)', () => {
      // C2: Tests date === now (same day)
      const today = new Date();
      const result = validateDate(today);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for string date (C2: string input)', () => {
      // C2: Tests new Date(string) branch
      const result = validateDate('2023-06-15');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error for future date (C2: date > now)', () => {
      // C2: Tests selectedDate > now branch
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const result = validateDate(futureDate);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ngày không được là ngày trong tương lai');
    });

    it('should return error for invalid date (C2: isNaN branch)', () => {
      // C2: Tests isNaN(selectedDate.getTime()) === true branch
      const result = validateDate('invalid-date');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ngày không hợp lệ');
    });

    it('should handle edge case: end of today (C2: time boundary)', () => {
      // C2: Tests date validation at 23:59:59
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 0);
      const result = validateDate(endOfToday);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  // ============================================
  // REQUIRED VALIDATION - C2 Coverage
  // ============================================
  describe('validateRequired', () => {
    it('should return true for non-empty string (C2: valid string)', () => {
      // C2: Tests typeof value === 'string' && value.trim().length > 0
      expect(validateRequired('valid')).toBe(true);
      expect(validateRequired('  text  ')).toBe(true);
    });

    it('should return false for empty string (C2: empty string)', () => {
      // C2: Tests typeof value === 'string' && value.trim().length === 0
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false); // Only whitespace
    });

    it('should return false for null (C2: null value)', () => {
      // C2: Tests value === null branch
      expect(validateRequired(null)).toBe(false);
    });

    it('should return false for undefined (C2: undefined value)', () => {
      // C2: Tests value === undefined branch
      expect(validateRequired(undefined)).toBe(false);
    });

    it('should return true for non-empty array (C2: array with items)', () => {
      // C2: Tests Array.isArray(value) && value.length > 0
      expect(validateRequired([1, 2, 3])).toBe(true);
      expect(validateRequired(['a'])).toBe(true);
    });

    it('should return false for empty array (C2: empty array)', () => {
      // C2: Tests Array.isArray(value) && value.length === 0
      expect(validateRequired([])).toBe(false);
    });

    it('should return true for other truthy values (C2: fallback branch)', () => {
      // C2: Tests return true branch (not string, not array, not null/undefined)
      expect(validateRequired(123)).toBe(true);
      expect(validateRequired(true)).toBe(true);
      expect(validateRequired({ key: 'value' })).toBe(true);
      expect(validateRequired(0)).toBe(true); // 0 is valid
    });
  });

  // ============================================
  // MIN LENGTH VALIDATION - C2 Coverage
  // ============================================
  describe('validateMinLength', () => {
    it('should return true when length >= minLength (C2: valid length)', () => {
      // C2: Tests value.length >= minLength === true
      expect(validateMinLength('hello', 5)).toBe(true);
      expect(validateMinLength('longer', 5)).toBe(true);
    });

    it('should return false when length < minLength (C2: invalid length)', () => {
      // C2: Tests value.length >= minLength === false
      expect(validateMinLength('hi', 5)).toBe(false);
      expect(validateMinLength('', 1)).toBe(false);
    });

    it('should handle edge case: exactly minLength (C2: boundary)', () => {
      // C2: Tests value.length === minLength
      expect(validateMinLength('exact', 5)).toBe(true);
    });

    it('should handle minLength = 0 (C2: edge case)', () => {
      // C2: Tests minLength === 0
      expect(validateMinLength('', 0)).toBe(true);
      expect(validateMinLength('any', 0)).toBe(true);
    });
  });

  // ============================================
  // MAX LENGTH VALIDATION - C2 Coverage
  // ============================================
  describe('validateMaxLength', () => {
    it('should return true when length <= maxLength (C2: valid length)', () => {
      // C2: Tests value.length <= maxLength === true
      expect(validateMaxLength('hello', 10)).toBe(true);
      expect(validateMaxLength('short', 10)).toBe(true);
    });

    it('should return false when length > maxLength (C2: invalid length)', () => {
      // C2: Tests value.length <= maxLength === false
      expect(validateMaxLength('too long text', 5)).toBe(false);
      expect(validateMaxLength('exceed', 3)).toBe(false);
    });

    it('should handle edge case: exactly maxLength (C2: boundary)', () => {
      // C2: Tests value.length === maxLength
      expect(validateMaxLength('exact', 5)).toBe(true);
    });

    it('should handle maxLength = 0 (C2: edge case)', () => {
      // C2: Tests maxLength === 0
      expect(validateMaxLength('', 0)).toBe(true);
      expect(validateMaxLength('a', 0)).toBe(false);
    });

    it('should handle empty string (C2: edge case)', () => {
      expect(validateMaxLength('', 10)).toBe(true);
    });
  });
});
