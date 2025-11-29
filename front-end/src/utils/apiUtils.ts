/**
 * API Response Utils
 * Helper functions to handle API response formats consistently
 */

/**
 * Extract data from API response that follows { success, data, message } format
 * Falls back to returning the whole response if format doesn't match
 */
export const extractApiResponseData = <T = any>(response: any): T => {
  if (response && typeof response === 'object' && response.success && 'data' in response) {
    return response.data;
  }
  return response;
};

/**
 * Check if response follows standard API format
 */
export const isStandardApiResponse = (response: any): boolean => {
  return (
    response &&
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    'data' in response
  );
};

/**
 * Standardize API response - ensure consistent format across all services
 * Can be used as a fallback when interceptor doesn't work properly
 */
export const standardizeApiResponse = <T = any>(response: any): T => {
  console.log('Standardizing API response:', response);

  const extracted = extractApiResponseData<T>(response);
  console.log('Extracted data:', extracted);

  return extracted;
};
