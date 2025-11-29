/**
 * Axios API Instance Configuration
 * Single axios instance with interceptors for all API calls
 */

import { APP_CONFIG, STORAGE_KEYS } from '@utils/constants';
import { message } from 'antd';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API Request Config with custom options
 */
export interface IApiRequestConfig extends AxiosRequestConfig {
  showSuccessMessage?: boolean;
  successMessage?: string;
}

/**
 * Extended Axios Instance with custom methods
 */
interface IApiInstance extends AxiosInstance {
  get<T = any>(url: string, config?: IApiRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: IApiRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: IApiRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: IApiRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: IApiRequestConfig): Promise<T>;
  upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T>;
  download(url: string, filename: string, params?: any): Promise<void>;
}

/**
 * Create axios instance
 */
const axiosInstance = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: APP_CONFIG.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    // Disable cache in development
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
}) as IApiInstance;

/**
 * Request Interceptor
 * - Auto-attach Bearer token
 * - Log requests in development
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
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
 * - Handle custom success messages
 * - Handle errors with user-friendly messages
 * - Handle token expiration
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse & { config: IApiRequestConfig }) => {
    if (import.meta.env.DEV) {
    }

    // Show success message if configured
    const config = response.config as IApiRequestConfig;
    if (config.showSuccessMessage && config.successMessage) {
      message.success(config.successMessage);
    }

    // Extract data field from backend response structure { success, data, message }
    console.log('Interceptor debug:', {
      hasResponseData: !!response.data,
      isObject: typeof response.data === 'object',
      hasSuccess: response.data?.success === true,
      hasDataProp: response.data?.hasOwnProperty('data'),
      successValue: response.data?.success,
      actualResponse: response.data,
    });

    // More robust check for backend response format
    if (
      response.data &&
      typeof response.data === 'object' &&
      response.data.success === true &&
      response.data.hasOwnProperty('data')
    ) {
      console.log('✅ Interceptor extracting data:', response.data.data);
      return response.data.data;
    }

    console.log('❌ Interceptor returning whole response:', response.data);
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
    }

    return Promise.reject(error);
  }
);

/**
 * Upload file with progress tracking
 */
axiosInstance.upload = async <T = any>(
  url: string,
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<T> => {
  return axiosInstance.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

/**
 * Download file
 */
axiosInstance.download = async (url: string, filename: string, params?: any): Promise<void> => {
  const response = await axiosInstance.get(url, {
    params,
    responseType: 'blob',
  });

  const blob = new Blob([response as any]);
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(link.href);
};

const api = axiosInstance;

export default api;
