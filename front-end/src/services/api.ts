/**
 * Axios API Instance Configuration
 * Single axios instance with interceptors for all API calls
 */

import { APP_CONFIG, STORAGE_KEYS } from '@utils/constants';
import { message } from 'antd';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * API Request Config with custom options
 */
export interface IApiRequestConfig extends AxiosRequestConfig {
  showSuccessMessage?: boolean;
  successMessage?: string;
}

/**
 * Create axios instance
 */
const api: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: APP_CONFIG.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * - Auto-attach Bearer token
 * - Log requests in development
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', config.method?.toUpperCase(), config.url, config.data);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Extract data field
 * - Handle errors with user-friendly messages
 * - Handle token expiration
 */
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', response.config.url, response.data);
    }

    // Extract data field from response
    return response.data;
  },
  (error) => {
    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login';
      message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      message.error('Bạn không có quyền truy cập tài nguyên này');
      return Promise.reject(error);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      message.error('Không tìm thấy tài nguyên');
      return Promise.reject(error);
    }

    // Handle 5xx Server Error
    if (error.response?.status && error.response.status >= 500) {
      message.error('Máy chủ gặp sự cố, vui lòng thử lại sau');
      return Promise.reject(error);
    }

    // Handle custom error messages
    const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    message.error(errorMessage);

    if (import.meta.env.DEV) {
      console.error('❌ API Error:', error);
    }

    return Promise.reject(error);
  }
);

export default api;
