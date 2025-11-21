/**
 * Form Validation Utilities
 * Common validation rules and helper functions
 */

import { Rule } from 'antd/lib/form';
import dayjs from 'dayjs';

// Currency validation
export const validateAmount = (min: number = 0, max?: number): Rule => ({
  validator: (_, value) => {
    if (!value || value <= 0) {
      return Promise.reject(new Error('Số tiền phải lớn hơn 0'));
    }
    if (value < min) {
      return Promise.reject(
        new Error(`Số tiền phải từ ${min.toLocaleString('vi-VN')} VND trở lên`)
      );
    }
    if (max && value > max) {
      return Promise.reject(
        new Error(`Số tiền không được vượt quá ${max.toLocaleString('vi-VN')} VND`)
      );
    }
    return Promise.resolve();
  },
});

// Date validation
export const validateFutureDate = (): Rule => ({
  validator: (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng chọn ngày'));
    }
    if (value.isBefore(dayjs(), 'day')) {
      return Promise.reject(new Error('Ngày phải là ngày trong tương lai'));
    }
    return Promise.resolve();
  },
});

export const validateDateRange = (_startDateField: string): Rule => ({
  validator: (_rule, value) => {
    // Note: To use this validator, you need to pass the form instance
    // or use form.getFieldValue in the component
    if (!value) {
      return Promise.resolve();
    }
    // This will be validated in the component using form.getFieldValue
    return Promise.resolve();
  },
});

// Email validation
export const validateEmail = (): Rule => ({
  type: 'email',
  message: 'Email không đúng định dạng',
});

// Phone number validation (Vietnamese format)
export const validatePhoneNumber = (): Rule => ({
  validator: (_, value) => {
    if (!value) return Promise.resolve();

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(value)) {
      return Promise.reject(new Error('Số điện thoại không đúng định dạng'));
    }
    return Promise.resolve();
  },
});

// Password validation
export const validatePassword = (): Rule => ({
  validator: (_, value) => {
    if (!value) return Promise.resolve();

    if (value.length < 6) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 6 ký tự'));
    }

    // Check for at least one letter and one number
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value)) {
      return Promise.reject(new Error('Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số'));
    }

    return Promise.resolve();
  },
});

// Confirm password validation
export const validateConfirmPassword = (_passwordField: string): Rule => ({
  validator: (_rule, value) => {
    // Note: To use this validator, you need to use form.getFieldValue in the component
    // Example: validator: (_, value) => { const password = form.getFieldValue('password'); ... }
    if (!value) {
      return Promise.resolve();
    }
    // This will be validated in the component using form.getFieldValue
    return Promise.resolve();
  },
});

// Required field validation with custom message
export const validateRequired = (message: string): Rule => ({
  required: true,
  message,
});

// Text length validation
export const validateTextLength = (min: number = 0, max: number = 255): Rule => ({
  validator: (_, value) => {
    if (!value) return Promise.resolve();

    if (value.length < min) {
      return Promise.reject(new Error(`Phải có ít nhất ${min} ký tự`));
    }

    if (value.length > max) {
      return Promise.reject(new Error(`Không được vượt quá ${max} ký tự`));
    }

    return Promise.resolve();
  },
});

// Budget threshold validation (0-100%)
export const validatePercentage = (min: number = 0, max: number = 100): Rule => ({
  validator: (_, value) => {
    if (value === undefined || value === null) {
      return Promise.resolve();
    }

    if (value < min || value > max) {
      return Promise.reject(new Error(`Giá trị phải từ ${min}% đến ${max}%`));
    }

    return Promise.resolve();
  },
});

// Category name validation
export const validateCategoryName = (): Rule => ({
  validator: (_, value) => {
    if (!value) return Promise.resolve();

    // Check for special characters (allow Vietnamese)
    if (!/^[a-zA-ZÀ-ỹ\s\d-_]+$/.test(value)) {
      return Promise.reject(
        new Error('Tên danh mục chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới')
      );
    }

    return Promise.resolve();
  },
});

// Account number validation
export const validateAccountNumber = (): Rule => ({
  validator: (_, value) => {
    if (!value) return Promise.resolve();

    // Basic account number format (6-20 digits)
    if (!/^\d{6,20}$/.test(value)) {
      return Promise.reject(new Error('Số tài khoản phải từ 6-20 chữ số'));
    }

    return Promise.resolve();
  },
});

// Common validation rule sets
export const commonValidationRules = {
  // Required fields
  requiredText: [validateRequired('Vui lòng nhập thông tin này')],
  requiredSelect: [validateRequired('Vui lòng chọn một tùy chọn')],
  requiredDate: [validateRequired('Vui lòng chọn ngày')],

  // Text fields
  name: [validateRequired('Vui lòng nhập tên'), validateTextLength(2, 100)],
  description: [validateTextLength(0, 500)],
  note: [validateTextLength(0, 200)],

  // Financial fields
  amount: [validateAmount(1000)], // Minimum 1,000 VND
  percentage: [validatePercentage()],

  // Date fields
  futureDate: [validateRequired('Vui lòng chọn ngày'), validateFutureDate()],

  // Contact fields
  email: [validateEmail()],
  phone: [validatePhoneNumber()],

  // Authentication fields
  password: [validateRequired('Vui lòng nhập mật khẩu'), validatePassword()],

  // Category fields
  categoryName: [
    validateRequired('Vui lòng nhập tên danh mục'),
    validateCategoryName(),
    validateTextLength(2, 50),
  ],
};

// Form submission helpers
export const getFormErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Đã có lỗi xảy ra, vui lòng thử lại';
};

// Form field validation helpers
export const hasFieldError = (form: any, fieldName: string): boolean => {
  const fieldError = form.getFieldError(fieldName);
  return fieldError && fieldError.length > 0;
};

export const getFieldError = (form: any, fieldName: string): string => {
  const fieldErrors = form.getFieldError(fieldName);
  return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : '';
};

// Form validation status helper
export const getValidationStatus = (
  form: any,
  fieldName: string
): 'error' | 'success' | 'validating' | undefined => {
  if (hasFieldError(form, fieldName)) {
    return 'error';
  }

  const fieldValue = form.getFieldValue(fieldName);
  if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
    return 'success';
  }

  return undefined;
};

export default {
  validateAmount,
  validateFutureDate,
  validateDateRange,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
  validateTextLength,
  validatePercentage,
  validateCategoryName,
  validateAccountNumber,
  commonValidationRules,
  getFormErrorMessage,
  hasFieldError,
  getFieldError,
  getValidationStatus,
};
