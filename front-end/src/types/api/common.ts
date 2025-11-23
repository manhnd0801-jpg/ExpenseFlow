/**
 * Common type definitions
 */

/**
 * API Response wrapper (matches Backend ResponseInterceptor)
 */
export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/**
 * Paginated API Response
 */
export interface TPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Error Response
 */
export interface IErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
