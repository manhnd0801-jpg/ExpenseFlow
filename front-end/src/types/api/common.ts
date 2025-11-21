/**
 * Common type definitions
 */

/**
 * API Response wrapper
 */
export interface IApiResponse<T> {
  data: T;
  message: string;
  code: number;
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
